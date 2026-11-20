# MAMTU — Personal Profile Website

Live website: https://mamtu.mohit-datascientist108.workers.dev/

GitHub's main branch deploys automatically to Cloudflare Workers. This is a responsive, real-media editorial site with a three-part homepage carousel, an eight-photo gallery, three playable videos, personal profile, privacy information, and the official Telegram link.

## Real media (already uploaded)

- Images: assets/images/1.jpeg through assets/images/8.jpeg
- Videos: assets/videos/1.mp4, assets/videos/2.mp4, assets/videos/3.mp4
- Homepage order: **6.jpeg → 3.jpeg → 1.mp4** (6 seconds per photo, 11 seconds for film)
- The photo gallery uses all eight images; the film section uses all three videos.

The media file order, paths, captions, and timing are in **media.js**, which is the only media manifest. Images and clips are reused where beneficial. Replace any media only with the subject's permission.

## Editing

- index.html — page layout and owner-supplied non-explicit biography, Telegram handle, privacy wording
- atelier.css — visual design and mobile layouts
- atelier.js — video slideshow, gallery viewer, keyboard navigation, mobile menu
- media.js — change image/video order, timing, captions
- assets/images — numbered photos, which are public
- assets/videos — numbered MP4s, which are public
- wrangler.jsonc — Cloudflare Workers static asset configuration
- tests/smoke.cjs and tests/browser.cjs — source and live-browser checks

The homepage video plays muted; other videos require the visitor to press Play. The hero can be paused, and respects reduced-motion preferences. The site collects no contact-form data, has no analytics, and uses the provided official Telegram handle.

## Privacy and publishing

The exact private residential location is deliberately not displayed. The profile says Saket, New Delhi. Owner/subject authorization, age verification, regulatory compliance and permission to publish each photo/video should be confirmed outside this repository.

The temporary workers.dev address remains **noindex** (robots.txt and meta tag). Before publishing on a permanent domain, obtain the subject's consent, review local rules and complete legal/privacy disclosures. Do not store private IDs, addresses or credentials in this public GitHub repository.

## Testing

Run `npm test` for smoke tests. The GitHub Actions browser workflow tests the deployed site using Chromium (desktop and mobile), including slide order, three films, image gallery, navigation and the Telegram link.

## Deployment

Changes committed to main automatically start a Cloudflare build. No manual deployment command or Cloudflare API key is required for ordinary updates.
