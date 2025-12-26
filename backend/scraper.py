"""
Web Scraper for Government Financial Policies
Fetches, filters, and stores financial policy news in Supabase using Crawl4AI
"""

import os
import asyncio
from datetime import datetime
from supabase import create_client, Client
import hashlib
from analyzer import analyze_batch
from crawl4ai import AsyncWebCrawler, CrawlerRunConfig, CacheMode
from crawl4ai.extraction_strategy import LLMExtractionStrategy
import re
from typing import List, Dict
import requests
from bs4 import BeautifulSoup

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Keywords to identify financial policies
FINANCIAL_KEYWORDS = [
    'GST', 'Tax', 'Subsidy', 'Rate', 'Budget', 'Finance',
    'Economic', 'Fiscal', 'Revenue', 'Tariff', 'Duty',
    'Customs', 'Income Tax', 'Direct Tax', 'Indirect Tax',
    'Cess', 'Rebate', 'Exemption', 'Credit', 'Loan',
    'Policy', 'Government', 'Ministry', 'Scheme'
]

# Government websites to scrape
SCRAPE_URLS = [
    {
        'url': 'https://pib.gov.in/allRel.aspx',
        'name': 'PIB Press Releases',
        'selector': '.content-area',
    },
    {
        'url': 'https://www.incometax.gov.in/iec/foportal/',
        'name': 'Income Tax Portal',
        'selector': '.press-release',
    },
]

# Supabase configuration
SUPABASE_URL = os.getenv('SUPABASE_URL', 'http://127.0.0.1:54321')
SUPABASE_KEY = os.getenv('SUPABASE_KEY', 'your-anon-key-here')

def init_supabase() -> Client:
    """Initialize Supabase client"""
    return create_client(SUPABASE_URL, SUPABASE_KEY)


def is_financial_policy(title: str, summary: str) -> bool:
    """
    Check if the item is related to financial policy based on keywords
    
    Args:
        title: The title of the item
        summary: The summary/description of the item
    
    Returns:
        True if item contains financial keywords, False otherwise
    """
    combined_text = f"{title} {summary}".lower()
    
    for keyword in FINANCIAL_KEYWORDS:
        if keyword.lower() in combined_text:
            return True
    
    return False


def generate_item_hash(title: str, link: str) -> str:
    """
    Generate a unique hash for an item to avoid duplicates
    
    Args:
        title: The title of the item
        link: The link to the item
    
    Returns:
        MD5 hash string
    """
    unique_string = f"{title}{link}"
    return hashlib.md5(unique_string.encode()).hexdigest()


def scrape_with_bs4(url: str, source_name: str) -> List[Dict]:
    """
    Scrape using BeautifulSoup4 (fallback for simple sites)
    
    Args:
        url: Website URL to scrape
        source_name: Name of the source
    
    Returns:
        List of extracted policy items
    """
    print(f"\n🌐 Scraping with BeautifulSoup: {source_name}")
    print(f"   URL: {url}")
    
    items = []
    
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Find article/news items - common patterns
        articles = soup.find_all(['article', 'div'], class_=re.compile(r'(news|article|story|post|press|release)', re.I), limit=20)
        
        if not articles:
            # Try other common selectors
            articles = soup.find_all('h2', limit=20) + soup.find_all('h3', limit=20)
        
        print(f"   ✓ Found {len(articles)} potential articles")
        
        for article in articles:
            title_elem = article.find(['h1', 'h2', 'h3', 'h4', 'a'])
            if not title_elem:
                title_elem = article
            
            title = title_elem.get_text(strip=True)
            if not title or len(title) < 10:
                continue
            
            # Get link
            link_elem = article.find('a', href=True)
            link = link_elem['href'] if link_elem else url
            if link.startswith('/'):
                from urllib.parse import urljoin
                link = urljoin(url, link)
            
            # Get summary
            summary_elem = article.find(['p', 'div'])
            summary = summary_elem.get_text(strip=True) if summary_elem else title
            
            # Check if financial policy
            if is_financial_policy(title, summary):
                item_hash = generate_item_hash(title, link)
                items.append({
                    'title': title[:200],
                    'summary': summary[:500],
                    'link': link,
                    'published_date': datetime.utcnow().isoformat(),
                    'source': source_name,
                    'item_hash': item_hash,
                    'created_at': datetime.utcnow().isoformat()
                })
        
        print(f"   ✓ Extracted {len(items)} financial policy items")
        
    except Exception as e:
        print(f"   ✗ Error: {str(e)[:100]}")
    
    return items


