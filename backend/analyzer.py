"""
AI-powered policy analyzer for extracting structured impact data
Uses LLM to parse raw news text into actionable insights
"""

import os
import json
from google import genai
from google.genai import types
from typing import Dict, Optional
from dotenv import load_dotenv
import time

# Load environment variables
load_dotenv()

# Gemini configuration
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', os.getenv('Gemini_API_KEY', ''))
GEMINI_MODEL = os.getenv('GEMINI_MODEL', os.getenv('Gemini_Model', 'gemini-1.5-flash-latest'))

# Policy categories
CATEGORIES = [
    'transportation', 'food', 'housing', 'healthcare', 
    'education', 'utilities', 'entertainment', 'shopping',
    'savings', 'investments', 'general'
]

# Impact types
IMPACT_TYPES = ['percentage', 'fixed_amount', 'multiplier', 'binary']


def init_gemini_client():
    """Initialize Gemini client"""
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY environment variable is not set")
    client = genai.Client(api_key=GEMINI_API_KEY)
    return client


def create_extraction_prompt(title: str, summary: str) -> str:
    """
    Create a prompt for the LLM to extract structured data
    
    Args:
        title: Policy title
        summary: Policy summary/description
    
    Returns:
        Formatted prompt string
    """
    prompt = f"""You are a financial policy analyst. Extract structured information from the following government policy announcement.

POLICY TITLE: {title}

POLICY SUMMARY: {summary}

Extract the following information and return ONLY a valid JSON object (no markdown, no code blocks):

1. category: Choose ONE from: {', '.join(CATEGORIES)}
2. impact_type: Choose ONE from: {', '.join(IMPACT_TYPES)}
   - percentage: for rate changes (e.g., GST increase from 18% to 20%)
   - fixed_amount: for absolute amount changes (e.g., subsidy of ₹500)
   - multiplier: for multiplicative changes (e.g., doubled from X to 2X)
   - binary: for yes/no changes (e.g., service introduced or removed)
3. impact_value: A numeric value representing the impact
   - For percentage: the change amount (e.g., 2 for 18% to 20%)
   - For fixed_amount: the amount in rupees
   - For multiplier: the multiplication factor
   - For binary: 1 for positive, -1 for negative
4. old_value: The previous value (if mentioned, otherwise null)
5. new_value: The new value (if mentioned, otherwise null)
6. affected_items: List of specific items/services affected (e.g., ["luxury cars", "SUVs"])
7. description: A brief 1-2 sentence summary of the impact

Return ONLY this JSON structure:
{{
  "category": "...",
  "impact_type": "...",
  "impact_value": 0.0,
  "old_value": 0.0 or null,
  "new_value": 0.0 or null,
  "affected_items": [],
  "description": "..."
}}

If you cannot extract meaningful financial impact data, return null for all fields except description."""
    
    return prompt


def extract_policy_impact(title: str, summary: str, retry_count: int = 2) -> Optional[Dict]:
    """
    Use AI to extract structured impact data from policy text
    
    Args:
        title: Policy title
        summary: Policy summary
        retry_count: Number of retries on failure
    
    Returns:
        Dictionary with extracted impact data, 'QUOTA_EXCEEDED', 'MODEL_ERROR', or None
    """
    for attempt in range(retry_count + 1):
        try:
            client = init_gemini_client()
            prompt = create_extraction_prompt(title, summary)
            
            print(f"Analyzing: {title[:60]}...")
            
            full_prompt = f"""You are a precise financial policy analyst. Return only valid JSON without any markdown formatting.

{prompt}"""
            
            response = client.models.generate_content(
                model=GEMINI_MODEL,
                contents=full_prompt,
                config=types.GenerateContentConfig(
                    temperature=0.3,
                    max_output_tokens=500,
                )
            )
            
            # Extract the response content
            content = response.text.strip()
            
            # Remove markdown code blocks if present
            if content.startswith('```'):
                content = content.split('```')[1]
                if content.startswith('json'):
                    content = content[4:]
                content = content.strip()
            
            # Parse JSON
            extracted_data = json.loads(content)
            
            # Validate the extracted data
            if validate_extracted_data(extracted_data):
                print(f"  ✓ Extracted: {extracted_data['category']} impact of {extracted_data['impact_value']}")
                return extracted_data
            else:
                print(f"  ⚠ Invalid extraction data")
                return None
                
        except json.JSONDecodeError as e:
            print(f"  ✗ JSON parsing error: {str(e)}")
            if attempt < retry_count:
                time.sleep(1)
                continue
            return None
            
        except Exception as e:
            error_msg = str(e).lower()
            
            # Check if it's a quota/rate limit error
            if '429' in error_msg or 'quota' in error_msg or 'rate limit' in error_msg or 'resource_exhausted' in error_msg:
                print(f"  ⚠️ AI quota exceeded (attempt {attempt + 1}/{retry_count + 1})")
                if attempt < retry_count:
                    wait_time = (2 ** attempt) * 2  # Exponential backoff: 2s, 4s
                    print(f"     Waiting {wait_time}s before retry...")
                    time.sleep(wait_time)
                    continue
                else:
                    print(f"     Quota exhausted - returning special marker")
                    return 'QUOTA_EXCEEDED'  # Special marker
            
            # Check if it's a model error
            elif '404' in error_msg or 'not found' in error_msg:
                print(f"  ⚠️ Model '{GEMINI_MODEL}' not found")
                return 'MODEL_ERROR'  # Special marker
            
            # Other errors
            print(f"  ✗ Extraction error: {str(e)[:100]}")
            if attempt < retry_count:
                time.sleep(1)
                continue
            return None
    
    # If all retries failed
    return None


