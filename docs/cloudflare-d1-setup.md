# Mamtu D1 knowledge integration (staged)
This branch connects the existing Worker to the D1 database without removing the current local knowledge fallback.

## Existing Cloudflare database
- Database name: `mamtu_db`
- Database ID: `9912a210-792e-4cd6-b9ab-9b0500ee93b5`
- Worker binding variable: `DB`

## Required activation
1. Cloudflare dashboard → **D1 SQLite Database** → **mamtu_db** → **Console**.
2. Run the SQL in `sql/001_public_knowledge.sql` **once** (safe to re-run).
3. Add only approved, public website facts, with `is_published=1`. Unpublished records are never used for replies.
4. Once schema exists, merge this branch. The GitHub-connected Worker will deploy with the new D1 binding from `wrangler.jsonc`.
5. Verify on the site; if D1 is unavailable or empty, existing embedded knowledge and predefined replies still operate.

## Example safe test entry
```sql
INSERT INTO public_knowledge (id,title,content,tags,page_path,is_published)
VALUES ('site-help','Website navigation',
'The website has Home, About, Gallery, Videos, Services, Reviews and Contact pages.',
'website navigation pages','/',1)
ON CONFLICT(id) DO UPDATE SET title=excluded.title,content=excluded.content,tags=excluded.tags,page_path=excluded.page_path,is_published=excluded.is_published,updated_at=CURRENT_TIMESTAMP;
```

## Security
- No public database-writing endpoint has been added.
- Never store private home address, visitor identifying details, passwords, credentials or unpublished details as RAG context.
- The database is accessed only server-side through the Worker binding.
- This is **D1 lexical retrieval**, not semantic/vector RAG; embeddings can be added later.
- No R2 or paid subscription is required for this stage.