async def scrape_with_crawl4ai(url: str, source_name: str) -> List[Dict]:
    """
    Scrape a government website using Crawl4AI
    
    Args:
        url: Website URL to scrape
        source_name: Name of the source
    
    Returns:
        List of extracted policy items
    """
    print(f"\n🌐 Scraping: {source_name}")
    print(f"   URL: {url}")
    
    items = []
    
    try:
        # Configure crawler - using simple config
        config = CrawlerRunConfig(
            cache_mode=CacheMode.BYPASS,
            page_timeout=30000,
            wait_for="networkidle"
        )
        
        async with AsyncWebCrawler(headless=True, verbose=False) as crawler:
            # Crawl the page
            result = await crawler.arun(url=url, config=config)
            
            if not result.success:
                print(f"   ✗ Failed to crawl: {result.error_message}")
                return items
            
            # Extract content
            markdown = result.markdown[:5000]  # Limit for performance
            
            print(f"   ✓ Page loaded, extracting content...")
            
            # Parse for policy announcements
            # Simple pattern matching for now
            lines = markdown.split('\n')
            current_item = {'title': '', 'content': '', 'link': url}
            
            for line in lines:
                line = line.strip()
                if not line:
                    if current_item['title'] and current_item['content']:
                        # Check if it's financial policy
                        if is_financial_policy(current_item['title'], current_item['content']):
                            item_hash = generate_item_hash(current_item['title'], current_item['link'])
                            items.append({
                                'title': current_item['title'][:200],
                                'summary': current_item['content'][:500],
                                'link': current_item['link'],
                                'published_date': datetime.utcnow().isoformat(),
                                'source': source_name,
                                'item_hash': item_hash,
                                'created_at': datetime.utcnow().isoformat()
                            })
                        current_item = {'title': '', 'content': '', 'link': url}
                    continue
                
                # Check if line looks like a title (starts with #, or is all caps, or has specific markers)
                if line.startswith('#'):
                    if current_item['title']:
                        current_item['content'] += ' ' + line
                    else:
                        current_item['title'] = line.replace('#', '').strip()
                elif any(keyword.lower() in line.lower() for keyword in FINANCIAL_KEYWORDS[:10]):
                    if not current_item['title']:
                        current_item['title'] = line
                    else:
                        current_item['content'] += ' ' + line
                else:
                    current_item['content'] += ' ' + line
            
            # Add last item if exists
            if current_item['title'] and current_item['content']:
                if is_financial_policy(current_item['title'], current_item['content']):
                    item_hash = generate_item_hash(current_item['title'], current_item['link'])
                    items.append({
                        'title': current_item['title'][:200],
                        'summary': current_item['content'][:500],
                        'link': current_item['link'],
                        'published_date': datetime.utcnow().isoformat(),
                        'source': source_name,
                        'item_hash': item_hash,
                        'created_at': datetime.utcnow().isoformat()
                    })
            
            print(f"   ✓ Extracted {len(items)} financial policy items")
            
    except Exception as e:
        print(f"   ✗ Error: {str(e)[:100]}")
    
    return items


async def fetch_policies() -> List[Dict]:
    """
    Fetch policies from multiple government sources
    
    Returns:
        List of policy items
    """
    all_items = []
    
    print("=" * 60)
    print("Government Policy Web Scraper")
    print("=" * 60)
    
    # Use BeautifulSoup for reliable news sources
    news_sources = [
        ('https://economictimes.indiatimes.com/news/economy/policy', 'Economic Times'),
        ('https://www.thehindu.com/business/', 'The Hindu Business'),
        ('https://www.business-standard.com/economy-policy', 'Business Standard'),
    ]
    
    for url, name in news_sources:
        try:
            items = scrape_with_bs4(url, name)
            all_items.extend(items)
            if len(all_items) >= 10:  # Stop after getting enough items
                break
        except Exception as e:
            print(f"   ✗ Skipping {name}: {str(e)[:60]}")
            continue
    
    print(f"\n📊 Total items scraped: {len(all_items)}")
    return all_items

