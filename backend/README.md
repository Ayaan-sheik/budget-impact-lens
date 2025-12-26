# Budget Impact Lens - Backend

AI-powered scraper and analyzer for government financial policies.

## Architecture

```
RSS Feed → Scraper → AI Analyzer → Supabase Database
                ↑
           FastAPI Background Tasks (runs every hour)
```

## Flow

### 1. **Scrape** (`scraper.py`)
- Fetches RSS feed from PIB Government (Press Information Bureau)
- Filters news using financial keywords (GST, Tax, Subsidy, etc.)
- Example input: "Government increases GST on luxury cars from 28% to 30%"

### 2. **Analyze** (`analyzer.py`)
- Sends raw text to OpenAI/Claude LLM
- Extracts structured data:
  - **category**: transportation, food, housing, etc.
  - **impact_type**: percentage, fixed_amount, multiplier, binary
  - **impact_value**: Numeric impact (e.g., 2 for a 2% increase)
  - **old_value**: Previous rate (28)
  - **new_value**: New rate (30)
  - **affected_items**: ["luxury cars", "SUVs"]
- Example output:
  ```json
  {
    "category": "transportation",
    "impact_type": "percentage",
    "impact_value": 2,
    "old_value": 28,
    "new_value": 30,
    "affected_items": ["luxury cars"],
    "description": "GST increased by 2% on luxury vehicles"
  }
  ```

### 3. **Store**
- Saves to Supabase `policies` table with all extracted fields
- Prevents duplicates using content hash
- Tracks analysis status and timestamps

## Setup

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Configure Environment
Copy `.env.example` to `.env` and fill in your credentials:
```bash
cp .env.example .env
```

Required variables:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_KEY`: Supabase anon/service key
- `OPENAI_API_KEY`: OpenAI API key

### 3. Database Schema
Create a `policies` table in Supabase with these columns:
```sql
CREATE TABLE policies (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT,
  link TEXT,
  published_date TEXT,
  source TEXT DEFAULT 'PIB',
  item_hash TEXT UNIQUE,
  
  -- AI Extracted Fields
  category TEXT,
  impact_type TEXT,
  impact_value NUMERIC,
  old_value NUMERIC,
  new_value NUMERIC,
  affected_items TEXT[],
  ai_description TEXT,
  analyzed BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Usage

### Start the FastAPI Server (Recommended)
```bash
python main.py
```

This will:
1. Start the API server on http://localhost:8000
2. Automatically run the scraper every hour
3. Provide REST API endpoints for frontend

**API Endpoints:**
- `GET /` - API documentation
- `GET /health` - Health check
- `POST /trigger-scrape` - Manually trigger scraper
- `GET /scraper/status` - Get scraper status
- `GET /policies` - List all policies (with filters)
- `GET /policies/{id}` - Get specific policy
- `GET /categories` - Get category statistics
- `GET /stats` - Get overall statistics

### Manual Scraping (Standalone)
```bash
python scraper.py
```

This will:
1. Fetch latest RSS feed from PIB
2. Filter for financial policies
3. Analyze each policy with AI
4. Save to Supabase

### Test the Analyzer
```bash
python analyzer.py
```

Runs a test extraction on sample data.

## Automation

### Background Tasks
The FastAPI server automatically runs the scraper every hour using asyncio tasks. This ensures:
- Fresh policy data without manual intervention
- Non-blocking background execution
- Automatic error recovery and retry

### Manual Trigger
You can also trigger scraping on-demand via API:
```bash
curl -X POST http://localhost:8000/trigger-scrape
```

Response:
```json
{
  "message": "Scraper started in background",
  "status": "started",
  "timestamp": "2025-12-26T10:30:00"
}
```

### Monitoring
Check scraper status:
```bash
curl http://localhost:8000/scraper/status
```

Response:
```json
{
  "is_running": false,
  "last_run": "2025-12-26T10:30:00",
  "last_result": {
    "status": "success",
    "items_saved": 10,
    "items_skipped": 2
  },
  "total_runs": 5
}
```

## Categories

Policies are categorized into:
- `transportation` - Vehicle taxes, fuel prices, transport subsidies
- `food` - Food subsidies, agriculture policies, GST on food items
- `housing` - Housing loans, property taxes, real estate
- `healthcare` - Medical subsidies, health insurance, hospital rates
- `education` - Education fees, student loans, scholarships
- `utilities` - Electricity, water, gas rates
- `entertainment` - Entertainment tax, cinema tickets
- `shopping` - Retail GST, e-commerce policies
- `savings` - Interest rates, savings schemes
- `investments` - Investment tax benefits, capital gains
- `general` - Other financial policies

## Impact Types

- **percentage**: Rate changes (e.g., tax increased from 10% to 12%)
- **fixed_amount**: Absolute amounts (e.g., ₹500 subsidy)
- **multiplier**: Multiplicative changes (e.g., doubled from X to 2X)
- **binary**: Yes/no changes (e.g., service introduced or discontinued)

## Example Output

```
============================================================
PIB Financial Policy RSS Scraper
============================================================
Fetching RSS feed from: https://www.pib.gov.in/RssHome.aspx?CategoryId=2
Found 50 total entries in feed
Filtered to 12 financial policy items

============================================================
AI IMPACT EXTRACTION
============================================================
Analyzing: Government increases GST on luxury cars from 28% to 30%...
  ✓ Extracted: transportation impact of 2
Analyzing: New subsidy scheme for farmers announced...
  ✓ Extracted: food impact of 5000
...

============================================================
SUMMARY
============================================================
Total items processed: 12
Successfully saved: 10
Skipped (duplicates): 2
Errors: 0
============================================================
```

## Error Handling

- Network errors: Retries RSS feed fetching
- AI failures: Saves policy without analysis (analyzed=false)
- Duplicate detection: Skips existing items by hash
- Validation: Ensures AI output matches expected schema

## Cost Optimization

- Uses `gpt-4o-mini` by default (cheapest, fast)
- Limited to 500 tokens per analysis
- Temperature: 0.3 for consistent extraction
- Only processes new items (no re-analysis)
