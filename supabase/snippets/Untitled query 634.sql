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