def save_to_supabase(supabase: Client, items: list) -> dict:
    """
    Save new financial policy items to Supabase
    
    Args:
        supabase: Supabase client instance
        items: List of items to save
    
    Returns:
        Dictionary with counts of saved and skipped items
    """
    saved_count = 0
    skipped_count = 0
    error_count = 0
    
    for item in items:
        try:
            # Check if item already exists using the hash
            existing = supabase.table('policies').select('id').eq('item_hash', item['item_hash']).execute()
            
            if existing.data and len(existing.data) > 0:
                print(f"  ⊘ Skipping duplicate: {item['title'][:50]}...")
                skipped_count += 1
                continue
            
            # Insert new item
            result = supabase.table('policies').insert(item).execute()
            print(f"  ✓ Saved: {item['title'][:50]}...")
            saved_count += 1
            
        except Exception as e:
            print(f"  ✗ Error saving '{item['title'][:50]}...': {str(e)[:100]}")
            error_count += 1
    
    return {
        'saved': saved_count,
        'skipped': skipped_count,
        'errors': error_count
    }


def scrape_and_store() -> dict:
    """
    Main function to scrape websites and store financial policies
    
    Returns:
        Dictionary with scraping results and statistics
    """
    try:
        # Run async scraping
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        items = loop.run_until_complete(fetch_policies())
        loop.close()
        
        if not items:
            print("\n⚠ No financial policy items found.")
            print("💡 Tip: You can manually add policies using add_sample_data.py")
            return {'status': 'success', 'message': 'No financial policy items found', 'items_saved': 0}
        
        # Try AI analysis with graceful fallback
        print(f"\n🤖 Attempting AI analysis for {len(items)} items...")
        analyzed_items = analyze_batch(items)
        
        # Check if any items failed analysis (None returned = quota issue)
        ai_available = any(item.get('analyzed', False) for item in analyzed_items)
        if not ai_available:
            print("\n⚠️  AI analysis unavailable - policies will be saved without analysis")
            print("💡 Run retry_analyze_policies() later to analyze pending items")
        
        # Initialize Supabase and save items
        print(f"\n💾 Saving to database...")
        supabase = init_supabase()
        results = save_to_supabase(supabase, analyzed_items)
        
        print("\n" + "=" * 60)
        print("SUMMARY")
        print("=" * 60)
        print(f"Total items scraped: {len(items)}")
        print(f"Successfully saved: {results['saved']}")
        print(f"Skipped (duplicates): {results['skipped']}")
        print(f"Errors: {results['errors']}")
        print("=" * 60)
        
        return {
            'status': 'success',
            'total_entries': len(items),
            'financial_items': len(items),
            'items_saved': results['saved'],
            'items_skipped': results['skipped'],
            'errors': results['errors']
        }
        
    except Exception as e:
        print(f"\n❌ Fatal error: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            'status': 'error',
            'message': str(e),
            'items_saved': 0
        }


def retry_analyze_policies(limit: int = 50) -> dict:
    """
    Retry AI analysis for policies that haven't been analyzed yet
    Useful when AI quota resets or becomes available again
    
    Args:
        limit: Maximum number of policies to analyze
    
    Returns:
        Dictionary with analysis results
    """
    print("\n" + "=" * 60)
    print("AI Analysis Retry for Unanalyzed Policies")
    print("=" * 60)
    
    try:
        # Initialize Supabase
        supabase = init_supabase()
        
        # Fetch unanalyzed policies
        result = supabase.table('policies').select('*').eq('analyzed', False).limit(limit).execute()
        unanalyzed = result.data
        
        if not unanalyzed:
            print("\n✅ All policies are already analyzed!")
            return {'status': 'success', 'analyzed': 0, 'message': 'No unanalyzed policies found'}
        
        print(f"\n📊 Found {len(unanalyzed)} unanalyzed policies")
        print(f"🤖 Starting AI analysis...\n")
        
        # Prepare items for analysis
        items_to_analyze = [{
            'title': p['title'],
            'summary': p['summary'],
            'link': p['link'],
            'published_date': p['published_date'],
            'source': p['source'],
            'item_hash': p['item_hash'],
            'created_at': p['created_at']
        } for p in unanalyzed]
        
        # Analyze with AI
        analyzed_items = analyze_batch(items_to_analyze)
        
        # Update database with analyzed data
        success_count = 0
        failed_count = 0
        
        for i, item in enumerate(analyzed_items):
            policy_id = unanalyzed[i]['id']
            
            if item.get('analyzed', False):
                try:
                    supabase.table('policies').update(item).eq('id', policy_id).execute()
                    print(f"  ✓ Analyzed: {item['title'][:50]}...")
                    success_count += 1
                except Exception as e:
                    print(f"  ✗ Update failed: {str(e)[:60]}")
                    failed_count += 1
            else:
                print(f"  ⊘ Analysis unavailable: {item['title'][:50]}...")
                failed_count += 1
        
        print("\n" + "=" * 60)
        print("RETRY ANALYSIS SUMMARY")
        print("=" * 60)
        print(f"Successfully analyzed: {success_count}")
        print(f"Failed/Unavailable: {failed_count}")
        print("=" * 60)
        
        return {
            'status': 'success',
            'analyzed': success_count,
            'failed': failed_count,
            'total': len(unanalyzed)
        }
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            'status': 'error',
            'message': str(e),
            'analyzed': 0
        }


