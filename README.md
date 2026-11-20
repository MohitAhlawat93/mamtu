# MAMTU — Crimson Editorial

Premium, responsive, standalone personal portfolio in oxblood, garnet and warm ivory. This is a **private-preview design** with original CSS art, not a copy of Rebecca or Austria.

## Pages / features
Single-page experience with home, story, visual gallery, experiences, editorial journal, media stage and contact. Responsive navigation, gallery lightbox, keyboard navigation and reduced-motion support. No dependencies; deploy as a static website on Vercel, Cloudflare Pages, Netlify or GitHub Pages.

## Media first
Save authorized images in `assets/images/` and videos in `assets/videos/`. Update the `gallery` array in `app.js` with real filenames. The design uses abstract CSS art until actual owner images are supplied. Place a compressed `feature.mp4` in `assets/videos/` and set `FEATURE_VIDEO_ENABLED = true` in `app.js`. Use Git LFS or object storage for large video files; keep files below GitHub's upload limits.

## Safe preview limitations
No personal claims, photography, rates, reviews or services have been fabricated. The contact form prepares an email only after a verified address is set in `app.js`; it does not save visitor details. There is no admin backend or LLM integration in this version. Add real authentication, isolated media storage and a provider-backed AI service before claiming production administrative/concierge features. The page is `noindex` by default, until the owner confirms legal copy, domain, images and publishing.

## Run locally
`python3 -m http.server 8000` and visit http://localhost:8000

## Quality
HTML/CSS/JS only. Test the preview at 375px, 768px and desktop. Check page links, gallery, form and optional video after adding assets. No media from Rebecca, Mayer, Rema, or Austria is reused.
