const loginView = document.querySelector("[data-login-view]");
const appView = document.querySelector("[data-app-view]");
const loginForm = document.querySelector("[data-login-form]");
const loginMessage = document.querySelector("[data-login-message]");
const saveButton = document.querySelector("[data-save]");
const saveStateLabel = document.querySelector("[data-save-state]");
const saveDetail = document.querySelector("[data-save-detail]");
const storageWarning = document.querySelector("[data-storage-warning]");
const storageDot = document.querySelector("[data-storage-dot]");
const storageLabel = document.querySelector("[data-storage-label]");
const versionLabel = document.querySelector("[data-version]");
const updatedLabel = document.querySelector("[data-updated]");
const availabilitySummary = document.querySelector("[data-availability-summary]");
const historyBox = document.querySelector("[data-history]");

let state = null;
let version = 0;
let persistent = false;
let dirty = false;

const STATUS_LABELS = {
  accepting: "Accepting enquiries",
  limited: "Limited availability",
  away: "Temporarily away",
  unavailable: "Not accepting enquiries"
};

function esc(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  let body = {};
  try { body = await response.json(); } catch {}
  if (!response.ok) {
    const error = new Error(body.error || `Request failed (${response.status})`);
    error.status = response.status;
    error.body = body;
    throw error;
  }
  return body;
}

function getPath(object, path) {
  return path.split(".").reduce((value, key) => value?.[key], object);
}

