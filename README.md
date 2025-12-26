# Budget Impact Lens 💰

AI-powered government policy analyzer that tracks financial policies and their impact on your budget.

## 🚀 Features

- **Automatic Policy Scraping**: Fetches latest government financial policies from news sources
- **AI Analysis**: Uses Google Gemini to extract structured impact data
- **Background Scraper**: Runs automatically on a schedule
- **Real-time Feed**: Live policy updates with impact indicators
- **Budget Tracking**: Personalized budget impact analysis

---

## 📋 Prerequisites

Before you begin, ensure you have:

- **Python 3.10+** installed
- **Node.js 18+** or **Bun** installed
- **Git** installed
- **Supabase** account (free tier works)
- **Google Gemini API** key (free tier available)

---

## 🛠️ Local Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/Ayaan-sheik/budget-impact-lens.git
cd budget-impact-lens
```

---

### 2. Backend Setup

#### Step 2.1: Navigate to Backend Directory

```bash
cd backend
```

#### Step 2.2: Create Python Virtual Environment

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

#### Step 2.3: Install Dependencies

```bash
pip install -r requirements.txt
```

#### Step 2.4: Set Up Supabase

1. Go to https://supabase.com and create a free account
2. Create a new project
3. Go to **Settings** → **API** and copy:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **Anon/Public Key** (starts with `eyJhbGci...`)

4. Go to **SQL Editor** and run this schema:

```sql
-- Create policies table
CREATE TABLE IF NOT EXISTS policies (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    summary TEXT,
    link TEXT,
    published_date TIMESTAMPTZ,
    source TEXT,
    item_hash TEXT UNIQUE,
    category TEXT DEFAULT 'general',
    impact_type TEXT,
    impact_value NUMERIC,
    old_value NUMERIC,
    new_value NUMERIC,
    affected_items TEXT[],
    ai_description TEXT,
    analyzed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_policies_category ON policies(category);
CREATE INDEX IF NOT EXISTS idx_policies_analyzed ON policies(analyzed);
CREATE INDEX IF NOT EXISTS idx_policies_created_at ON policies(created_at DESC);
```

#### Step 2.5: Get Google Gemini API Key

1. Go to https://aistudio.google.com/app/apikey
2. Click **Create API Key**
3. Copy the API key

#### Step 2.6: Create Environment File

Create a file named `.env` in the `backend` directory:

```bash
nano .env  # or use any text editor
```

Add the following content (replace with your actual values):

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key-here

# Gemini AI Configuration
GEMINI_API_KEY=your-gemini-api-key-here
GEMINI_MODEL=gemini-2.5-flash

# Scraper Configuration
SCRAPE_INTERVAL=3600              # 1 hour (in seconds)
RUN_SCRAPER_ON_STARTUP=true       # Run scraper on server start
ENVIRONMENT=development           # development, staging, or production

# Optional: OpenAI (not currently used)
OPENAI_API_KEY=sk-your-openai-key-here
OPENAI_MODEL=gpt-4o-mini
```

**Save and close the file.**

#### Step 2.7: Test Database Connection

```bash
python3 test_db.py
```

You should see: `✅ Database connection successful!`

#### Step 2.8: Add Sample Data (Optional)

```bash
python3 add_sample_data.py
```

This adds 5 sample policies to test the system.

#### Step 2.9: Start Backend Server

```bash
# Development mode (with auto-reload)
fastapi dev main.py

# OR Production mode
fastapi run main.py
```

The backend will start at: **http://localhost:8000**

You should see:
```
============================================================
🚀 Budget Impact Lens API - Starting Up
============================================================
📍 Environment: development
⏰ Scrape interval: 3600s (60 minutes)
🔄 Run on startup: True
🤖 AI Model: gemini-2.5-flash
============================================================
```

#### Step 2.10: Test Backend (New Terminal)

```bash
# Health check
curl http://localhost:8000/health

# Get policies
curl http://localhost:8000/policies?limit=5
```

---

### 3. Frontend Setup

#### Step 3.1: Open New Terminal and Navigate to Frontend

```bash
cd ../frontend  # or: cd /path/to/budget-impact-lens/frontend
```

#### Step 3.2: Install Dependencies

**Using npm:**
```bash
npm install
```

**OR using Bun:**
```bash
bun install
```

#### Step 3.3: Create Environment File

Create a file named `.env.local` in the `frontend` directory:

```bash
nano .env.local  # or use any text editor
```

Add the following content:

```bash
# Backend API Configuration
# For local development
VITE_API_URL=http://localhost:8000

# For production deployment (update with your deployed backend URL)
# VITE_API_URL=https://your-backend.onrender.com
```

**Save and close the file.**

#### Step 3.4: Start Frontend Development Server

**Using npm:**
```bash
npm run dev
```

**OR using Bun:**
```bash
bun dev
```

The frontend will start at: **http://localhost:8080** (or another port if 8080 is in use)

---

### 4. Access the Application

1. **Open your browser** and go to: http://localhost:8080
2. **Explore the app:**
   - Home page: Landing page with features
   - Feed page: `/feed` - View live policy updates
   - Scan page: `/scan` - Scan receipts (feature in progress)
   - Profile: `/profile` - Budget tracking

---

## 📂 Project Structure

```
budget-impact-lens/
├── backend/                  # FastAPI Backend
│   ├── main.py              # API server with background scraper
│   ├── scraper.py           # Web scraper for policies
│   ├── analyzer.py          # AI analysis using Gemini
│   ├── requirements.txt     # Python dependencies
│   ├── .env                 # Environment variables (create this)
│   └── test_db.py          # Database connection test
│
├── frontend/                # React + Vite Frontend
│   ├── src/
│   │   ├── pages/          # React pages
│   │   ├── components/     # Reusable components
│   │   └── main.tsx        # Entry point
│   ├── package.json        # Node dependencies
│   └── .env.local          # Environment variables (create this)
│
├── supabase/               # Database migrations
└── README.md               # This file
```

---

## 🧪 Testing the System

### Test Backend API

```bash
# Health check
curl http://localhost:8000/health

# Get policies
curl http://localhost:8000/policies?limit=10

# Trigger manual scrape
curl -X POST http://localhost:8000/trigger-scrape

# Check scraper status
curl http://localhost:8000/scraper/status

# Retry AI analysis for unanalyzed policies
curl -X POST http://localhost:8000/retry-analysis
```

### Test Frontend

1. Open http://localhost:8080/feed
2. Check browser console (F12) for any errors
3. Verify policies are loading from backend
4. Test the refresh button

### Run Scraper Manually

```bash
cd backend
source venv/bin/activate
python3 scraper.py
```

### Retry AI Analysis

```bash
python3 scraper.py retry
```

---

## ⚙️ Configuration Options

### Backend Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SUPABASE_URL` | - | Your Supabase project URL |
| `SUPABASE_KEY` | - | Supabase anon/public key |
| `GEMINI_API_KEY` | - | Google Gemini API key |
| `GEMINI_MODEL` | `gemini-2.5-flash` | Gemini model to use |
| `SCRAPE_INTERVAL` | `3600` | Seconds between auto-scrapes |
| `RUN_SCRAPER_ON_STARTUP` | `true` | Run scraper when server starts |
| `ENVIRONMENT` | `development` | Environment name |

### Frontend Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:8000` | Backend API URL |

---

## 🐛 Troubleshooting

### Backend Issues

**"Database connection failed"**
- Check Supabase URL and key are correct
- Verify your Supabase project is active
- Ensure you ran the SQL schema

**"Gemini API quota exceeded"**
- Wait 24 hours for quota reset (free tier)
- Policies will still be saved without AI analysis
- Run `python3 scraper.py retry` later to analyze

**"Port 8000 already in use"**
```bash
# Find and kill the process
lsof -ti:8000 | xargs kill -9
```

### Frontend Issues

**"Cannot connect to backend"**
- Verify backend is running: `curl http://localhost:8000/health`
- Check `.env.local` has `VITE_API_URL=http://localhost:8000`
- Restart frontend dev server after changing `.env.local`

**"Policies not loading"**
- Check browser console for errors
- Verify backend has policies: `curl http://localhost:8000/policies`
- Run scraper manually: `python3 scraper.py`

**"Port 8080 already in use"**
- Vite will automatically try another port (8081, 8082, etc.)
- Or kill the process: `lsof -ti:8080 | xargs kill -9`

---

## 📝 Development Workflow

### Adding Sample Data

```bash
cd backend
source venv/bin/activate
python3 add_sample_data.py
```

### Running Scraper

```bash
# Normal scrape
python3 scraper.py

# Retry AI analysis for unanalyzed policies
python3 scraper.py retry
```

### Viewing Logs

Backend logs appear in the terminal where you ran `fastapi dev main.py`

### Testing API Endpoints

Visit: http://localhost:8000/docs for interactive API documentation

---

## 🚀 Deployment

### Deploy Backend to Render

1. Create account at https://render.com
2. Create new **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `cd backend && fastapi run main.py --host 0.0.0.0 --port $PORT`
   - **Environment Variables**: Add all variables from `.env`

### Deploy Frontend to Vercel

1. Create account at https://vercel.com
2. Import your repository
3. Configure:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` or `bun run build`
   - **Environment Variable**: `VITE_API_URL=https://your-backend.onrender.com`

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review backend logs for errors
3. Check browser console for frontend errors
4. Verify all environment variables are set correctly
5. Open an issue on GitHub

---

## 🎯 Quick Start Checklist

- [ ] Clone repository
- [ ] Set up Python virtual environment
- [ ] Install backend dependencies
- [ ] Create Supabase project and run SQL schema
- [ ] Get Gemini API key
- [ ] Create `backend/.env` with credentials
- [ ] Test database connection
- [ ] Start backend server
- [ ] Install frontend dependencies
- [ ] Create `frontend/.env.local`
- [ ] Start frontend dev server
- [ ] Visit http://localhost:8080
- [ ] Test the feed page

---

**Built with ❤️ using FastAPI, React, Vite, and Google Gemini AI**

**Repository**: https://github.com/Ayaan-sheik/budget-impact-lens
