const SESSION_COOKIE = "mamtu_admin_session";
const SESSION_SECONDS = 60 * 60 * 24 * 7;
const ADMIN_HISTORY_LIMIT = 20;
const AVAILABILITY_STATUSES = new Set(["accepting","limited","away","unavailable"]);
const loginAttempts = globalThis.__MAMTU_ADMIN_LOGIN_ATTEMPTS__ || (globalThis.__MAMTU_ADMIN_LOGIN_ATTEMPTS__ = new Map());
let schemaReady = false;

function adminJson(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
      ...headers
    }
  });
}

function getDb(env = {}) {
  const db = env.MAMTU_DB || env.DB || env.mamtu_db || env.mamtuDb;
  return db && typeof db.prepare === "function" ? db : null;
}

function getLoginSecret(env = {}) {
  return env.MAMTU_ADMIN_PASSWORD || env.MAMTU_TOKEN || env.mamtu_token || "";
}

function getCredentialHint(env = {}) {
  if (env.MAMTU_ADMIN_PASSWORD) return "Use the password saved under MAMTU_ADMIN_PASSWORD in Cloudflare Worker secrets.";
  if (env.MAMTU_TOKEN || env.mamtu_token) return "Use the value of your existing MAMTU_TOKEN / mamtu_token secret in Cloudflare, not the secret name.";
  return "Add a secret named MAMTU_ADMIN_PASSWORD in the Cloudflare Worker settings to enable login.";
}

function getSessionSecret(env = {}) {
  return env.MAMTU_TOKEN || env.mamtu_token || env.MAMTU_ADMIN_PASSWORD || "";
}

function text(value, fallback = "", max = 800) {
  const clean = typeof value === "string" ? value.trim() : "";
  return (clean || fallback).slice(0, max);
}

function rawRate(value, fallback) {
  return text(value, fallback, 48)
    .replace(/^from\s+/i, "")
    .replace(/^around\s+/i, "")
    .replace(/\s*(?:\/|for)\s*30\s*(?:min(?:utes?)?)\.?$/i, "")
    .trim() || fallback;
}

function safeUrl(value, fallback, allowedHosts = []) {
  try {
    const url = new URL(String(value || fallback));
    if (url.protocol !== "https:") return fallback;
    if (allowedHosts.length && !allowedHosts.includes(url.hostname.toLowerCase())) return fallback;
    return url.toString();
  } catch {
    return fallback;
  }
}

function safeMedia(value, fallback, kind = "image") {
  const v = text(value, fallback, 180);
  const pattern = kind === "video"
    ? /^\/assets\/videos\/[a-zA-Z0-9._/-]+$/
    : /^\/assets\/images\/[a-zA-Z0-9._/-]+$/;
  return pattern.test(v) ? v : fallback;
}

export function defaultAdminState(baseData) {
  const indicative = baseData?.pricing?.indicative || {};
  return {
    availability: {
      status: "accepting",
      note: "Live availability is confirmed directly on WhatsApp or Telegram.",
      until: "",
      revert: "accepting"
    },
    announcement: {
      enabled: false,
      text: ""
    },
    contact: {
      whatsappDisplay: baseData?.contact?.whatsappDisplay || "+91 836 841 0417",
      whatsappUrl: baseData?.contact?.whatsappUrl || "https://wa.me/918368410417",
      telegramHandle: baseData?.contact?.telegramHandle || "@mistressmamtu",
      telegramUrl: baseData?.contact?.telegramUrl || "https://t.me/mistressmamtu"
    },
    profile: {
      base: baseData?.profile?.base || "Saket, New Delhi",
      intro: baseData?.profile?.intro || "",
      residence: baseData?.practical?.residence || "",
      personality: baseData?.practical?.personality || "",
      physicalPresence: baseData?.practical?.physicalPresence || "",
      hygiene: baseData?.practical?.hygiene || "",
      photographs: baseData?.practical?.photographs || ""
    },
    rates: {
      incall1h: rawRate(indicative.incall1h, "₹40,000"),
      incall2h: rawRate(indicative.incall2h, "₹70,000"),
      outcall1h: rawRate(indicative.outcall1h, "₹60,000"),
      outcall2h: rawRate(indicative.outcall2h, "₹1,00,000"),
      fullNight: rawRate(indicative.fullNight, "₹2,00,000"),
      twoShots: rawRate(indicative.twoShots, "₹1,00,000"),
      threesomeNight: rawRate(indicative.threesomeNight, "₹5,00,000"),
      webcam30: rawRate(indicative.webcam30, "₹10,000")
    },
    media: {
      homeImage1: "/assets/images/6.jpeg",
      homeImage2: "/assets/images/3.jpeg",
      homeVideo: "/assets/videos/1.mp4"
    },
    assistant: {
      enabled: true,
      pausedMessage: "Mamtu Assistant is taking a short pause. Please use WhatsApp or Telegram for anything time-sensitive."
    }
  };
}