def validate_extracted_data(data: Dict) -> bool:
    """
    Validate that extracted data has required fields and valid values
    
    Args:
        data: Extracted data dictionary
    
    Returns:
        True if data is valid, False otherwise
    """
    if not isinstance(data, dict):
        return False
    
    # Check required fields
    required_fields = ['category', 'impact_type', 'impact_value', 'description']
    for field in required_fields:
        if field not in data:
            return False
    
    # Validate category
    if data['category'] and data['category'] not in CATEGORIES:
        return False
    
    # Validate impact_type
    if data['impact_type'] and data['impact_type'] not in IMPACT_TYPES:
        return False
    
    # Validate impact_value is numeric
    if data['impact_value'] is not None:
        try:
            float(data['impact_value'])
        except (ValueError, TypeError):
            return False
    
    return True


def analyze_batch(items: list) -> list:
    """
    Analyze a batch of policy items and extract impact data
    Gracefully handles quota exceeded and model errors
    
    Args:
        items: List of policy items with title and summary
    
    Returns:
        List of items with added impact analysis (or marked as unanalyzed if quota hit)
    """
    print("\n" + "=" * 60)
    print("AI IMPACT EXTRACTION")
    print("=" * 60)
    
    analyzed_items = []
    success_count = 0
    failure_count = 0
    ai_quota_exhausted = False
    
    for i, item in enumerate(items):
        title = item.get('title', '')
        summary = item.get('summary', '')
        
        if ai_quota_exhausted:
            # Skip remaining items if quota is exhausted
            print(f"\n[{i+1}/{len(items)}] Skipping (quota exhausted): {title[:60]}...")
            item.update({
                'category': 'general',
                'impact_type': None,
                'impact_value': None,
                'old_value': None,
                'new_value': None,
                'affected_items': [],
                'ai_description': None,
                'analyzed': False
            })
            analyzed_items.append(item)
            failure_count += 1
            continue
        
        print(f"\n[{i+1}/{len(items)}] Analyzing...")
        
        # Extract impact data
        impact_data = extract_policy_impact(title, summary)
        
        # Handle special error markers
        if impact_data == 'QUOTA_EXCEEDED':
            ai_quota_exhausted = True
            print(f"  ⚠️ AI quota exhausted - saving remaining items without analysis")
            item.update({
                'category': 'general',
                'impact_type': None,
                'impact_value': None,
                'old_value': None,
                'new_value': None,
                'affected_items': [],
                'ai_description': None,
                'analyzed': False
            })
            failure_count += 1
        elif impact_data == 'MODEL_ERROR':
            ai_quota_exhausted = True  # Stop trying if model doesn't exist
            print(f"  ⚠️ Model error - saving remaining items without analysis")
            item.update({
                'category': 'general',
                'impact_type': None,
                'impact_value': None,
                'old_value': None,
                'new_value': None,
                'affected_items': [],
                'ai_description': None,
                'analyzed': False
            })
            failure_count += 1
        elif impact_data:
            # Merge impact data with original item
            item.update({
                'category': impact_data.get('category'),
                'impact_type': impact_data.get('impact_type'),
                'impact_value': impact_data.get('impact_value'),
                'old_value': impact_data.get('old_value'),
                'new_value': impact_data.get('new_value'),
                'affected_items': impact_data.get('affected_items', []),
                'ai_description': impact_data.get('description'),
                'analyzed': True
            })
            success_count += 1
        else:
            # Mark as unanalyzed
            item.update({
                'category': 'general',
                'impact_type': None,
                'impact_value': None,
                'old_value': None,
                'new_value': None,
                'affected_items': [],
                'ai_description': None,
                'analyzed': False
            })
            failure_count += 1
        
        analyzed_items.append(item)
        
        # Small delay to avoid rate limits (only if not quota exhausted)
        if i < len(items) - 1 and not ai_quota_exhausted and success_count > 0:
            time.sleep(0.5)
    
    print("\n" + "-" * 60)
    if ai_quota_exhausted:
        print(f"⚠️ Analysis incomplete: {success_count} successful, {failure_count} skipped (quota/model error)")
        print("💡 Run 'python3 scraper.py retry' later to analyze remaining items")
    else:
        print(f"✅ Analysis complete: {success_count} successful, {failure_count} failed")
    print("-" * 60)
    
    return analyzed_items


if __name__ == "__main__":
    # Test the analyzer
    test_title = "Government increases GST on luxury cars from 28% to 30%"
    test_summary = "The Ministry of Finance announced a 2 percentage point increase in GST rates for luxury vehicles priced above ₹40 lakhs, effective from next month."
    
    result = extract_policy_impact(test_title, test_summary)
    print("\nTest Result:")
    print(json.dumps(result, indent=2))
