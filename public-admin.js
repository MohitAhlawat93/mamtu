const STATUS_LABELS = {
  accepting: "Accepting enquiries",
  limited: "Limited availability",
  away: "Temporarily away",
  unavailable: "Not accepting enquiries"
};

function replaceText(from, to) {
  if (!from || !to || from === to || !document.body) return;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = [];
  let node;
  while ((node = walker.nextNode())) {
    const parent = node.parentElement;
    if (!parent || ["SCRIPT","STYLE","TEXTAREA","OPTION"].includes(parent.tagName)) continue;
    if (node.nodeValue.includes(from)) nodes.push(node);
  }
  nodes.forEach(item => { item.nodeValue = item.nodeValue.split(from).join(to); });
}

function updateContact(contact = {}) {
  const whatsappUrl = contact.whatsappUrl;
  const telegramUrl = contact.telegramUrl;
  if (whatsappUrl) {
    document.querySelectorAll('a[href*="wa.me/"],a[href*="api.whatsapp.com/"]').forEach(anchor => { anchor.href = whatsappUrl; });
  }
  if (telegramUrl) {
    document.querySelectorAll('a[href*="t.me/"],a[href*="telegram.me/"]').forEach(anchor => { anchor.href = telegramUrl; });
  }
  replaceText("+91 836 841 0417", contact.whatsappDisplay || "+91 836 841 0417");
  replaceText("@mistressmamtu", contact.telegramHandle || "@mistressmamtu");
}

function updateBase(profile = {}) {
  const base = profile.base;
  if (!base || base === "Saket, New Delhi") return;
  replaceText("Saket, New Delhi", base);
  replaceText("Saket · New Delhi", base.replace(/,\s*/g, " · "));
}

function updateRates(rates = {}) {
  const priceByTitle = {
    "Incall – 1 Hour": rates.incall1h ? `FROM ${rates.incall1h}` : null,
    "Incall – 2 Hours": rates.incall2h ? `FROM ${rates.incall2h}` : null,
    "Outcall – 1 Hour": rates.outcall1h ? `FROM ${rates.outcall1h}` : null,
    "Outcall – 2 Hours": rates.outcall2h ? `FROM ${rates.outcall2h}` : null,
    "Overnight / Full Night": rates.fullNight ? `FROM ${rates.fullNight}` : null,
    "Two Shots": rates.twoShots ? `AROUND ${rates.twoShots}` : null,
    "Video Call": rates.webcam30 ? `${rates.webcam30} / 30 MIN` : null,
    "Custom / Threesome": rates.threesomeNight ? `TAILORED · FROM ${rates.threesomeNight} NIGHT` : null
  };
  document.querySelectorAll(".service-card-v2").forEach(card => {
    const title = card.querySelector("h2")?.textContent?.trim();
    const label = priceByTitle[title];
    const price = card.querySelector(".price");
    if (price && label) price.textContent = label;
  });
}

function updateMedia(media = {}) {
  const first = document.querySelector(".home-media .featured-card:nth-of-type(1) img");
  const second = document.querySelector(".home-media .featured-card:nth-of-type(2) img");
  const video = document.querySelector(".home-media .featured-card:nth-of-type(3) video");
  if (first && media.homeImage1) first.src = media.homeImage1;
  if (second && media.homeImage2) second.src = media.homeImage2;
  if (video && media.homeVideo) {
    video.src = media.homeVideo;
    if (media.homeImage1) video.poster = media.homeImage1;
    video.load();
  }
}

function ensureStripStyles() {
  if (document.querySelector("#mamtu-control-public-style")) return;
  const style = document.createElement("style");
  style.id = "mamtu-control-public-style";
  style.textContent = `
    .mamtu-live-control{display:flex;align-items:center;justify-content:center;gap:.55rem 1rem;flex-wrap:wrap;padding:.72rem 1rem;background:#2a151d;color:#fff;font:600 .78rem/1.35 "DM Sans",system-ui,sans-serif;letter-spacing:.02em;text-align:center}
    .mamtu-live-control strong{font-weight:700}.mamtu-live-control span:last-child{opacity:.78;font-weight:500}
    .mamtu-live-dot{width:7px;height:7px;border-radius:50%;background:#91bd9b;box-shadow:0 0 0 4px rgba(145,189,155,.13)}
    .mamtu-live-control[data-status="limited"] .mamtu-live-dot{background:#d6ad61}
    .mamtu-live-control[data-status="away"] .mamtu-live-dot,.mamtu-live-control[data-status="unavailable"] .mamtu-live-dot{background:#c88181}
    .mamtu-public-announcement{padding:.64rem 1rem;background:#f4e6eb;color:#5b1730;text-align:center;font:700 .76rem/1.4 "DM Sans",system-ui,sans-serif}
    @media(max-width:640px){.mamtu-live-control{padding:.65rem .8rem;font-size:.72rem}.mamtu-public-announcement{font-size:.71rem}}
  `;
  document.head.append(style);
}

function updateLiveStrips(state, version) {
  if (!version || !state) return;
  ensureStripStyles();
  const header = document.querySelector(".site-header");
  const mobileNav = document.querySelector("#mobileNav,.mobile-nav");
  const target = mobileNav || header;
  if (!target) return;

  const existing = document.querySelector(".mamtu-live-control");
  if (existing) existing.remove();
  const availability = state.availability || {};
  const strip = document.createElement("div");
  strip.className = "mamtu-live-control";
  strip.dataset.status = availability.status || "accepting";
  const dot = document.createElement("i");
  dot.className = "mamtu-live-dot";
  dot.setAttribute("aria-hidden", "true");
  const strong = document.createElement("strong");
  strong.textContent = STATUS_LABELS[availability.status] || "Availability";
  const note = document.createElement("span");
  note.textContent = availability.note || "";
  strip.append(dot, strong, note);
  target.insertAdjacentElement("afterend", strip);

  document.querySelector(".mamtu-public-announcement")?.remove();
  if (state.announcement?.enabled && state.announcement.text) {
    const announcement = document.createElement("div");
    announcement.className = "mamtu-public-announcement";
    announcement.textContent = state.announcement.text;
    strip.insertAdjacentElement("afterend", announcement);
  }
}

async function applyMamtuControl() {
  try {
    const response = await fetch("/api/public-content", { headers: { "Accept": "application/json" } });
    if (!response.ok) return;
    const body = await response.json();
    if (!body?.state) return;
    const state = body.state;
    updateContact(state.contact);
    updateBase(state.profile);
    updateRates(state.rates);
    updateMedia(state.media);
    updateLiveStrips(state, Number(body.version) || 0);
  } catch {
    // Public website keeps its static fallback when runtime control is unavailable.
  }
}

applyMamtuControl();