export function sanitizeAdminState(input, baseData) {
  const defaults = defaultAdminState(baseData);
  const src = input && typeof input === "object" ? input : {};
  const a = src.availability || {};
  const status = AVAILABILITY_STATUSES.has(a.status) ? a.status : defaults.availability.status;
  const revert = AVAILABILITY_STATUSES.has(a.revert) ? a.revert : defaults.availability.revert;
  const until = /^\d{4}-\d{2}-\d{2}$/.test(String(a.until || "")) ? String(a.until) : "";
  const c = src.contact || {};
  const p = src.profile || {};
  const r = src.rates || {};
  const m = src.media || {};
  const assistant = src.assistant || {};
  const announcement = src.announcement || {};

  return {
    availability: {
      status,
      note: text(a.note, defaults.availability.note, 240),
      until,
      revert
    },
    announcement: {
      enabled: Boolean(announcement.enabled),
      text: text(announcement.text, "", 260)
    },
    contact: {
      whatsappDisplay: text(c.whatsappDisplay, defaults.contact.whatsappDisplay, 40),
      whatsappUrl: safeUrl(c.whatsappUrl, defaults.contact.whatsappUrl, ["wa.me","api.whatsapp.com"]),
      telegramHandle: text(c.telegramHandle, defaults.contact.telegramHandle, 64),
      telegramUrl: safeUrl(c.telegramUrl, defaults.contact.telegramUrl, ["t.me","telegram.me"])
    },
    profile: {
      base: text(p.base, defaults.profile.base, 100),
      intro: text(p.intro, defaults.profile.intro, 900),
      residence: text(p.residence, defaults.profile.residence, 700),
      personality: text(p.personality, defaults.profile.personality, 700),
      physicalPresence: text(p.physicalPresence, defaults.profile.physicalPresence, 500),
      hygiene: text(p.hygiene, defaults.profile.hygiene, 500),
      photographs: text(p.photographs, defaults.profile.photographs, 500)
    },
    rates: {
      incall1h: rawRate(r.incall1h, defaults.rates.incall1h),
      incall2h: rawRate(r.incall2h, defaults.rates.incall2h),
      outcall1h: rawRate(r.outcall1h, defaults.rates.outcall1h),
      outcall2h: rawRate(r.outcall2h, defaults.rates.outcall2h),
      fullNight: rawRate(r.fullNight, defaults.rates.fullNight),
      twoShots: rawRate(r.twoShots, defaults.rates.twoShots),
      threesomeNight: rawRate(r.threesomeNight, defaults.rates.threesomeNight),
      webcam30: rawRate(r.webcam30, defaults.rates.webcam30)
    },
    media: {
      homeImage1: safeMedia(m.homeImage1, defaults.media.homeImage1, "image"),
      homeImage2: safeMedia(m.homeImage2, defaults.media.homeImage2, "image"),
      homeVideo: safeMedia(m.homeVideo, defaults.media.homeVideo, "video")
    },
    assistant: {
      enabled: assistant.enabled !== false,
      pausedMessage: text(assistant.pausedMessage, defaults.assistant.pausedMessage, 320)
    }
  };
}

function indiaDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);
  const value = type => parts.find(item => item.type === type)?.value || "";
  return `${value("year")}-${value("month")}-${value("day")}`;
}

export function effectiveAdminState(state) {
  const copy = JSON.parse(JSON.stringify(state));
  const until = copy?.availability?.until || "";
  if (until && indiaDateKey() > until) {
    copy.availability.status = copy.availability.revert || "accepting";
    copy.availability.expired = true;
  } else {
    copy.availability.expired = false;
  }
  return copy;
}

