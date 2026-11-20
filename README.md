# MAMTU — Multi-page Personal Profile Website

Live site: https://mamtu.mohit-datascientist108.workers.dev/

GitHub's `main` branch automatically deploys to Cloudflare Workers.

## Pages and navigation

- `index.html` — simple homepage, featuring images **6** and **3** and video **1** together at the top; full-media display without cropping.
- `about.html` — personal story and photographs 7 and 8.
- `gallery.html` — all eight photographs in an uncropped masonry gallery with fullscreen lightbox.
- `videos.html` — all three original videos, playable separately.
- `details.html` — personal information, broad location, privacy and communication.
- `contact.html` — Telegram link @mistressmamtu, without a dummy form.

Shared styling is in `atelier.css`; shared interactions (mobile navigation, accessible photo lightbox, video focus) are in `atelier.js`. `media.js` remains as the original numbered-media inventory but the pages now include their real assets directly in HTML.

## Media

- Images: `assets/images/1.jpeg` through `assets/images/8.jpeg`
- Videos: `assets/videos/1.mp4` through `assets/videos/3.mp4`

**IMPORTANT:** Featured images on the homepage and video/photo viewers use `object-fit: contain`, not `cover`, so portrait photos are displayed fully rather than cropped. The gallery also retains each photograph's natural aspect ratio.

## Testing and deployment

Run `npm test` for source-level smoke checks (file existence, six-page routing, visible hero media, privacy, responsive styling). `tests/browser.cjs` contains live Playwright checks for desktop/mobile, gallery interaction and media visibility, when the CI runner has Playwright installed.

The Cloudflare configuration is `wrangler.jsonc`. Updates pushed to main trigger automatic deployment. Leave `noindex,nofollow` on the temporary workers.dev preview until the subject has reviewed the whole site and consented to public launch.

## Privacy

Do not publish the subject's exact private address, identity documents, or credentials. Check authorization and adult age of subjects, consent for every image/video, and applicable local rules before promotion. The published pages list Saket, New Delhi only.