def retry_analyze_policies(limit: int = 50) -> dict:
    """
    Retry AI analysis for policies that haven't been analyzed yet
    Useful when AI quota resets or becomes available again
    
    Args:
        limit: Maximum number of policies to analyze
    
    Returns:
        Dictionary with analysis results
    """
    print("\n" + "=" * 60)
    print("AI Analysis Retry for Unanalyzed Policies")
    print("=" * 60)
    
    try:
        # Initialize Supabase
        supabase = init_supabase()
        
        # Fetch unanalyzed policies
        result = supabase.table('policies').select('*').eq('analyzed', False).limit(limit).execute()
        unanalyzed = result.data
        
        if not unanalyzed:
            print("\n✅ All policies are already analyzed!")
            return {'status': 'success', 'analyzed': 0, 'message': 'No unanalyzed policies found'}
        
        print(f"\n📊 Found {len(unanalyzed)} unanalyzed policies")
        
        # Prepare items for analysis
        items_to_analyze = [{
            'title': p['title'],
            'summary': p['summary'],
            'link': p['link'],
            'published_date': p['published_date'],
            'source': p['source'],
            'item_hash': p['item_hash'],
            'created_at': p['created_at']
        } for p in unanalyzed]
        
        # Analyze with AI
        analyzed_items = analyze_batch(items_to_analyze)
        
        # Update database with analyzed data
        success_count = 0
        failed_count = 0
        
        for i, item in enumerate(analyzed_items):
            policy_id = unanalyzed[i]['id']
            
            if item.get('analyzed', False):
                try:
                    supabase.table('policies').update(item).eq('id', policy_id).execute()
                    print(f"  ✓ Updated: {item['title'][:50]}...")
                    success_count += 1
                except Exception as e:
                    print(f"  ✗ Update failed: {str(e)[:60]}")
                    failed_count += 1
            else:
                print(f"  ⊘ Still unanalyzed: {item['title'][:50]}...")
                failed_count += 1
        
        print("\n" + "=" * 60)
        print("RETRY ANALYSIS SUMMARY")
        print("=" * 60)
        print(f"Successfully analyzed: {success_count}")
        print(f"Failed/Unavailable: {failed_count}")
        print("=" * 60)
        
        return {
            'status': 'success',
            'analyzed': success_count,
            'failed': failed_count,
            'total': len(unanalyzed)
        }
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            'status': 'error',
            'message': str(e),
            'analyzed': 0
        }


def run_pib_scraper():
    """
    Wrapper function for background task execution
    Catches all exceptions to prevent background task failures
    """
    try:
        return scrape_and_store()
    except Exception as e:
        print(f"Scraper error: {str(e)}")
        return {
            'status': 'error',
            'message': str(e),
            'items_saved': 0
        }


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == 'retry':
        # Run retry analysis
        result = retry_analyze_policies()
        print(f"\n✅ Retry result: {result}")
    else:
        # Run normal scraping
        result = scrape_and_store()
        print(f"\n✅ Final result: {result}")
