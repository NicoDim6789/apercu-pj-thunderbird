// popup.js — panneau de prévisualisation des PJ, ouvert au clic sur le bouton.
//
// Affiche une vignette par pièce jointe (1re page pour les PDF, image réduite
// pour les images). Clic sur une vignette → ouvre la grande fenêtre d'aperçu
// sur cette PJ. Les vignettes sont mises en cache côté background (dataURL),
// donc la réouverture du panneau est instantanée.

import * as pdfjsLib from "../vendor/pdfjs/build/pdf.mjs";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  new URL("../vendor/pdfjs/build/pdf.worker.mjs", import.meta.url).href;

const CMAP_URL = new URL("../vendor/pdfjs/web/cmaps/", import.meta.url).href;
const STANDARD_FONT_URL = new URL("../vendor/pdfjs/web/standard_fonts/", import.meta.url).href;
const WASM_URL = new URL("../vendor/pdfjs/web/wasm/", import.meta.url).href;
const ICC_URL = new URL("../vendor/pdfjs/web/iccs/", import.meta.url).href;

const THUMB_W = 128; // px de rendu (haute déf, affiché à 64px → net sur écran HiDPI)

const el = {
  cards: document.getElementById("cards"),
  empty: document.getElementById("empty"),
};

let messageId = null;

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

function showEmpty(text) {
  el.cards.hidden = true;
  el.empty.textContent = text;
  el.empty.hidden = false;
}

async function init() {
  try {
    const cur = await browser.runtime.sendMessage({ type: "getCurrent" });
    messageId = cur?.messageId ?? null;
    if (messageId == null) { showEmpty("Aucun message sélectionné."); return; }

    const res = await browser.runtime.sendMessage({ type: "getPdfList", messageId });
    const items = res?.pdfs || [];
    if (items.length === 0) { showEmpty("Aucune pièce jointe affichable."); return; }

    renderCards(items);
    await generateThumbs(items);
  } catch (err) {
    console.error("[Aperçu PJ] popup init:", err);
    showEmpty("Erreur de chargement.");
  }
}

function renderCards(items) {
  el.cards.innerHTML = "";
  items.forEach((item) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "card";
    card.title = `Ouvrir « ${item.name} »`;

    const thumb = document.createElement("div");
    thumb.className = "thumb";
    const spin = document.createElement("div");
    spin.className = "spin";
    thumb.appendChild(spin);

    const meta = document.createElement("div");
    meta.className = "meta";
    const name = document.createElement("div");
    name.className = "name";
    name.textContent = item.name;
    const size = document.createElement("div");
    size.className = "size";
    size.textContent = formatSize(item.size);
    meta.append(name, size);

    card.append(thumb, meta);
    card.addEventListener("click", () => openItem(item));
    el.cards.appendChild(card);
  });
}

async function openItem(item) {
  try {
    await browser.runtime.sendMessage({ type: "openViewer", messageId, part: item.partName });
  } catch (err) {
    console.error("[Aperçu PJ] openViewer:", err);
  }
  window.close();
}

// Génère les vignettes une par une (séquentiel : évite la contention du worker).
async function generateThumbs(items) {
  const cards = [...el.cards.querySelectorAll(".card")];
  for (let i = 0; i < items.length; i++) {
    const thumb = cards[i].querySelector(".thumb");
    try {
      const dataUrl = await getOrMakeThumb(items[i]);
      const img = document.createElement("img");
      img.src = dataUrl;
      img.alt = "";
      thumb.innerHTML = "";
      thumb.appendChild(img);
    } catch (err) {
      console.error("[Aperçu PJ] thumb:", err);
      thumb.classList.add("fallback");
      thumb.textContent = items[i].kind === "image" ? "🖼" : "📄";
    }
  }
}

async function getOrMakeThumb(item) {
  const cached = await browser.runtime.sendMessage({
    type: "getThumb", messageId, partName: item.partName,
  });
  if (cached?.dataUrl) return cached.dataUrl;

  const dataUrl = await makeThumb(item);
  try {
    await browser.runtime.sendMessage({
      type: "putThumb", messageId, partName: item.partName, dataUrl,
    });
  } catch (_) { /* cache best-effort */ }
  return dataUrl;
}

async function makeThumb(item) {
  const res = await browser.runtime.sendMessage({
    type: "getPdf", messageId, partName: item.partName,
  });
  if (!res?.ok) throw new Error(res?.error || "Lecture pièce jointe échouée");
  return item.kind === "image"
    ? await imageToThumb(res.buffer, item.contentType)
    : await pdfToThumb(res.buffer);
}

function imageToThumb(buffer, contentType) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(new Blob([buffer], { type: contentType || "image/*" }));
    const im = new Image();
    im.onload = () => {
      const scale = Math.min(1, THUMB_W / im.width);
      const w = Math.max(1, Math.round(im.width * scale));
      const h = Math.max(1, Math.round(im.height * scale));
      const c = document.createElement("canvas");
      c.width = w; c.height = h;
      c.getContext("2d").drawImage(im, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL("image/jpeg", 0.72));
    };
    im.onerror = () => { URL.revokeObjectURL(url); reject(new Error("image illisible")); };
    im.src = url;
  });
}

async function pdfToThumb(buffer) {
  const doc = await pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
    cMapUrl: CMAP_URL,
    cMapPacked: true,
    standardFontDataUrl: STANDARD_FONT_URL,
    wasmUrl: WASM_URL,
    iccUrl: ICC_URL,
  }).promise;
  try {
    const page = await doc.getPage(1);
    const base = page.getViewport({ scale: 1 });
    const scale = THUMB_W / base.width;
    const vp = page.getViewport({ scale });
    const c = document.createElement("canvas");
    c.width = Math.round(vp.width);
    c.height = Math.round(vp.height);
    await page.render({ canvasContext: c.getContext("2d"), viewport: vp }).promise;
    return c.toDataURL("image/jpeg", 0.72);
  } finally {
    try { doc.destroy(); } catch (_) { /* PDF.js v6 : pas de doc.destroy() → GC */ }
  }
}

init();
