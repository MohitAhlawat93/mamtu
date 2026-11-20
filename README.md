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
