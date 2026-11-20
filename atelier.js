"use strict";
(() => {
  const $ = id => document.getElementById(id);
  const config = window.MAMTU_MEDIA || {};
  const hero = Array.isArray(config.hero) ? config.hero : [];
  const gallery = Array.isArray(config.gallery) ? config.gallery : [];
  const films = Array.isArray(config.films) ? config.films : [];
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const durationImage = Math.max(3000, Number(config.imageDurationMs) || 6000);
  const durationVideo = Math.max(6000, Number(config.videoDurationMs) || 11000);
  let current = 0, timer = null, paused = reduced, focusBeforeDialog = null, photoIndex = 0;
  const slides = [];
  $("currentYear").textContent = String(new Date().getFullYear());

  const toggle = $("menuToggle"), mobileNav = $("mobileNav");
  function setMenu(open) {
    mobileNav.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  }
  toggle.addEventListener("click", () => setMenu(mobileNav.hidden));
  mobileNav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", event => { if (event.key === "Escape") setMenu(false); });

  // Eight real photos, with a keyboard-friendly enlarged viewer.
  gallery.forEach((item, i) => {
    const button = document.createElement("button"); button.type = "button"; button.className = "lookbook-card";
    button.setAttribute("aria-label", "Open " + (item.title || "photo") + ", image " + (i + 1));
    const img = document.createElement("img");
    img.src = item.src; img.alt = item.alt || ("Mamtu photograph " + (i + 1));
    img.loading = i < 2 ? "eager" : "lazy"; img.decoding = "async";
    const cap = document.createElement("figcaption");
    const label = document.createElement("b"); label.textContent = item.title || "Mamtu";
    const count = document.createElement("span");
    count.textContent = String(i + 1).padStart(2, "0") + " / " + String(gallery.length).padStart(2, "0");
    cap.append(label, count); button.append(img, cap);
    button.addEventListener("click", () => openPhoto(i));
    $("lookbookGrid").append(button);
  });
  const dialog = $("lightbox");
  function paintPhoto() {
    const item = gallery[photoIndex]; if (!item) return;
    $("lightboxImage").src = item.src; $("lightboxImage").alt = item.alt || item.title;
    $("lightboxTitle").textContent = item.title + " — " + (photoIndex + 1) + " / " + gallery.length;
  }
  function openPhoto(index) {
    photoIndex = index; focusBeforeDialog = document.activeElement;
    paintPhoto(); dialog.showModal();
  }
  function movePhoto(delta) {
    if (!gallery.length) return;
    photoIndex = (photoIndex + delta + gallery.length) % gallery.length; paintPhoto();
  }
  $("lightboxPrev").addEventListener("click", () => movePhoto(-1));
  $("lightboxNext").addEventListener("click", () => movePhoto(1));
  $("lightboxClose").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener("close", () => focusBeforeDialog && focusBeforeDialog.focus());
  document.addEventListener("keydown", event => {
    if (!dialog.open) return;
    if (event.key === "ArrowRight") movePhoto(1);
    if (event.key === "ArrowLeft") movePhoto(-1);
  });

  // Hero playlist: 6.jpeg, 3.jpeg, and then 1.mp4 (from media.js).
  hero.forEach((item, i) => {
    const videoMode = item.type === "video";
    const node = document.createElement("div"); node.className = "hero-slide"; node.dataset.kind = item.type;
    let movie = null;
    if (videoMode) {
      movie = document.createElement("video");
      movie.src = item.src; movie.poster = item.poster || "/assets/images/6.jpeg";
      movie.muted = true; movie.loop = true; movie.playsInline = true;
      movie.preload = "metadata"; movie.setAttribute("aria-label", item.alt || "Mamtu film");
      movie.addEventListener("error", () => { node.classList.add("video-fallback"); });
      node.append(movie);
    } else {
      const img = document.createElement("img");
      img.src = item.src; img.alt = item.alt || "Mamtu photograph";
      img.loading = i === 0 ? "eager" : "lazy"; img.decoding = "async";
      if (i === 0) img.fetchPriority = "high";
      node.append(img);
    }
    $("heroMedia").append(node); slides.push({item:item, node:node, movie:movie});
    const thumb = document.createElement("button");
    thumb.type = "button"; thumb.className = "thumb";
    thumb.setAttribute("aria-label", "Show " + (item.title || "slide"));
    const image = document.createElement("img");
    image.src = videoMode ? item.poster : item.src; image.alt = ""; image.loading = "lazy";
    thumb.append(image);
    if (videoMode) {
      const symbol = document.createElement("span"); symbol.className = "thumb-play";
      symbol.textContent = "▶"; thumb.append(symbol);
    }
    thumb.addEventListener("click", () => showSlide(i));
    $("heroThumbnails").append(thumb);
  });
  function showSlide(index) {
    if (!slides.length) return;
    clearTimeout(timer); timer = null; current = (index + slides.length) % slides.length;
    slides.forEach((s, i) => {
      s.node.classList.toggle("is-active", i === current);
      if (s.movie) {
        if (i !== current || paused || reduced || document.hidden) s.movie.pause();
        else { s.movie.currentTime = 0; s.movie.play().catch(() => {}); }
      }
    });
    const item = slides[current].item;
    $("heroCaption").textContent = item.title || "Mamtu";
    $("heroIndex").textContent = String(current + 1).padStart(2, "0");
    $("heroTotal").textContent = "/ " + String(slides.length).padStart(2, "0");
    [...$("heroThumbnails").children].forEach((node, i) => {
      node.classList.toggle("is-active", i === current);
      if (i === current) node.setAttribute("aria-current", "true"); else node.removeAttribute("aria-current");
    });
    const bar = $("heroProgress"), delay = item.type === "video" ? durationVideo : durationImage;
    bar.style.transition = "none"; bar.style.width = "0%";
    if (!paused && !reduced && !document.hidden) {
      bar.getBoundingClientRect();
      bar.style.transition = "width " + delay + "ms linear"; bar.style.width = "100%";
      timer = setTimeout(() => showSlide(current + 1), delay);
    }
  }
  $("heroPrev").addEventListener("click", () => showSlide(current - 1));
  $("heroNext").addEventListener("click", () => showSlide(current + 1));
  function syncPause() {
    $("heroPause").textContent = paused ? "▶" : "Ⅱ";
    $("heroPause").setAttribute("aria-pressed", String(paused));
    $("heroPause").setAttribute("aria-label", paused ? "Resume slideshow" : "Pause slideshow");
  }
  $("heroPause").addEventListener("click", () => { paused = !paused; syncPause(); showSlide(current); });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { clearTimeout(timer); slides.forEach(s => { if (s.movie) s.movie.pause(); }); }
    else showSlide(current);
  });
  syncPause(); showSlide(0);

  // Three clips, with controls and no unsolicited audio.
  const filmPlayers = [];
  films.forEach((item, i) => {
    const card = document.createElement("article"); card.className = "film-card";
    const frame = document.createElement("div"); frame.className = "film-frame";
    const video = document.createElement("video");
    video.src = item.src; video.poster = item.poster; video.controls = true; video.playsInline = true;
    video.preload = "metadata"; video.setAttribute("aria-label", "Mamtu video " + (i + 1));
    frame.append(video); filmPlayers.push(video);
    const meta = document.createElement("div"); meta.className = "film-meta";
    const name = document.createElement("strong"); name.textContent = item.label || "Film";
    const hint = document.createElement("span"); hint.textContent = "PRESS PLAY TO WATCH";
    meta.append(name, hint); card.append(frame, meta); $("filmsGrid").append(card);
  });
  filmPlayers.forEach(v => v.addEventListener("play", () => {
    filmPlayers.forEach(other => { if (other !== v) other.pause(); });
  }));
})();
