// options.js — préférences locales (par machine).

const DEFAULTS = {
  windowGeom: { width: 900, height: 950 },
  autoOpenSingle: false,
};

const $ = (id) => document.getElementById(id);
const status = $("status");

function setStatus(text) {
  status.textContent = text;
  if (text) setTimeout(() => { status.textContent = ""; }, 2500);
}

async function load() {
  const stored = await messenger.storage.local.get(DEFAULTS);
  const g = stored.windowGeom || DEFAULTS.windowGeom;
  $("width").value = g.width;
  $("height").value = g.height;
  $("autoOpenSingle").checked = !!stored.autoOpenSingle;
}

async function save(e) {
  e.preventDefault();
  const width = Math.max(400, parseInt($("width").value, 10) || 900);
  const height = Math.max(400, parseInt($("height").value, 10) || 950);
  const existing = await messenger.storage.local.get({ windowGeom: {} });
  await messenger.storage.local.set({
    windowGeom: { ...existing.windowGeom, width, height },
    autoOpenSingle: $("autoOpenSingle").checked,
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
