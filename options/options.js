// options.js — lecture / écriture des préférences dans storage.local
//
// Toutes les valeurs sont locales à la machine (cf. décision d'architecture).

const DEFAULTS = {
  maxAutoSizeBytes: 15 * 1024 * 1024,
  panelCollapsed: false,
};

const $ = (id) => document.getElementById(id);
const inputMaxMB = $("maxAutoSizeMB");
const inputCollapsed = $("panelCollapsed");
const status = $("status");

function setStatus(text) {
  status.textContent = text;
  if (text) setTimeout(() => { status.textContent = ""; }, 2500);
}

async function load() {
  const stored = await messenger.storage.local.get(DEFAULTS);
  inputMaxMB.value = Math.round(stored.maxAutoSizeBytes / (1024 * 1024));
  inputCollapsed.checked = !!stored.panelCollapsed;
}

async function save(e) {
  e.preventDefault();
  const mb = Math.max(1, parseInt(inputMaxMB.value, 10) || 15);
  await messenger.storage.local.set({
    maxAutoSizeBytes: mb * 1024 * 1024,
    panelCollapsed: inputCollapsed.checked,
  });
  setStatus("Préférences enregistrées.");
}

async function reset() {
  await messenger.storage.local.set(DEFAULTS);
  await load();
  setStatus("Valeurs par défaut restaurées.");
}

document.getElementById("form").addEventListener("submit", save);
document.getElementById("reset").addEventListener("click", reset);
load();
