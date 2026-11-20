"use strict";
/* MAMTU cinematic edition — static preview with explicit media configuration. */
(() => {
  const $ = (id) => document.getElementById(id);
  const media = window.MAMTU_MEDIA || {};
  const gallery = Array.isArray(media.slides) ? media.slides.filter((item) => item && typeof item.src === "string" && item.src.startsWith("/assets/images/")) : [];
  const slideshow = [];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const durationImage = Math.max(3000, Number(media.imageDurationMs) || 6000);
  const durationVideo = Math.max(6000, Number(media.videoDurationMs) || 12000);
  let current = 0, timer = null, paused = reducedMotion.matches, progressStart = 0;
  let lightboxIndex = 0, lightboxPreviousFocus = null;

  $("currentYear").textContent = String(new Date().getFullYear());

  // Mobile navigation: state is visible, semantic and keyboard-friendly.
  const menu = $("menuToggle"), mobileNav = $("mobileNav");
  function setMenu(open) {
    mobileNav.hidden = !open;
    menu.setAttribute("aria-expanded", String(open));
    menu.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  }
  menu.addEventListener("click", () => setMenu(mobileNav.hidden));
  mobileNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  // The image gallery uses the same manifest as the homepage. No duplicate photo paths.
  const lookbook = $("lookbookGrid");
  gallery.forEach((item, i) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "lookbook-card";
    button.setAttribute("aria-label", "View image " + (i + 1) + ": " + item.title);
    const figure = document.createElement("figure");
    figure.style.margin = "0";
    figure.style.height = "100%";
    const image = document.createElement("img");
    image.src = item.src;
    image.alt = item.alt || ("MAMTU study " + (i + 1));
    image.loading = i < 2 ? "eager" : "lazy";
    image.decoding = "async";
    const category = document.createElement("span");
    category.className = "card-top";
    category.textContent = item.tag || ("FRAME / " + String(i + 1).padStart(2, "0"));
    const caption = document.createElement("figcaption");
    const title = document.createElement("b");
    title.textContent = item.title || ("Frame " + (i + 1));
    const number = document.createElement("span");
    number.textContent = String(i + 1).padStart(2, "0") + " / " + String(gallery.length).padStart(2, "0");
    caption.append(title, number);
    figure.append(image, category, caption);
    button.append(figure);
    button.addEventListener("click", () => openLightbox(i));
    lookbook.append(button);
  });

  // Accessible gallery lightbox.
  const lightbox = $("lightbox");
  function paintLightbox() {
    const item = gallery[lightboxIndex];
    if (!item) return;
    $("lightboxImage").src = item.src;
    $("lightboxImage").alt = item.alt || item.title;
    $("lightboxTitle").textContent = item.title + "  —  " + String(lightboxIndex + 1).padStart(2, "0") + " / " + String(gallery.length).padStart(2, "0");
  }
  function openLightbox(index) {
    lightboxIndex = index;
    lightboxPreviousFocus = document.activeElement;
    paintLightbox();
    lightbox.showModal();
  }
  function moveLightbox(diff) {
    if (!gallery.length) return;
    lightboxIndex = (lightboxIndex + diff + gallery.length) % gallery.length;
    paintLightbox();
  }
  $("lightboxPrev").addEventListener("click", () => moveLightbox(-1));
  $("lightboxNext").addEventListener("click", () => moveLightbox(1));
  $("lightboxClose").addEventListener("click", () => lightbox.close());
  lightbox.addEventListener("close", () => lightboxPreviousFocus?.focus?.());
  lightbox.addEventListener("click", (event) => { if (event.target === lightbox) lightbox.close(); });
  document.addEventListener("keydown", (event) => {
    if (!lightbox.open) return;
    if (event.key === "ArrowRight") moveLightbox(1);
    if (event.key === "ArrowLeft") moveLightbox(-1);
  });

  // The full-bleed hero is a timed slideshow, optionally led by an approved video.
  // No video is requested until the media manifest supplies a path.
  function createSlide(item, type) {
    const slide = document.createElement("div");
    slide.className = "hero-slide";
    slide.dataset.kind = type;
    if (type === "video") {
      const v = document.createElement("video");
      v.muted = true; v.autoplay = true; v.loop = true; v.playsInline = true;
      v.preload = "metadata"; v.poster = media.videoPoster || gallery[0]?.src || "";
      v.setAttribute("aria-label", "MAMTU featured homepage film");
      v.src = item.src;
      slide.append(v);
    } else {
      const img = document.createElement("img");
      img.src = item.src;
      img.alt = item.alt || "Original MAMTU editorial art";
      img.loading = slideshow.length === 0 ? "eager" : "lazy";
      img.decoding = "async";
      if (!slideshow.length) img.fetchPriority = "high";
      slide.append(img);
    }
    $("heroMedia").append(slide);
    return { type, item, node: slide };
  }

  function stopTimer() {
    clearTimeout(timer); timer = null;
    const progress = $("heroProgress");
    progress.style.transition = "none";
    if (progressStart) progress.style.width = "0%";
  }
  function resetProgress(delay) {
    const progress = $("heroProgress");
    progress.style.transition = "none";
    progress.style.width = "0%";
    progress.offsetWidth;
    progress.style.transition = "width " + delay + "ms linear";
    progress.style.width = "100%";
    progressStart = Date.now();
  }
  function populateThumbnails() {
    const dock = $("heroThumbnails");
    dock.replaceChildren();
    slideshow.slice(0, 4).forEach((slide, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "thumb";
      button.setAttribute("aria-label", "Show " + (slide.item.title || "film"));
      if (slide.type === "image") {
        const img = document.createElement("img");
        img.src = slide.item.src;
        img.alt = "";
        img.loading = "lazy";
        button.append(img);
      } else {
        button.textContent = "▶";
      }
      button.addEventListener("click", () => showSlide(index));
      dock.append(button);
    });
  }
  function showSlide(index) {
    if (!slideshow.length) return;
    clearTimeout(timer); timer = null;
    current = (index + slideshow.length) % slideshow.length;
    slideshow.forEach((entry, i) => {
      entry.node.classList.toggle("is-active", i === current);
      if (entry.type === "video") {
        const video = entry.node.querySelector("video");
        if (i !== current || paused || reducedMotion.matches) video.pause();
        else video.play().catch(() => {});
      }
    });
    const entry = slideshow[current];
    $("heroCaption").textContent = entry.item.title || "MAMTU in motion";
    $("heroIndex").textContent = String(current + 1).padStart(2, "0");
    $("heroTotal").textContent = "/ " + String(slideshow.length).padStart(2, "0");
    [...$("heroThumbnails").children].forEach((el, i) => {
      el.classList.toggle("is-active", i === current);
      if (i === current) el.setAttribute("aria-current", "true"); else el.removeAttribute("aria-current");
    });
    const duration = entry.type === "video" ? durationVideo : durationImage;
    stopTimer();
    if (!paused && !document.hidden && !reducedMotion.matches) {
      resetProgress(duration);
      timer = setTimeout(() => showSlide(current + 1), duration);
    }
  }
  $("heroPrev").addEventListener("click", () => showSlide(current - 1));
  $("heroNext").addEventListener("click", () => showSlide(current + 1));
  $("heroPause").addEventListener("click", () => {
    paused = !paused;
    $("heroPause").setAttribute("aria-pressed", String(paused));
    $("heroPause").setAttribute("aria-label", paused ? "Resume slideshow" : "Pause slideshow");
    $("heroPause").textContent = paused ? "▶" : "Ⅱ";
    showSlide(current);
  });
  if (paused) {
    $("heroPause").textContent = "▶";
    $("heroPause").setAttribute("aria-pressed", "true");
    $("heroPause").setAttribute("aria-label", "Resume slideshow");
  }
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      clearTimeout(timer);
      slideshow.forEach((entry) => entry.node.querySelector("video")?.pause());
    } else showSlide(current);
  });
  // A user may add a video to assets/videos/hero.mp4 then configure it in media.js.
  async function initializeMedia() {
    let verifiedVideo = "";
    if (typeof media.heroVideo === "string" && /^\/assets\/videos\/[\w.-]+\.mp4$/i.test(media.heroVideo)) {
      try {
        const result = await fetch(media.heroVideo, { method: "HEAD", cache: "no-store" });
        if (result.ok && /video\/|octet-stream/i.test(result.headers.get("content-type") || "")) verifiedVideo = media.heroVideo;
      } catch { /* Offline or missing media: keep images visible. */ }
    }
    if (verifiedVideo) slideshow.push(createSlide({ src: verifiedVideo, title: "The moving portrait" }, "video"));
    gallery.forEach((item) => slideshow.push(createSlide(item, "image")));
    if (!slideshow.length) {
      $("heroCaption").textContent = "Media awaiting owner approval";
      return;
    }
    populateThumbnails();
    showSlide(0);
    // Film section uses the same verified video, avoiding broken controls before upload.
    if (verifiedVideo) {
      const film = $("featureFilm");
      film.src = verifiedVideo;
      film.preload = "metadata";
      film.hidden = false;
      $("filmWindow").classList.add("has-film");
    }
  }
  initializeMedia();

  // The enquiry UI never stores data; mailto is enabled only after owner verification.
  $("contactForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const email = typeof media.contactEmail === "string" ? media.contactEmail.trim() : "";
    const notice = $("formNotice");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      notice.textContent = "Enquiries aren't active yet: the owner needs to confirm a destination email address. No message has been sent or stored.";
      return;
    }
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const reply = String(data.get("email") || "").trim();
    const message = String(data.get("message") || "").trim();
    const subject = encodeURIComponent("MAMTU enquiry from " + name);
    const body = encodeURIComponent("Name: " + name + "\nEmail: " + reply + "\n\n" + message);
    window.location.href = "mailto:" + email + "?subject=" + subject + "&body=" + body;
    notice.textContent = "Your email application should open. Review and send the prepared message there; this website does not store submissions.";
  });

  // Simple local site FAQ; not falsely described as an AI-powered concierge.
  const toggle = $("conciergeToggle"), panel = $("conciergePanel");
  function setGuide(open) {
    panel.hidden = !open; toggle.setAttribute("aria-expanded", String(open));
    if (open) $("conciergeQuestion").focus(); else toggle.focus();
  }
  toggle.addEventListener("click", () => setGuide(panel.hidden));
  $("conciergeClose").addEventListener("click", () => setGuide(false));
  function answer(q) {
    const text = q.toLowerCase();
    if (/photo|gallery|image|portrait|picture|media/.test(text)) return "The Gallery includes original abstract placeholders. Once approved photographs are uploaded to GitHub and their paths updated in media.js, they will appear here and in the homepage carousel.";
    if (/video|film|motion/.test(text)) return "The homepage is video-ready and the Motion section has a film player. An approved MP4 has not yet been uploaded, so the site uses its timed image slideshow.";
    if (/contact|email|enquir|book|rate|price|availab/.test(text)) return "Contact details and availability are not verified yet. The enquiry form cannot send a message until the owner confirms an email destination.";
    if (/private|privacy|storage|data/.test(text)) return "This site guide answers using local predefined rules. It sends no data to an AI provider, and the preview enquiry form does not save visitor information.";
    if (/hello|hi|hey|about|who|story|mamtu/.test(text)) return "Welcome to MAMTU. Explore the introduction and gallery. The personal biography is deliberately left generic until the owner approves it.";
    return "I can help you find the gallery, the homepage slideshow, the film section and enquiry information. What would you like to explore?";
  }
  $("conciergeForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const input = $("conciergeQuestion"); const q = input.value.trim();
    if (!q) return;
    const log = $("conciergeMessages");
    const add = (text, user) => { const p = document.createElement("p"); p.className = "concierge-bubble" + (user ? " user" : ""); p.textContent = text; log.append(p); };
    add(q, true); add(answer(q), false);
    input.value = ""; log.scrollTop = log.scrollHeight;
  });
})();
