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
- `details.html` — practical profile details, privacy notes and FAQs.
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

- all eight site routes;
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

Keep the workers.dev staging site `noindex,nofollow` until the subject has reviewed the complete website and consented to public launch. Do not publish a precise residential address, identity documents, credentials or other sensitive personal information.


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

For the next data-refinement pass, change `data/mamtu-data.js` rather than rewriting the engine. The main editable groups are:
- `profile`
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

Deployment sync: latest main includes user updates through 895d071570d8d462083e20f360edfc72ce13f82f.
