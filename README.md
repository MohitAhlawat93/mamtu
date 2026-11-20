# MAMTU — Editorial Multi-page Personal Profile

Live site: https://mamtu.mohit-datascientist108.workers.dev/

GitHub's `main` branch automatically deploys to Cloudflare Workers.

## Current pages

- `index.html` — expanded homepage with featured media, Mamtu monogram, “The useful bits”, services preview and honest reviews preview.
- `about.html` — personal introduction, style, values and FAQs.
- `gallery.html` — growing editorial gallery with individual stories and fullscreen viewer. Public copy does not hard-code a fixed collection size.
- `videos.html` — personal video collection with descriptive editorial captions, without visible media numbering.
- `services.html` — private/social service categories; exact arrangements and pricing are discussed privately rather than invented publicly.
- `reviews.html` — honest review archive. No fabricated testimonials or star ratings; genuine reviews can be added with permission.
- `contact.html` — official WhatsApp (+91 836 841 0417) and Telegram (@mistressmamtu).

## Brand

The Mamtu monogram is stored at `assets/mark.svg` and appears in the header, footer and key editorial sections. Shared styling is in `atelier.css`; shared interactions are in `atelier.js`.

## Media

Uploaded media currently lives at:

- Images: `assets/images/1.jpeg` through `assets/images/8.jpeg`
- Videos: `assets/videos/1.mp4` through `assets/videos/3.mp4`

The public website deliberately avoids displaying filenames or “Photo 01 / Video 01” labels. Gallery copy is future-proofed so additional media can be added later without changing introductory wording.

Featured media and viewers use `object-fit: contain` where full portrait visibility matters.

## Testing

Run `npm test` for source-level smoke checks. The checks cover:

- all seven public site routes;
- navigation consistency;
- Mamtu monogram;
- WhatsApp and Telegram links;
- removal of numbered media labels;
- current gallery/video assets;
- Services and Reviews pages;
- honest review empty state;
- responsive styling and JavaScript syntax.

`tests/browser.cjs` contains live Playwright checks for desktop/mobile when Playwright is available in the runner.

## Privacy

The public site allows search engine indexing. `robots.txt` lists the sitemap and each public page provides its canonical URL and adult-content rating metadata. Search Console verification and sitemap submission should be completed by the site's owner. Do not publish a precise residential address, identity documents, credentials or other sensitive personal information.


## Mamtu Assistant RAG

Mamtu now has a Rebecca-style public assistant architecture adapted to Cloudflare Workers.

Public UI:
- Floating **Mamtu Assistant** launcher on every page.
- Page-aware suggested questions.
- Recent-conversation memory in the browser.
- Safe action links to relevant pages, WhatsApp and Telegram.
- Resizable desktop panel.
- One-time session auto-open for discoverability.
- Separate **Stay close / Afterhours** launcher with Mamtu Afterhours, Telegram, WhatsApp, Gallery and Services.

RAG/data architecture:
- `data/mamtu-data.js` — the single structured public-data source to edit as Mamtu's facts change.
- `lib/mamtu-knowledge.js` — knowledge chunks, synonyms, ranking and focused-context retrieval.
- `worker.js` — Cloudflare API routes, direct grounded answers, enquiry planner, privacy guardrails, rate limiting and Groq-backed generation.
- `assistant.js` — browser chat UI, history, suggested prompts, safe actions and Afterhours.
- `assistant.css` — assistant and Afterhours presentation.

API routes:
- `POST /api/assistant` — public assistant.
- `GET /api/assistant-config` — public UI configuration and whether model generation is configured.
- `GET /api/assistant-health` — lightweight deployment/model-configuration status.

The Worker uses the same model default as the Rebecca concierge port: `openai/gpt-oss-120b` through Groq. Configure the Cloudflare Worker secret `GROQ_API_KEY` to enable model-backed RAG generation. Optional `GROQ_MODEL` can override the model.

Without `GROQ_API_KEY`, Mamtu Assistant remains functional through grounded direct answers, structured retrieval and deterministic fallback; it does not invent a model answer.

### Updating assistant data

Practical information previously shown on the public Details page now lives in the RAG data and is answered through Mamtu Assistant. There is no public `details.html` route.

For the next data-refinement pass, change `data/mamtu-data.js` rather than rewriting the engine. The main editable groups are:
- `profile`
- `practical`
- `services`
- `gallery`
- `videos`
- `reviews`
- `contact`
- `afterhours`
- `policies`
- `site`

Do not add private residential addresses, identity documents, credentials, or fabricated reviews to the public RAG source.

## Deployment sync

Deployment sync: Details page removed after the latest premium gallery/services updates; practical facts retained in Mamtu Assistant RAG.

Deployment trigger: seven-page site with practical details served through Mamtu Assistant RAG.


## Mamtu Control

Private owner controls are available at `/admin`.

Current controls:
- availability status, optional expiry date and public announcement;
- WhatsApp and Telegram details;
- public profile wording used by the runtime assistant;
- public rates;
- homepage featured images/video chosen from the existing repository media;
- Mamtu Assistant enabled/paused state;
- version history, restore and JSON export.

Security and persistence:
- login uses `MAMTU_ADMIN_PASSWORD` when configured, otherwise the existing `MAMTU_TOKEN` / `mamtu_token`;
- the browser receives only a signed HttpOnly, Secure, SameSite=Strict session cookie;
- admin pages and APIs are `noindex` / `no-store`;
- saved content is stored in Cloudflare D1 and tables are created automatically on first use;
- accepted D1 binding names are `MAMTU_DB`, `DB`, or `mamtu_db`.

Runtime edits are overlays. They do **not** rewrite `data/mamtu-data.js`, `lib/mamtu-knowledge.js`, or the assistant system prompt. If D1 is unavailable, the public website and assistant fall back to the repository data.