async function ensureSchema(db) {
  if (!db || schemaReady) return;
  const statements = [
    db.prepare(`CREATE TABLE IF NOT EXISTS mamtu_admin_state (
      id TEXT PRIMARY KEY,
      payload TEXT NOT NULL,
      version INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS mamtu_admin_history (
      version INTEGER PRIMARY KEY,
      payload TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      action TEXT NOT NULL DEFAULT 'save'
    )`)
  ];
  if (typeof db.batch === "function") await db.batch(statements);
  else for (const statement of statements) await statement.run();
  schemaReady = true;
}

async function readStoredState(env, baseData) {
  const db = getDb(env);
  const defaults = defaultAdminState(baseData);
  if (!db) return { state: defaults, version: 0, updatedAt: null, persistent: false, db: null };
  try {
    await ensureSchema(db);
    const row = await db.prepare("SELECT payload, version, updated_at FROM mamtu_admin_state WHERE id = 'current'").first();
    if (!row) return { state: defaults, version: 0, updatedAt: null, persistent: true, db };
    let parsed = {};
    try { parsed = JSON.parse(row.payload); } catch {}
    return {
      state: sanitizeAdminState(parsed, baseData),
      version: Number(row.version) || 0,
      updatedAt: row.updated_at || null,
      persistent: true,
      db
    };
  } catch (error) {
    console.error("Mamtu Control D1 read failed:", error?.message || error);
    return { state: defaults, version: 0, updatedAt: null, persistent: false, db: null, storageError: true };
  }
}

export async function loadAdminState(env, baseData) {
  const stored = await readStoredState(env, baseData);
  return { ...stored, state: effectiveAdminState(stored.state) };
}

export function applyAdminOverlay(baseData, state) {
  const data = typeof structuredClone === "function"
    ? structuredClone(baseData)
    : JSON.parse(JSON.stringify(baseData));
  const s = effectiveAdminState(state || defaultAdminState(baseData));
  const rates = s.rates;

  data.contact = { ...(data.contact || {}), ...s.contact };
  data.profile = { ...(data.profile || {}), base: s.profile.base, intro: s.profile.intro };
  data.practical = {
    ...(data.practical || {}),
    residence: s.profile.residence,
    personality: s.profile.personality,
    physicalPresence: s.profile.physicalPresence,
    hygiene: s.profile.hygiene,
    photographs: s.profile.photographs
  };
  data.pricing = {
    ...(data.pricing || {}),
    indicative: {
      ...(data.pricing?.indicative || {}),
      incall1h: rates.incall1h,
      incall2h: rates.incall2h,
      outcall1h: rates.outcall1h,
      outcall2h: rates.outcall2h,
      fullNight: rates.fullNight,
      twoShots: rates.twoShots,
      threesomeNight: rates.threesomeNight,
      webcam30: rates.webcam30
    }
  };

  const serviceTerms = {
    "Incall – 1 Hour": `From ${rates.incall1h}`,
    "Incall – 2 Hours": `From ${rates.incall2h}`,
    "Outcall – 1 Hour": `From ${rates.outcall1h}`,
    "Outcall – 2 Hours": `From ${rates.outcall2h}`,
    "Overnight / Full Night": `Around ${rates.fullNight}`,
    "Two Shots": `Around ${rates.twoShots}`,
    "Video Call / Webcam": `${rates.webcam30} / 30 min`
  };
  data.services = (data.services || []).map(item => {
    const copy = { ...item };
    if (serviceTerms[copy.title]) copy.terms = serviceTerms[copy.title];
    if (copy.title === "Custom / Threesome") {
      copy.details = `Threesome full night around ${rates.threesomeNight}.`;
    }
    return copy;
  });

  data.afterhours = {
    ...(data.afterhours || {}),
    primaryDetail: s.contact.whatsappDisplay,
    primaryUrl: s.contact.whatsappUrl
  };
  data.runtime = {
    availability: s.availability,
    announcement: s.announcement,
    media: s.media,
    assistant: s.assistant
  };
  return data;
}

function parseCookies(request) {
  const raw = request.headers.get("Cookie") || "";
  const result = {};
  for (const part of raw.split(";")) {
    const index = part.indexOf("=");
    if (index < 0) continue;
    result[part.slice(0, index).trim()] = decodeURIComponent(part.slice(index + 1).trim());
  }
  return result;
}

