-- Public website knowledge only. Do not insert private addresses, identity documents, or secrets.
CREATE TABLE IF NOT EXISTS public_knowledge (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT NOT NULL DEFAULT '',
  page_path TEXT NOT NULL DEFAULT '/',
  is_published INTEGER NOT NULL DEFAULT 0 CHECK (is_published IN (0, 1)),
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_public_knowledge_published ON public_knowledge(is_published);
