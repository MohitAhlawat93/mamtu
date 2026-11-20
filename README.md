# MAMTU — Red Edition / Cinematic Portfolio

LIVE PREVIEW: https://mamtu.mohit-datascientist108.workers.dev/

Hosted on Cloudflare Workers Static Assets, with GitHub main branch auto-deploy.
This is a new original full-width, video-ready website—not a copy of the layouts from Rebecca or Austria.

## Add real images / video via GitHub
1. Upload owner-approved images to assets/images/ — preferred formats JPG or WebP, optimized for 1600-2400 px.
2. Open media.js and edit slides for each image. Each slide has src (file path), title, tag and alt. The same list powers the homepage auto carousel AND the gallery. Replace the original abstract SVG placeholders when real photos are available.
3. The homepage automatically rotates every 6 seconds. Adjust imageDurationMs for speed. Buttons provide next/previous and pause; prefers-reduced-motion disables autoplay.
4. Upload an approved compressed MP4 to assets/videos/hero.mp4. Then edit media.js and set heroVideo to "/assets/videos/hero.mp4". The file is checked before the site offers video playback. It appears as the first hero slide for 12 seconds, then portraits rotate; it also powers the in-page Motion film player.
5. After verifying an owner destination email, set contactEmail in media.js. Until then, enquiry is disabled; the form does NOT send/store submissions.

IMPORTANT: Cloudflare Workers Static Assets allow at most 25 MiB for one file, including video. Keep homepage video below 25 MiB, preferably much smaller; use R2 or Stream for larger videos. Do not commit private or unapproved client photographs, sensitive information, or API credentials.

## Features
- Full-bleed cinematic hero, auto image transitions, optional video, progress indicator, thumbnails, previous/next and pause
- Asymmetric six-photo lookbook gallery and accessible lightbox
- Responsive home, introduction, motion, editorial, contact and mobile navigation
- Small local FAQ guide (not a generative AI model)
- Safe preview noindex, no fabricated contacts, no unapproved profile claims

## Files
- index.html — main site
- atelier.css — current responsive styling
- atelier.js — carousel, gallery, mobile menu, concierge and contact logic
- media.js — MEDIA CONFIG: start here when photos/videos arrive
- assets/images/ — placeholder artwork and eventually owner-approved images
- assets/videos/ — future approved MP4 files
- wrangler.jsonc — Cloudflare Worker deployment settings
- tests/smoke.cjs — source validation
- tests/browser.cjs — live Chromium QA; screenshots stored in GitHub Actions artifacts

Old app.js and styles.css are not loaded by the new homepage; they are retained only for reference.
Use npm test to run source checks. Use python -m http.server 8000 for local browser preview.

Production launch still requires client-approved real media, factual owner copy, verified contact details, legal notices, and a separate decision on any real AI concierge or protected admin dashboard.
