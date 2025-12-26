import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
supabase = create_client(url, key)

try:
    response = supabase.table("policies").select("*").limit(1).execute()
    print("✅ Successfully connected to Supabase!")
except Exception as e:
    print(f"❌ Connection failed: {e}")