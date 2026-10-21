-- Cloudflare D1 Schema for Franchise Leads and Instagram Gallery Management

-- 1. Tabela de Leads de Prospecção de Franquia
CREATE TABLE IF NOT EXISTS franchise_leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  capital TEXT NOT NULL,
  experience TEXT DEFAULT 'nao',
  status TEXT DEFAULT 'novo', -- 'novo', 'em_contato', 'qualificado', 'negociacao', 'fechado', 'descartado'
  notes TEXT DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabela de Posts da Galeria / Instagram (Slots 1 a 7)
CREATE TABLE IF NOT EXISTS gallery_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slot_number INTEGER NOT NULL UNIQUE,
  type TEXT DEFAULT 'photo', -- 'photo' ou 'video'
  media_url TEXT NOT NULL,
  thumbnail_url TEXT,
  permalink TEXT,
  caption TEXT,
  category TEXT DEFAULT 'ElChicano',
  likes INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Índices de consulta rápida
CREATE INDEX IF NOT EXISTS idx_leads_created ON franchise_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_status ON franchise_leads(status);
CREATE INDEX IF NOT EXISTS idx_gallery_slot ON gallery_posts(slot_number);
