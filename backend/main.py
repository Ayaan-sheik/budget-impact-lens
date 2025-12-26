"""
FastAPI Backend for Budget Impact Lens
Provides REST API endpoints and automated scraping
"""

from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio
from datetime import datetime
from typing import Dict, Optional
import os
from dotenv import load_dotenv

from scraper import run_pib_scraper, retry_analyze_policies
from supabase import create_client, Client

# Load environment variables
load_dotenv()

# Global state for tracking scraper runs
scraper_state = {
    'last_run': None,
    'last_result': None,
    'is_running': False,
    'total_runs': 0
}

# Background task for periodic scraping
async def periodic_scraper():
    """Run scraper every hour in the background"""
    while True:
        try:
            print(f"\n[{datetime.now().isoformat()}] Starting scheduled scrape...")
            await run_scraper_task()
            await asyncio.sleep(3600)  # Wait 1 hour
        except Exception as e:
            print(f"Error in periodic scraper: {str(e)}")
            await asyncio.sleep(300)  # Wait 5 minutes on error


async def run_scraper_task():
    """Execute the scraper task"""
    if scraper_state['is_running']:
        print("Scraper already running, skipping...")
        return
    
    scraper_state['is_running'] = True
    try:
        # Run scraper in thread pool to avoid blocking
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(None, run_pib_scraper)
        
        scraper_state['last_run'] = datetime.now().isoformat()
        scraper_state['last_result'] = result
        scraper_state['total_runs'] += 1
        
        print(f"Scraper completed: {result}")
    finally:
        scraper_state['is_running'] = False


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Startup
    print("🚀 Starting Budget Impact Lens API...")
    
    # Start periodic scraper task
    scraper_task = asyncio.create_task(periodic_scraper())
    
    yield
    
    # Shutdown
    print("🛑 Shutting down...")
    scraper_task.cancel()


# Initialize FastAPI app
app = FastAPI(
    title="Budget Impact Lens API",
    description="AI-powered government policy analyzer and tracker",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Supabase client
def get_supabase() -> Client:
    """Get Supabase client instance"""
    url = os.getenv('SUPABASE_URL', 'http://127.0.0.1:54321')
    key = os.getenv('SUPABASE_KEY', '')
    return create_client(url, key)


# ==================== API ENDPOINTS ====================

@app.get("/")
async def root():
    """Root endpoint - API info"""
    return {
        "name": "Budget Impact Lens API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "trigger_scrape": "POST /trigger-scrape",
            "scraper_status": "GET /scraper/status",
            "policies": "GET /policies",
            "policy_by_id": "GET /policies/{id}",
            "health": "GET /health"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "scraper": {
            "is_running": scraper_state['is_running'],
            "last_run": scraper_state['last_run'],
            "total_runs": scraper_state['total_runs']
        }
    }


@app.post("/trigger-scrape")
async def trigger_scrape(background_tasks: BackgroundTasks):
    """
    Manually trigger the RSS feed scraper
    Runs in the background without blocking the response
    """
    if scraper_state['is_running']:
        raise HTTPException(
            status_code=409,
            detail="Scraper is already running. Please wait for it to complete."
        )
    
    # Add scraper task to background
    background_tasks.add_task(run_scraper_task)
    
    return {
        "message": "Scraper started in background",
        "status": "started",
        "timestamp": datetime.now().isoformat()
    }


@app.post("/retry-analysis")
async def retry_analysis(background_tasks: BackgroundTasks, limit: int = 50):
    """
    Retry AI analysis for unanalyzed policies
    Useful when AI quota resets or becomes available again
    """
    async def run_retry_task():
        """Execute the retry analysis task"""
        try:
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(None, retry_analyze_policies, limit)
            print(f"Retry analysis completed: {result}")
        except Exception as e:
            print(f"Error in retry analysis: {str(e)}")
    
    # Add retry task to background
    background_tasks.add_task(run_retry_task)
    
    return {
        "message": f"AI analysis retry started for up to {limit} unanalyzed policies",
        "status": "started",
        "timestamp": datetime.now().isoformat()
    }


@app.get("/scraper/status")
async def get_scraper_status():
    """Get current status of the scraper"""
    return {
        "is_running": scraper_state['is_running'],
        "last_run": scraper_state['last_run'],
        "last_result": scraper_state['last_result'],
        "total_runs": scraper_state['total_runs']
    }


@app.get("/policies")
async def get_policies(
    limit: int = 50,
    offset: int = 0,
    category: Optional[str] = None,
    analyzed: Optional[bool] = None
):
    """
    Get list of policies from database
    
    Query parameters:
    - limit: Number of results (default 50, max 100)
    - offset: Pagination offset (default 0)
    - category: Filter by category (optional)
    - analyzed: Filter by analysis status (optional)
    """
    try:
        # Validate limit
        limit = min(limit, 100)
        
        supabase = get_supabase()
        query = supabase.table('policies').select('*')
        
        # Apply filters
        if category:
            query = query.eq('category', category)
        if analyzed is not None:
            query = query.eq('analyzed', analyzed)
        
        # Apply pagination and ordering
        query = query.order('created_at', desc=True).range(offset, offset + limit - 1)
        
        result = query.execute()
        
        return {
            "data": result.data,
            "count": len(result.data),
            "offset": offset,
            "limit": limit
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/policies/{policy_id}")
async def get_policy_by_id(policy_id: int):
    """Get a specific policy by ID"""
    try:
        supabase = get_supabase()
        result = supabase.table('policies').select('*').eq('id', policy_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Policy not found")
        
        return result.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/categories")
async def get_categories():
    """Get list of all available policy categories with counts"""
    try:
        supabase = get_supabase()
        result = supabase.table('policies').select('category').execute()
        
        # Count categories
        category_counts = {}
        for item in result.data:
            cat = item.get('category', 'general')
            category_counts[cat] = category_counts.get(cat, 0) + 1
        
        return {
            "categories": sorted(category_counts.keys()),
            "counts": category_counts,
            "total": sum(category_counts.values())
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/stats")
async def get_statistics():
    """Get overall statistics about policies"""
    try:
        supabase = get_supabase()
        
        # Get total count
        total_result = supabase.table('policies').select('id', count='exact').execute()
        
        # Get analyzed count
        analyzed_result = supabase.table('policies').select('id', count='exact').eq('analyzed', True).execute()
        
        # Get recent count (last 24 hours)
        from datetime import timedelta
        yesterday = (datetime.now() - timedelta(days=1)).isoformat()
        recent_result = supabase.table('policies').select('id', count='exact').gte('created_at', yesterday).execute()
        
        return {
            "total_policies": total_result.count,
            "analyzed_policies": analyzed_result.count,
            "recent_policies_24h": recent_result.count,
            "analysis_rate": f"{(analyzed_result.count / total_result.count * 100):.1f}%" if total_result.count > 0 else "0%",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== DEVELOPMENT ====================

if __name__ == "__main__":
    import uvicorn
    
    print("Starting development server...")
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