function setPath(object, path, value) {
  const parts = path.split(".");
  let cursor = object;
  parts.forEach((part, index) => {
    if (index === parts.length - 1) cursor[part] = value;
    else cursor = cursor[part] ||= {};
  });
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function populateMediaOptions() {
  document.querySelectorAll("[data-image-select]").forEach(select => {
    select.innerHTML = Array.from({ length: 8 }, (_, index) => {
      const n = index + 1;
      return `<option value="/assets/images/${n}.jpeg">Image ${n}</option>`;
    }).join("");
  });
  document.querySelectorAll("[data-video-select]").forEach(select => {
    select.innerHTML = Array.from({ length: 3 }, (_, index) => {
      const n = index + 1;
      return `<option value="/assets/videos/${n}.mp4">Video ${n}</option>`;
    }).join("");
  });
}

function fillForm() {
  if (!state) return;
  document.querySelectorAll("[data-field]").forEach(input => {
    const value = getPath(state, input.dataset.field);
    if (input.type === "checkbox") input.checked = Boolean(value);
    else input.value = value ?? "";
  });
  document.querySelectorAll('input[name="availabilityStatus"]').forEach(input => {
    input.checked = input.value === state.availability?.status;
  });
  updatePreviews();
  updateSummary();
  setDirty(false);
}

function collectState() {
  const next = clone(state || {});
  document.querySelectorAll("[data-field]").forEach(input => {
    const value = input.type === "checkbox" ? input.checked : input.value;
    setPath(next, input.dataset.field, value);
  });
  const selected = document.querySelector('input[name="availabilityStatus"]:checked');
  if (selected) next.availability.status = selected.value;
  delete next.availability?.expired;
  return next;
}

function updatePreviews() {
  const current = collectState();
  document.querySelectorAll("[data-preview]").forEach(element => {
    const value = getPath(current, element.dataset.preview);
    if (!value) return;
    element.src = value;
  });
}

function updateSummary() {
  const selected = document.querySelector('input[name="availabilityStatus"]:checked')?.value || state?.availability?.status || "accepting";
  availabilitySummary.textContent = STATUS_LABELS[selected] || "Availability";
}

function setDirty(value = true) {
  dirty = value;
  if (!saveButton) return;
  saveButton.disabled = !persistent || !dirty;
  saveStateLabel.textContent = dirty ? "Unsaved changes" : "All changes loaded";
  saveDetail.textContent = !persistent
    ? "Connect D1 before changes can be saved."
    : (dirty ? "Review the edits, then use Save & apply." : "Edits are not live until you change and save them.");
}

function friendlyDate(value) {
  if (!value) return "Not saved yet";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

function renderStorage() {
  storageWarning.hidden = persistent;
  storageDot.classList.toggle("is-good", persistent);
  storageLabel.textContent = persistent ? "D1 connected" : "D1 not connected";
  versionLabel.textContent = `Version ${version}`;
}

async function loadHistory() {
  if (!historyBox || !persistent) {
    if (historyBox) historyBox.innerHTML = '<p class="mc-muted">Connect D1 to use history and recovery.</p>';
    return;
  }
  try {
    const body = await api("/api/admin/history");
    const rows = body.history || [];
    if (!rows.length) {
      historyBox.innerHTML = '<p class="mc-muted">History will appear after your first save.</p>';
      return;
    }
    historyBox.innerHTML = rows.map(row => `
      <div class="mc-history-row">
        <div>
          <strong>Version ${Number(row.version)}</strong>
          <small>${esc(friendlyDate(row.updated_at))} · ${esc(row.action || "save")}</small>
        </div>
        <button type="button" data-restore="${Number(row.version)}">Restore</button>
      </div>
    `).join("");
  } catch (error) {
    historyBox.innerHTML = `<p class="mc-muted">${esc(error.message)}</p>`;
  }
}

async function loadState() {
  try {
    const body = await api("/api/admin/state");
    state = body.state;
    version = Number(body.version) || 0;
    persistent = Boolean(body.persistent);
    renderStorage();
    updatedLabel.textContent = friendlyDate(body.updatedAt);
    fillForm();
    await loadHistory();
  } catch (error) {
    if (error.status === 401) return showLogin("Your owner session expired. Please sign in again.");
    throw error;
  }
}

function showLogin(message = "") {
  loginView.hidden = false;
  appView.hidden = true;
  loginMessage.textContent = message;
}

async function showApp() {
  loginView.hidden = true;
  appView.hidden = false;
  await loadState();
}

loginForm?.addEventListener("submit", async event => {
  event.preventDefault();
  loginMessage.textContent = "Checking…";
  const button = loginForm.querySelector("button");
  button.disabled = true;
  try {
    const token = new FormData(loginForm).get("token");
    await api("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({ token })
    });
    loginForm.reset();
    await showApp();
  } catch (error) {
    loginMessage.textContent = error.message;
  } finally {
    button.disabled = false;
  }
});

document.querySelector("[data-logout]")?.addEventListener("click", async () => {
  try { await api("/api/admin/logout", { method: "POST", body: "{}" }); } catch {}
  showLogin("Signed out.");
});

document.querySelectorAll("[data-tab]").forEach(button => {
  button.addEventListener("click", () => {
    const name = button.dataset.tab;
    document.querySelectorAll("[data-tab]").forEach(item => item.classList.toggle("is-active", item === button));
    document.querySelectorAll("[data-panel]").forEach(panel => {
      const active = panel.dataset.panel === name;
      panel.hidden = !active;
      panel.classList.toggle("is-active", active);
    });
    if (name === "history") loadHistory();
  });
});

document.addEventListener("input", event => {
  if (!appView || appView.hidden) return;
  if (event.target.matches("[data-field], input[name='availabilityStatus']")) {
    setDirty(true);
    updateSummary();
    if (event.target.matches("[data-image-select],[data-video-select]")) updatePreviews();
  }
});
document.addEventListener("change", event => {
  if (!appView || appView.hidden) return;
  if (event.target.matches("[data-field], input[name='availabilityStatus']")) {
    setDirty(true);
    updateSummary();
    if (event.target.matches("[data-image-select],[data-video-select]")) updatePreviews();
  }
});

saveButton?.addEventListener("click", async () => {
  if (!persistent || !dirty) return;
  saveButton.disabled = true;
  saveStateLabel.textContent = "Saving…";
  try {
    const body = await api("/api/admin/state", {
      method: "PUT",
      body: JSON.stringify({ state: collectState(), expectedVersion: version })
    });
    state = body.state;
    version = Number(body.version) || version;
    persistent = Boolean(body.persistent);
    versionLabel.textContent = `Version ${version}`;
    updatedLabel.textContent = friendlyDate(body.updatedAt);
    fillForm();
    saveStateLabel.textContent = "Saved & live";
    saveDetail.textContent = "The public website and Mamtu Assistant now use this version.";
    await loadHistory();
  } catch (error) {
    saveStateLabel.textContent = "Could not save";
    saveDetail.textContent = error.message;
    if (error.status === 409) await loadState();
  } finally {
    saveButton.disabled = !persistent || !dirty;
  }
});

historyBox?.addEventListener("click", async event => {
  const button = event.target.closest("[data-restore]");
  if (!button) return;
  const targetVersion = Number(button.dataset.restore);
  if (!Number.isFinite(targetVersion)) return;
  const okay = window.confirm(`Restore version ${targetVersion}? This creates a new current version; it does not delete history.`);
  if (!okay) return;
  button.disabled = true;
  try {
    const body = await api("/api/admin/restore", {
      method: "POST",
      body: JSON.stringify({ version: targetVersion, expectedVersion: version })
    });
    state = body.state;
    version = Number(body.version) || version;
    updatedLabel.textContent = friendlyDate(body.updatedAt);
    fillForm();
    await loadHistory();
  } catch (error) {
    window.alert(error.message);
  } finally {
    button.disabled = false;
  }
});

document.querySelector("[data-export]")?.addEventListener("click", () => {
  if (!state) return;
  const payload = JSON.stringify({ version, exportedAt: new Date().toISOString(), state: collectState() }, null, 2);
  const blob = new Blob([payload], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `mamtu-control-v${version}.json`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
});

async function bootstrap() {
  populateMediaOptions();
  try {
    const session = await api("/api/admin/session");
    if (session.authenticated) await showApp();
    else showLogin(session.secretConfigured ? "" : "The Worker admin secret is not configured yet.");
  } catch (error) {
    showLogin(error.message);
  }
}

bootstrap();