async function hmacHex(secret, value) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value)));
  return Array.from(signature, byte => byte.toString(16).padStart(2, "0")).join("");
}

async function secureEqual(left, right) {
  const digest = async value => new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(value))));
  const [a, b] = await Promise.all([digest(left), digest(right)]);
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

async function createSessionValue(env) {
  const secret = getSessionSecret(env);
  const expires = String(Date.now() + SESSION_SECONDS * 1000);
  return `${expires}.${await hmacHex(secret, expires)}`;
}

async function isAuthenticated(request, env) {
  const secret = getSessionSecret(env);
  if (!secret) return false;
  const value = parseCookies(request)[SESSION_COOKIE] || "";
  const [expires, signature] = value.split(".");
  if (!expires || !signature || Number(expires) <= Date.now()) return false;
  const expected = await hmacHex(secret, expires);
  return secureEqual(signature, expected);
}

function sessionCookie(value) {
  return `${SESSION_COOKIE}=${encodeURIComponent(value)}; Path=/; Max-Age=${SESSION_SECONDS}; HttpOnly; Secure; SameSite=Strict`;
}

function clearSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`;
}

function sameOrigin(request) {
  const origin = request.headers.get("Origin");
  if (!origin) return true;
  try { return new URL(origin).origin === new URL(request.url).origin; } catch { return false; }
}

function loginRateLimit(request) {
  const key = request.headers.get("CF-Connecting-IP") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
  const now = Date.now();
  let bucket = loginAttempts.get(key);
  if (!bucket || now >= bucket.resetAt) bucket = { count: 0, resetAt: now + 10 * 60 * 1000 };
  bucket.count += 1;
  loginAttempts.set(key, bucket);
  return { allowed: bucket.count <= 8, retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) };
}

async function saveStoredState(env, baseData, nextState, expectedVersion, action = "save") {
  const db = getDb(env);
  if (!db) return { ok: false, status: 503, error: "D1 storage is not connected to the Worker." };
  await ensureSchema(db);
  const current = await readStoredState(env, baseData);
  if (!current.persistent) return { ok: false, status: 503, error: "D1 storage is unavailable." };
  if (Number(expectedVersion) !== Number(current.version)) {
    return { ok: false, status: 409, error: "This dashboard is out of date. Reload before saving.", currentVersion: current.version };
  }

  const clean = sanitizeAdminState(nextState, baseData);
  const version = current.version + 1;
  const now = new Date().toISOString();
  const payload = JSON.stringify(clean);
  let result;

  if (current.version === 0) {
    result = await db.prepare(
      "INSERT OR IGNORE INTO mamtu_admin_state (id, payload, version, updated_at) VALUES ('current', ?, ?, ?)"
    ).bind(payload, version, now).run();
  } else {
    result = await db.prepare(
      "UPDATE mamtu_admin_state SET payload = ?, version = ?, updated_at = ? WHERE id = 'current' AND version = ?"
    ).bind(payload, version, now, current.version).run();
  }

  const changes = Number(result?.meta?.changes ?? 0);
  if (changes !== 1) {
    return { ok: false, status: 409, error: "Another edit was saved first. Reload before saving again." };
  }

  await db.prepare(
    "INSERT OR REPLACE INTO mamtu_admin_history (version, payload, updated_at, action) VALUES (?, ?, ?, ?)"
  ).bind(version, payload, now, text(action, "save", 80)).run();

  return { ok: true, state: effectiveAdminState(clean), version, updatedAt: now, persistent: true };
}

async function listHistory(env, baseData) {
  const db = getDb(env);
  if (!db) return [];
  await ensureSchema(db);
  const result = await db.prepare(
    "SELECT version, updated_at, action FROM mamtu_admin_history ORDER BY version DESC LIMIT ?"
  ).bind(ADMIN_HISTORY_LIMIT).all();
  return Array.isArray(result?.results) ? result.results : [];
}

async function restoreVersion(env, baseData, version, expectedVersion) {
  const db = getDb(env);
  if (!db) return { ok: false, status: 503, error: "D1 storage is not connected." };
  await ensureSchema(db);
  const row = await db.prepare(
    "SELECT payload FROM mamtu_admin_history WHERE version = ?"
  ).bind(Number(version)).first();
  if (!row?.payload) return { ok: false, status: 404, error: "That saved version was not found." };
  let state = {};
  try { state = JSON.parse(row.payload); } catch {}
  return saveStoredState(env, baseData, state, expectedVersion, `restore:${Number(version)}`);
}

export async function publicContentResponse(env, baseData) {
  const stored = await loadAdminState(env, baseData);
  return adminJson({
    ok: true,
    persistent: stored.persistent,
    version: stored.version,
    updatedAt: stored.updatedAt,
    state: stored.state
  }, 200, { "X-Robots-Tag": "noindex" });
}

export async function handleAdminApi(request, env, baseData, pathname) {
  if (pathname === "/api/admin/login") {
    if (request.method !== "POST") return adminJson({ error: "Use POST." }, 405);
    if (!sameOrigin(request)) return adminJson({ error: "Origin rejected." }, 403);
    const secret = getLoginSecret(env);
    if (!secret) return adminJson({ error: "Admin login is not configured. Add MAMTU_ADMIN_PASSWORD to Worker secrets." }, 503);
    const limit = loginRateLimit(request);
    if (!limit.allowed) return adminJson({ error: "Too many login attempts. Try again later." }, 429, { "Retry-After": String(limit.retryAfter) });
    let body = {};
    try { body = await request.json(); } catch {}
    const supplied = typeof body.token === "string" ? body.token : "";
    if (!supplied || !(await secureEqual(supplied.trim(), String(secret).trim()))) return adminJson({ error: "Incorrect password. Check the saved Cloudflare Worker secret VALUE (not its name).", hint: getCredentialHint(env) }, 401);
    const session = await createSessionValue(env);
    return adminJson({ ok: true }, 200, { "Set-Cookie": sessionCookie(session) });
  }

  if (pathname === "/api/admin/logout") {
    if (request.method !== "POST") return adminJson({ error: "Use POST." }, 405);
    return adminJson({ ok: true }, 200, { "Set-Cookie": clearSessionCookie() });
  }

  if (pathname === "/api/admin/session") {
    if (request.method !== "GET") return adminJson({ error: "Use GET." }, 405);
    const authenticated = await isAuthenticated(request, env);
    return adminJson({
      ok: true,
      authenticated,
      secretConfigured: Boolean(getLoginSecret(env)),
      credentialHint: getCredentialHint(env),
      storageConnected: Boolean(getDb(env))
    });
  }

  if (!(await isAuthenticated(request, env))) return adminJson({ error: "Authentication required." }, 401);

  if (pathname === "/api/admin/state") {
    if (request.method === "GET") {
      const stored = await loadAdminState(env, baseData);
      return adminJson({
        ok: true,
        state: stored.state,
        version: stored.version,
        updatedAt: stored.updatedAt,
        persistent: stored.persistent,
        storageError: Boolean(stored.storageError)
      });
    }
    if (request.method === "PUT") {
      if (!sameOrigin(request)) return adminJson({ error: "Origin rejected." }, 403);
      let body = {};
      try { body = await request.json(); } catch {}
      const saved = await saveStoredState(env, baseData, body.state, body.expectedVersion, "save");
      return adminJson(saved.ok ? saved : { error: saved.error, currentVersion: saved.currentVersion }, saved.ok ? 200 : saved.status);
    }
    return adminJson({ error: "Use GET or PUT." }, 405);
  }

  if (pathname === "/api/admin/history") {
    if (request.method !== "GET") return adminJson({ error: "Use GET." }, 405);
    return adminJson({ ok: true, history: await listHistory(env, baseData) });
  }

  if (pathname === "/api/admin/restore") {
    if (request.method !== "POST") return adminJson({ error: "Use POST." }, 405);
    if (!sameOrigin(request)) return adminJson({ error: "Origin rejected." }, 403);
    let body = {};
    try { body = await request.json(); } catch {}
    const restored = await restoreVersion(env, baseData, body.version, body.expectedVersion);
    return adminJson(restored.ok ? restored : { error: restored.error, currentVersion: restored.currentVersion }, restored.ok ? 200 : restored.status);
  }

  return adminJson({ error: "Admin route not found." }, 404);
}
