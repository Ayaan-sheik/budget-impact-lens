"""
Add sample policies to the database for testing
"""
import os
from dotenv import load_dotenv
from supabase import create_client
from datetime import datetime
import hashlib

load_dotenv()

url = os.getenv('SUPABASE_URL')
key = os.getenv('SUPABASE_KEY')
supabase = create_client(url, key)

sample_policies = [
    {
        "title": "Government Announces 5% Reduction in GST on Electric Vehicles",
        "summary": "The Ministry of Finance has announced a significant reduction in GST rates for electric vehicles from 12% to 7%, effective from January 1, 2026. This move aims to promote clean energy and make EVs more affordable for the common people.",
        "link": "https://pib.gov.in/sample/ev-gst-reduction",
        "source": "PIB",
        "published_date": "2025-12-26",
        "category": "transportation",
        "impact_type": "percentage",
        "impact_value": -5.0,
        "old_value": 12.0,
        "new_value": 7.0,
        "affected_items": ["electric vehicles", "EVs", "electric cars"],
        "ai_description": "GST on electric vehicles reduced by 5 percentage points to make them more affordable and promote clean energy adoption.",
        "analyzed": True
    },
    {
        "title": "₹10,000 Subsidy Announced for Solar Panel Installation",
        "summary": "The government has introduced a new subsidy scheme providing ₹10,000 per household for installing solar panels. The scheme aims to promote renewable energy and reduce electricity costs for homeowners.",
        "link": "https://pib.gov.in/sample/solar-subsidy",
        "source": "PIB",
        "published_date": "2025-12-25",
        "category": "utilities",
        "impact_type": "fixed_amount",
        "impact_value": 10000.0,
        "old_value": 0.0,
        "new_value": 10000.0,
        "affected_items": ["solar panels", "renewable energy", "households"],
        "ai_description": "New subsidy of ₹10,000 per household for solar panel installation to promote renewable energy.",
        "analyzed": True
    },
    {
        "title": "Education Loan Interest Rate Reduced to 4%",
        "summary": "In a major relief to students, the government has reduced education loan interest rates from 7% to 4% for all government-backed education loans. This will benefit millions of students across the country.",
        "link": "https://pib.gov.in/sample/education-loan",
        "source": "PIB",
        "published_date": "2025-12-24",
        "category": "education",
        "impact_type": "percentage",
        "impact_value": -3.0,
        "old_value": 7.0,
        "new_value": 4.0,
        "affected_items": ["education loans", "student loans", "higher education"],
        "ai_description": "Education loan interest rates cut from 7% to 4%, providing significant savings for students.",
        "analyzed": True
    },
    {
        "title": "GST on Essential Food Items Increased from 0% to 5%",
        "summary": "The government has imposed a 5% GST on certain essential food items including rice, wheat flour, and pulses. This decision has been taken to increase revenue collection.",
        "link": "https://pib.gov.in/sample/food-gst",
        "source": "PIB",
        "published_date": "2025-12-23",
        "category": "food",
        "impact_type": "percentage",
        "impact_value": 5.0,
        "old_value": 0.0,
        "new_value": 5.0,
        "affected_items": ["rice", "wheat flour", "pulses", "essential food items"],
        "ai_description": "New 5% GST imposed on essential food items including rice, wheat flour, and pulses.",
        "analyzed": True
    },
    {
        "title": "New Healthcare Scheme: Free Health Insurance up to ₹5 Lakhs",
        "summary": "The government has launched a new healthcare scheme providing free health insurance coverage up to ₹5 lakhs for families with annual income below ₹3 lakhs.",
        "link": "https://pib.gov.in/sample/health-insurance",
        "source": "PIB",
        "published_date": "2025-12-22",
        "category": "healthcare",
        "impact_type": "fixed_amount",
        "impact_value": 500000.0,
        "old_value": 0.0,
        "new_value": 500000.0,
        "affected_items": ["health insurance", "medical coverage", "low-income families"],
        "ai_description": "Free health insurance coverage of up to ₹5 lakhs for low-income families.",
        "analyzed": True
    }
]

print("Adding sample policies to database...")
added = 0
skipped = 0

for policy in sample_policies:
    # Create hash for deduplication
    hash_string = f"{policy['title']}{policy['link']}"
    item_hash = hashlib.md5(hash_string.encode()).hexdigest()
    
    # Check if already exists
    existing = supabase.table('policies').select('id').eq('item_hash', item_hash).execute()
    
    if existing.data:
        print(f"  ⊘ Skipped (duplicate): {policy['title'][:50]}...")
        skipped += 1
        continue
    
    # Add item_hash and created_at
    policy['item_hash'] = item_hash
    policy['created_at'] = datetime.utcnow().isoformat()
    
    try:
        result = supabase.table('policies').insert(policy).execute()
        print(f"  ✓ Added: {policy['title'][:50]}...")
        added += 1
    except Exception as e:
        print(f"  ✗ Error adding {policy['title'][:30]}: {e}")

print(f"\n✅ Complete! Added {added} policies, skipped {skipped} duplicates")
