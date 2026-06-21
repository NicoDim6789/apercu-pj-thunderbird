// viewer.js — fenêtre popup d'aperçu
//
// Affichage assuré par les COMPOSANTS officiels PDF.js (pdf_viewer.mjs) :
//   - PDFViewer            → scroll continu multi-pages (A1), zoom, rotation (A4)
//   - PDFFindController     → recherche texte dans le PDF (A3)
//   - PDFLinkService        → liens internes / navigation
// On garde notre shell maison autour : liste multi-PJ (gauche), vignettes (A2),
// barre d'actions extensible (registre figé). Les images sont rendues à part (D1).
//
// Pattern officiel « components » : le document est créé par le cœur pdf.mjs
// (getDocument) puis passé à PDFViewer.setDocument(). Les deux partagent la même
// version 6.0.227, donc l'interop par proxy est sûre.

import * as pdfjsLib from "../vendor/pdfjs/build/pdf.mjs";
import {
  EventBus,
  PDFLinkService,
  PDFFindController,
  PDFViewer,
} from "../vendor/pdfjs/web/pdf_viewer.mjs";
import { toolbar } from "./toolbar/registry.js";
import "./toolbar/actions/print.js";
import "./toolbar/actions/download.js";
import "./toolbar/actions/saveas.js";
import "./toolbar/actions/open-external.js";
import "./toolbar/actions/forward.js";
import "./toolbar/actions/copy-text.js";
import "./toolbar/actions/save-page.js";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  new URL("../vendor/pdfjs/build/pdf.worker.mjs", import.meta.url).href;

const CMAP_URL = new URL("../vendor/pdfjs/web/cmaps/", import.meta.url).href;
const STANDARD_FONT_URL = new URL("../vendor/pdfjs/web/standard_fonts/", import.meta.url).href;
const WASM_URL = new URL("../vendor/pdfjs/web/wasm/", import.meta.url).href;
const ICC_URL = new URL("../vendor/pdfjs/web/iccs/", import.meta.url).href;

const THUMB_WIDTH = 120; // px — largeur de rendu des vignettes
const DEFAULT_ZOOM = "page-width";

const params = new URLSearchParams(location.search);
const messageId = Number(params.get("messageId"));

const state = {
  messageId,
  items: [],          // { partName, name, size, contentType, kind:'pdf'|'image' }
  meta: null,         // { author, subject, date } du message (nom intelligent B2)
  activeIndex: -1,
  doc: null,          // PDFDocumentProxy du PDF actif
  docGen: 0,          // incrémenté à chaque changement de doc (garde anti-course)
  thumbsBuiltGen: -1, // docGen pour lequel les vignettes ont déjà été construites
  preferredZoom: DEFAULT_ZOOM,
  imageUrl: null,     // objectURL courant (image) à révoquer
  listThumbs: {},     // partName → dataURL/objectURL (vignette de la liste, cache)
  listThumbsStarted: false,
};

const el = {
  root: document.getElementById("root"),
  list: document.getElementById("pdf-list"),
  thumbRail: document.getElementById("thumb-rail"),
  empty: document.getElementById("empty-state"),
  loading: document.getElementById("loading"),
  error: document.getElementById("error"),
  renderArea: document.getElementById("render-area"),
  viewerContainer: document.getElementById("viewerContainer"),
  viewer: document.getElementById("viewer"),
  imageView: document.getElementById("image-view"),
  imageEl: document.getElementById("image-el"),
  pageInput: document.getElementById("page-input"),
  pageTotal: document.getElementById("page-total"),
  btnThumbs: document.getElementById("btn-thumbs"),
  btnPrev: document.getElementById("btn-prev"),
  btnNext: document.getElementById("btn-next"),
  btnZoomIn: document.getElementById("btn-zoom-in"),
  btnZoomOut: document.getElementById("btn-zoom-out"),
  btnRotate: document.getElementById("btn-rotate"),
  btnFind: document.getElementById("btn-find"),
  zoomSelect: document.getElementById("zoom-select"),
  actions: document.getElementById("toolbar-actions"),
  findbar: document.getElementById("findbar"),
  findInput: document.getElementById("find-input"),
  findPrev: document.getElementById("find-prev"),
  findNext: document.getElementById("find-next"),
  findCount: document.getElementById("find-count"),
  findClose: document.getElementById("find-close"),
  // Palette de commandes
  cmdPalette: document.getElementById("cmd-palette"),
  cmdBackdrop: document.getElementById("cmd-backdrop"),
  cmdInput: document.getElementById("cmd-input"),
  cmdList: document.getElementById("cmd-list"),
  btnCmdPalette: document.getElementById("btn-cmd-palette"),
};

function show(n) { if (n) n.hidden = false; }
function hide(n) { if (n) n.hidden = true; }
function setError(msg) {
  hide(el.viewerContainer); hide(el.imageView); hide(el.loading); hide(el.empty);
  el.error.textContent = msg;
  show(el.error);
}
function clearError() { hide(el.error); el.error.textContent = ""; }

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

// ---------- l10n minimal : PDFViewer attend un objet l10n ; on lui fournit un
// stub no-op (notre chrome est déjà en français, on ne dépend pas de ses chaînes).
const l10n = {
  getLanguage: () => "fr",
  getDirection: () => "ltr",
  async get(_ids, _args, fallback) { return fallback ?? ""; },
  async translate() {},
  translateOnce() {},
  async translateElements() {},
  async translateRoots() {},
  connectRoot() {},
  disconnectRoot() {},
  pause() {},
  resume() {},
  pauseObserving() {},
  resumeObserving() {},
  async formatMessages(ids) {
    return (Array.isArray(ids) ? ids : [ids]).map(() => ({ value: "", attributes: null }));
  },
};

// ---------- Mise en place du viewer PDF.js ----------
const eventBus = new EventBus();
const linkService = new PDFLinkService({ eventBus });
const findController = new PDFFindController({ eventBus, linkService });
const pdfViewer = new PDFViewer({
  container: el.viewerContainer,
  viewer: el.viewer,
  eventBus,
  linkService,
  findController,
  l10n,
  textLayerMode: 1,
});
linkService.setViewer(pdfViewer);

eventBus.on("pagesinit", () => {
  pdfViewer.currentScaleValue = state.preferredZoom || DEFAULT_ZOOM;
  syncZoomSelect(pdfViewer.currentScaleValue);
  updateNavButtons();
});

eventBus.on("pagechanging", (evt) => {
  el.pageInput.value = String(evt.pageNumber);
  highlightThumb(evt.pageNumber);
  updateNavButtons();
  // Indicateur de page dans le titre de la fenêtre
  const item = state.activeIndex >= 0 ? state.items[state.activeIndex] : null;
  if (item) document.title = `Aperçu PJ — ${item.name} (${evt.pageNumber} / ${pdfViewer.pagesCount})`;
});

eventBus.on("scalechanging", () => {
  const v = pdfViewer.currentScaleValue;
  state.preferredZoom = v;
  persistZoom(v);
  syncZoomSelect(v);
});

eventBus.on("updatefindmatchescount", ({ matchesCount }) => showFindCount(matchesCount));
eventBus.on("updatefindcontrolstate", ({ matchesCount, state: fstate }) =>
  showFindCount(matchesCount, fstate));

// ---------- Liste des pièces jointes ----------
function kindIcon(kind) { return kind === "image" ? "🖼" : "📄"; }

function renderList() {
  el.list.innerHTML = "";
  el.root.classList.toggle("single-item", state.items.length <= 1);

  state.items.forEach((item, i) => {
    const row = document.createElement("div");
    row.className = "pdf-list-item" + (i === state.activeIndex ? " active" : "");
    row.tabIndex = 0;

    // Vignette de la pièce jointe (aperçu façon Outlook) ; emoji en attendant.
    const thumb = document.createElement("div");
    thumb.className = "li-thumb";
    const cached = state.listThumbs[item.partName];
    if (cached) {
      const img = document.createElement("img");
      img.src = cached; img.alt = "";
      thumb.appendChild(img);
    } else {
      thumb.textContent = kindIcon(item.kind);
    }

    const info = document.createElement("div");
    info.className = "li-info";
    const name = document.createElement("div");
    name.className = "li-name";
    name.textContent = item.name;
    const size = document.createElement("div");
    size.className = "size";
    size.textContent = formatSize(item.size);
    info.append(name, size);

    row.append(thumb, info);
    row.addEventListener("click", () => selectItem(i));
    row.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selectItem(i); }
    });
    el.list.appendChild(row);
  });

  // Génère les vignettes une seule fois (puis cache → re-render instantané).
  if (!state.listThumbsStarted) {
    state.listThumbsStarted = true;
    generateListThumbs();
  }
}

// Vignette par pièce jointe : 1re page pour les PDF, image réduite pour les images.
async function makeListThumb(item) {
  const buf = await fetchBuffer(item);
  if (item.kind === "image") {
    return URL.createObjectURL(new Blob([buf], { type: item.contentType || "image/*" }));
  }
  const doc = await pdfjsLib.getDocument({
    data: new Uint8Array(buf),
    cMapUrl: CMAP_URL,
    cMapPacked: true,
    standardFontDataUrl: STANDARD_FONT_URL,
    wasmUrl: WASM_URL,
    iccUrl: ICC_URL,
  }).promise;
  try {
    const page = await doc.getPage(1);
    const base = page.getViewport({ scale: 1 });
    const vp = page.getViewport({ scale: 96 / base.width });
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(vp.width);
    canvas.height = Math.round(vp.height);
    await page.render({ canvasContext: canvas.getContext("2d"), viewport: vp }).promise;
    return canvas.toDataURL("image/jpeg", 0.7);
  } finally {
    try { doc.destroy(); } catch (_) { /* PDF.js v6 : pas de doc.destroy() → GC */ }
  }
}

async function generateListThumbs() {
  for (let i = 0; i < state.items.length; i++) {
    const item = state.items[i];
    if (state.listThumbs[item.partName]) continue;
    let url;
    try {
      url = await makeListThumb(item);
    } catch (err) {
      console.error("[Aperçu PJ] vignette liste:", err);
      continue;
    }
    state.listThumbs[item.partName] = url;
    // Met à jour la ligne courante (re-query : les lignes ont pu être re-rendues).
    const rows = el.list.querySelectorAll(".pdf-list-item");
    const thumbEl = rows[i]?.querySelector(".li-thumb");
    if (thumbEl) {
      const img = document.createElement("img");
      img.src = url; img.alt = "";
      thumbEl.textContent = "";
      thumbEl.appendChild(img);
    }
  }
}

async function selectItem(index) {
  if (index < 0 || index >= state.items.length) return;
  state.activeIndex = index;
  renderList();
  clearError();
  closeFind();

  const item = state.items[index];
  if (item.kind === "image") {
    await showImage(item);
  } else {
    await showPdf(item);
  }
}

// ---------- Affichage PDF ----------
async function fetchBuffer(item) {
  const res = await browser.runtime.sendMessage({
    type: "getPdf",
    messageId: state.messageId,
    partName: item.partName,
  });
  if (!res?.ok) throw new Error(res?.error || "Lecture pièce jointe échouée");
  return res.buffer;
}

async function showPdf(item) {
  releaseImage();
  hide(el.imageView); hide(el.empty); clearError();
  setPdfControlsEnabled(true);
  // Le conteneur doit être visible AVANT setDocument : sinon clientWidth = 0
  // et le preset « page-width » calculé à pagesinit serait erroné.
  show(el.viewerContainer);
  show(el.loading);

  const gen = ++state.docGen;
  try {
    const buf = await fetchBuffer(item);
    if (gen !== state.docGen) return; // un autre item a été sélectionné entre-temps

    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(buf),
      cMapUrl: CMAP_URL,
      cMapPacked: true,
      standardFontDataUrl: STANDARD_FONT_URL,
      wasmUrl: WASM_URL,
      iccUrl: ICC_URL,
    });
    const doc = await loadingTask.promise;
    if (gen !== state.docGen) { try { doc.destroy(); } catch (_) {} return; }

    state.doc = doc;
    pdfViewer.setDocument(doc);
    linkService.setDocument(doc, null);

    el.pageInput.max = String(doc.numPages);
    el.pageTotal.textContent = `/ ${doc.numPages}`;
    document.title = `Aperçu PJ — ${item.name}`;

    hide(el.loading);

    // Vignettes : construites paresseusement quand le rail est ouvert.
    if (!el.thumbRail.hidden) buildThumbnails(doc, gen);

    refreshToolbar(item);
  } catch (err) {
    if (gen !== state.docGen) return;
    console.error("[Aperçu PJ] showPdf:", err);
    hide(el.loading);
    setError(`Impossible d'afficher « ${item.name} » : ${err.message || err}`);
    refreshToolbar(null);
  }
}

// ---------- Affichage image (D1) ----------
function releaseImage() {
  if (state.imageUrl) { URL.revokeObjectURL(state.imageUrl); state.imageUrl = null; }
}

async function showImage(item) {
  // On vide le viewer PDF pour libérer la mémoire et arrêter le rendu.
  state.docGen++;
  if (state.doc) { try { pdfViewer.setDocument(null); } catch (_) {} }
  state.doc = null;
  hide(el.viewerContainer); hide(el.empty); hide(el.thumbRail);
  setPdfControlsEnabled(false);
  show(el.loading);

  const gen = ++state.docGen;
  try {
    const buf = await fetchBuffer(item);
    if (gen !== state.docGen) return;
    releaseImage();
    const blob = new Blob([buf], { type: item.contentType || "image/*" });
    state.imageUrl = URL.createObjectURL(blob);
    el.imageEl.src = state.imageUrl;
    el.imageEl.alt = item.name;
    document.title = `Aperçu PJ — ${item.name}`;
    hide(el.loading);
    show(el.imageView);
    refreshToolbar(item);
  } catch (err) {
    if (gen !== state.docGen) return;
    console.error("[Aperçu PJ] showImage:", err);
    hide(el.loading);
    setError(`Impossible d'afficher « ${item.name} » : ${err.message || err}`);
    refreshToolbar(null);
  }
}

// ---------- Vignettes (A2) ----------
async function buildThumbnails(doc, gen) {
  if (state.thumbsBuiltGen === gen) return;
  state.thumbsBuiltGen = gen;
  el.thumbRail.innerHTML = "";

  for (let i = 1; i <= doc.numPages; i++) {
    if (gen !== state.docGen) return; // doc changé : on abandonne
    let page;
    try {
      page = await doc.getPage(i);
    } catch (_) { continue; }
    if (gen !== state.docGen) return;

    const base = page.getViewport({ scale: 1 });
    const scale = THUMB_WIDTH / base.width;
    const vp = page.getViewport({ scale });
    const dpr = window.devicePixelRatio || 1;

    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(vp.width * dpr);
    canvas.height = Math.floor(vp.height * dpr);
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const wrap = document.createElement("button");
    wrap.type = "button";
    wrap.className = "thumb" + (i === pdfViewer.currentPageNumber ? " active" : "");
    wrap.dataset.page = String(i);
    wrap.appendChild(canvas);
    const num = document.createElement("span");
    num.className = "num";
    num.textContent = String(i);
    wrap.appendChild(num);
    wrap.addEventListener("click", () => goPage(i));
    el.thumbRail.appendChild(wrap);

    try {
      await page.render({ canvasContext: ctx, viewport: vp }).promise;
    } catch (_) { /* rendu vignette non bloquant */ }
  }
}

function highlightThumb(pageNumber) {
  for (const t of el.thumbRail.querySelectorAll(".thumb")) {
    t.classList.toggle("active", t.dataset.page === String(pageNumber));
  }
  const active = el.thumbRail.querySelector(".thumb.active");
  if (active && !el.thumbRail.hidden) active.scrollIntoView({ block: "nearest" });
}

// ---------- Contexte partagé toolbar + palette ----------
function buildCtx(item) {
  const it = item ?? (state.activeIndex >= 0 ? state.items[state.activeIndex] : null);
  const isPdf = it?.kind === "pdf";
  return {
    pdf: isPdf ? it : null,
    item: it,
    message: { id: state.messageId },
    meta: state.meta,
    pdfName: it?.name,
    pdfDoc: isPdf ? state.doc : null,
    pdfCanvas: null,
    viewer: pdfViewer,
  };
}

function refreshToolbar(item) {
  toolbar.render(el.actions, buildCtx(item));
}

// ---------- Palette de commandes (Ctrl+K) ----------
const CMD_DEFS = [
  { icon: "🔍", label: "Rechercher dans le PDF",  shortcut: "Ctrl+F", cat: "Navigation", available: () => !!state.doc, action: () => openFind() },
  { icon: "⏮",  label: "Première page",           shortcut: "Home",   cat: "Navigation", available: () => !!state.doc, action: () => goPage(1) },
  { icon: "⏭",  label: "Dernière page",            shortcut: "End",    cat: "Navigation", available: () => !!state.doc, action: () => goPage(pdfViewer.pagesCount) },
  { icon: "◀",  label: "Page précédente",          shortcut: "←",      cat: "Navigation", available: () => !!state.doc, action: () => goPage(pdfViewer.currentPageNumber - 1) },
  { icon: "▶",  label: "Page suivante",            shortcut: "→",      cat: "Navigation", available: () => !!state.doc, action: () => goPage(pdfViewer.currentPageNumber + 1) },
  { icon: "🔎", label: "Zoom avant",               shortcut: "+",      cat: "Zoom",       available: () => !!state.doc, action: () => zoomBy(+1) },
  { icon: "🔍", label: "Zoom arrière",             shortcut: "−",      cat: "Zoom",       available: () => !!state.doc, action: () => zoomBy(-1) },
  { icon: "↔",  label: "Zoom : Largeur de page",                       cat: "Zoom",       available: () => !!state.doc, action: () => { pdfViewer.currentScaleValue = "page-width"; } },
  { icon: "📐", label: "Zoom : Page entière",                          cat: "Zoom",       available: () => !!state.doc, action: () => { pdfViewer.currentScaleValue = "page-fit"; } },
  { icon: "1",  label: "Zoom : 100 %",                                 cat: "Zoom",       available: () => !!state.doc, action: () => { pdfViewer.currentScaleValue = "1"; } },
  { icon: "▦",  label: "Vignettes des pages",                          cat: "Affichage",  available: () => !!state.doc, action: () => el.btnThumbs.click() },
  { icon: "⟳",  label: "Pivoter (sens horaire)",                       cat: "Affichage",  available: () => true,        action: () => el.btnRotate.click() },
  { icon: "✕",  label: "Fermer la fenêtre",        shortcut: "Esc",    cat: "Fenêtre",    available: () => true,        action: () => window.close() },
];

let _cmdFiltered = [];
let _cmdActiveIdx = -1;

function openCmdPalette() {
  el.cmdPalette.hidden = false;
  el.cmdInput.value = "";
  _renderCmdList("");
  el.cmdInput.focus();
}
function closeCmdPalette() {
  el.cmdPalette.hidden = true;
}

function _renderCmdList(q) {
  const query = q.toLowerCase().trim();
  const ctx = buildCtx();

  // Commandes statiques + actions du registre toolbar
  const allCmds = [...CMD_DEFS];
  for (const action of toolbar.list()) {
    try {
      if (action.isAvailable(ctx)) {
        allCmds.push({ icon: "⚡", label: action.label, cat: "Actions", available: () => true, action: () => action.handler(ctx) });
      }
    } catch (_) {}
  }

  _cmdFiltered = query
    ? allCmds.filter((c) => c.available() && c.label.toLowerCase().includes(query))
    : allCmds.filter((c) => c.available());
  _cmdActiveIdx = _cmdFiltered.length > 0 ? 0 : -1;

  el.cmdList.innerHTML = "";
  if (_cmdFiltered.length === 0) {
    el.cmdList.innerHTML = '<li style="padding:14px;text-align:center;color:var(--apj-fg-2);font-size:13px">Aucune commande trouvée</li>';
    return;
  }

  let lastCat = null;
  _cmdFiltered.forEach((cmd, i) => {
    if (!query && cmd.cat !== lastCat) {
      const hdr = document.createElement("li");
      hdr.className = "cmd-section-header";
      hdr.textContent = cmd.cat;
      el.cmdList.appendChild(hdr);
      lastCat = cmd.cat;
    }
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "cmd-item" + (i === _cmdActiveIdx ? " active" : "");
    const icon = document.createElement("span"); icon.className = "cmd-item-icon"; icon.textContent = cmd.icon;
    const label = document.createElement("span"); label.className = "cmd-item-label"; label.textContent = cmd.label;
    btn.append(icon, label);
    if (cmd.shortcut) {
      const kbd = document.createElement("kbd"); kbd.className = "cmd-item-shortcut"; kbd.textContent = cmd.shortcut;
      btn.appendChild(kbd);
    }
    btn.addEventListener("mouseenter", () => { _cmdActiveIdx = i; _refreshCmdActive(); });
    btn.addEventListener("click", () => { closeCmdPalette(); setTimeout(() => { try { cmd.action(); } catch (_) {} }, 0); });
    li.appendChild(btn);
    el.cmdList.appendChild(li);
  });
}

function _refreshCmdActive() {
  el.cmdList.querySelectorAll(".cmd-item").forEach((b, i) => b.classList.toggle("active", i === _cmdActiveIdx));
  const active = el.cmdList.querySelector(".cmd-item.active");
  if (active) active.scrollIntoView({ block: "nearest" });
}

el.cmdInput.addEventListener("input", () => _renderCmdList(el.cmdInput.value));
el.cmdInput.addEventListener("keydown", (e) => {
  if (e.key === "ArrowDown") {
    e.preventDefault();
    _cmdActiveIdx = Math.min(_cmdActiveIdx + 1, _cmdFiltered.length - 1);
    _refreshCmdActive();
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    _cmdActiveIdx = Math.max(_cmdActiveIdx - 1, 0);
    _refreshCmdActive();
  } else if (e.key === "Enter") {
    e.preventDefault();
    const cmd = _cmdFiltered[_cmdActiveIdx];
    if (cmd) { closeCmdPalette(); setTimeout(() => { try { cmd.action(); } catch (_) {} }, 0); }
  } else if (e.key === "Escape") {
    e.preventDefault(); closeCmdPalette();
  }
});
el.cmdBackdrop.addEventListener("click", () => closeCmdPalette());
el.btnCmdPalette.addEventListener("click", () => el.cmdPalette.hidden ? openCmdPalette() : closeCmdPalette());

// ---------- Navigation / zoom / rotation ----------
function goPage(n) {
  if (!state.doc) return;
  const p = Math.max(1, Math.min(pdfViewer.pagesCount, n));
  pdfViewer.currentPageNumber = p;
}

function updateNavButtons() {
  const cur = pdfViewer.currentPageNumber || 1;
  const total = pdfViewer.pagesCount || 0;
  el.btnPrev.disabled = cur <= 1;
  el.btnNext.disabled = total === 0 || cur >= total;
}

function zoomBy(direction) {
  if (!state.doc) return;
  const cur = pdfViewer.currentScale || 1;
  const next = direction > 0 ? cur * 1.1 : cur / 1.1;
  pdfViewer.currentScaleValue = String(Math.max(0.1, Math.min(10, +next.toFixed(3))));
}

function syncZoomSelect(value) {
  const options = [...el.zoomSelect.options].map((o) => o.value);
  el.zoomSelect.value = options.includes(value) ? value : "";
}

function persistZoom(value) {
  // Préférence par machine (storage.local). On ne mémorise que les valeurs
  // « stables » (presets nommés) pour rester prévisible d'un PDF à l'autre.
  if (typeof value === "string" && /^(auto|page-width|page-fit)$/.test(value)) {
    try { browser.storage.local.set({ preferredZoom: value }); } catch (_) {}
  }
}

// ---------- Recherche (A3) ----------
function dispatchFind(type, findPrevious = false) {
  eventBus.dispatch("find", {
    source: window,
    type,
    query: el.findInput.value,
    caseSensitive: false,
    entireWord: false,
    highlightAll: true,
    findPrevious,
    matchDiacritics: false,
  });
}

function openFind() {
  if (!state.doc) return;
  show(el.findbar);
  el.findInput.focus();
  el.findInput.select();
}

function closeFind() {
  if (el.findbar.hidden) return;
  hide(el.findbar);
  el.findInput.value = "";
  el.findCount.textContent = "";
  // Efface les surlignages
  eventBus.dispatch("find", {
    source: window, type: "", query: "", caseSensitive: false,
    entireWord: false, highlightAll: false, findPrevious: false, matchDiacritics: false,
  });
}

function showFindCount(matchesCount, fstate) {
  // FindState : 0 FOUND, 1 NOT_FOUND, 2 WRAPPED, 3 PENDING
  if (fstate === 1) { el.findCount.textContent = "Aucun résultat"; return; }
  if (!el.findInput.value) { el.findCount.textContent = ""; return; }
  if (matchesCount && matchesCount.total > 0) {
    el.findCount.textContent = `${matchesCount.current} / ${matchesCount.total}`;
  } else {
    el.findCount.textContent = "";
  }
}

function setPdfControlsEnabled(on) {
  for (const b of [el.btnThumbs, el.btnPrev, el.btnNext, el.btnZoomIn,
    el.btnZoomOut, el.btnFind, el.pageInput, el.zoomSelect]) {
    if (b) b.disabled = !on;
  }
  // La rotation reste disponible pour les images aussi (via CSS transform).
  if (el.btnRotate) el.btnRotate.disabled = false;
}

// ---------- Événements UI ----------
el.btnThumbs.addEventListener("click", () => {
  el.thumbRail.hidden = !el.thumbRail.hidden;
  if (!el.thumbRail.hidden && state.doc) buildThumbnails(state.doc, state.docGen);
});
el.btnPrev.addEventListener("click", () => goPage(pdfViewer.currentPageNumber - 1));
el.btnNext.addEventListener("click", () => goPage(pdfViewer.currentPageNumber + 1));
el.pageInput.addEventListener("change", () => goPage(parseInt(el.pageInput.value, 10) || 1));
el.zoomSelect.addEventListener("change", () => {
  if (state.doc && el.zoomSelect.value) pdfViewer.currentScaleValue = el.zoomSelect.value;
});
el.btnZoomIn.addEventListener("click", () => zoomBy(+1));
el.btnZoomOut.addEventListener("click", () => zoomBy(-1));
el.btnRotate.addEventListener("click", () => {
  if (state.doc) {
    pdfViewer.pagesRotation = (pdfViewer.pagesRotation + 90) % 360;
  } else if (!el.imageView.hidden) {
    // Rotation CSS pour les images (pas de PDF actif)
    const cur = parseInt(el.imageEl.dataset.rotation || "0", 10);
    const next = (cur + 90) % 360;
    el.imageEl.dataset.rotation = String(next);
    el.imageEl.style.transform = next ? `rotate(${next}deg)` : "";
  }
});
el.btnFind.addEventListener("click", () => (el.findbar.hidden ? openFind() : closeFind()));

el.findInput.addEventListener("input", () => dispatchFind(""));
el.findInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") { e.preventDefault(); dispatchFind("again", e.shiftKey); }
  else if (e.key === "Escape") { e.preventDefault(); closeFind(); }
});
el.findPrev.addEventListener("click", () => dispatchFind("again", true));
el.findNext.addEventListener("click", () => dispatchFind("again", false));
el.findClose.addEventListener("click", () => closeFind());

// ---------- Zoom à la molette (Ctrl+scroll) ----------
el.renderArea.addEventListener("wheel", (e) => {
  if (!e.ctrlKey || !state.doc) return;
  e.preventDefault();
  zoomBy(e.deltaY < 0 ? +1 : -1);
}, { passive: false });

// ---------- Raccourcis clavier (A6) ----------
window.addEventListener("keydown", (e) => {
  const inField = e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA");

  if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
    e.preventDefault(); el.cmdPalette.hidden ? openCmdPalette() : closeCmdPalette(); return;
  }
  if ((e.ctrlKey || e.metaKey) && (e.key === "f" || e.key === "F")) {
    e.preventDefault(); openFind(); return;
  }
  if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "S")) {
    e.preventDefault();
    const saveAs = toolbar.list().find((a) => a.id === "save-as");
    const ctx = buildCtx();
    if (saveAs?.isAvailable(ctx)) saveAs.handler(ctx).catch(() => {});
    return;
  }
  if (e.key === "Escape") {
    if (!el.cmdPalette.hidden) { closeCmdPalette(); return; }
    if (!el.findbar.hidden) { closeFind(); return; }
    window.close(); return;
  }
  if (inField) return;

  switch (e.key) {
    case "ArrowRight":
      e.preventDefault(); goPage(pdfViewer.currentPageNumber + 1); break;
    case "ArrowLeft":
      e.preventDefault(); goPage(pdfViewer.currentPageNumber - 1); break;
    case "Home":
      e.preventDefault(); goPage(1); break;
    case "End":
      e.preventDefault(); goPage(pdfViewer.pagesCount); break;
    case "+": case "=":
      e.preventDefault(); zoomBy(+1); break;
    case "-":
      e.preventDefault(); zoomBy(-1); break;
    default: break;
  }
});

// ---------- Sauvegarde de la géométrie de la fenêtre ----------
// Sauvegarde directement dans storage.local (pas via background) pour fiabilité.
// Le background lit windowGeom au moment d'ouvrir la prochaine fenêtre.
function saveGeometry() {
  const geom = {
    left: window.screenX,
    top: window.screenY,
    width: window.outerWidth,
    height: window.outerHeight,
  };
  try { browser.storage.local.set({ windowGeom: geom }); } catch (_) {}
}

// Debounce sur resize : sauvegarde 600 ms après la dernière modification.
let _geoTimer;
window.addEventListener("resize", () => {
  clearTimeout(_geoTimer);
  _geoTimer = setTimeout(saveGeometry, 600);
});

window.addEventListener("beforeunload", () => {
  releaseImage();
  // Révoquer les objectURLs des vignettes de la liste (images seulement — les
  // dataURLs PDF sont de simples strings, pas des objectURLs à révoquer).
  for (const [partName, url] of Object.entries(state.listThumbs)) {
    const item = state.items.find((i) => i.partName === partName);
    if (item?.kind === "image" && url?.startsWith("blob:")) {
      try { URL.revokeObjectURL(url); } catch (_) {}
    }
  }
  saveGeometry();
});

// ---------- Initialisation ----------
async function init() {
  if (!Number.isFinite(state.messageId)) {
    setError("messageId manquant dans l'URL.");
    return;
  }
  try {
    const prefs = await browser.storage.local.get({ preferredZoom: DEFAULT_ZOOM });
    state.preferredZoom = prefs.preferredZoom || DEFAULT_ZOOM;
  } catch (_) { /* défaut conservé */ }

  try {
    const res = await browser.runtime.sendMessage({
      type: "getPdfList",
      messageId: state.messageId,
    });
    if (!res?.ok) throw new Error(res?.error || "getPdfList a échoué");
    state.items = res.pdfs || [];
    state.meta = res.meta || null;

    if (state.items.length === 0) {
      hide(el.viewerContainer); hide(el.imageView); hide(el.loading); clearError();
      show(el.empty);
      el.list.innerHTML = "";
      el.pageTotal.textContent = "/ 0";
      setPdfControlsEnabled(false);
      refreshToolbar(null);
      return;
    }

    hide(el.empty);
    renderList();
    // Si le popup a demandé une PJ précise (?part=…), on l'ouvre ; sinon on
    // ouvre d'emblée sur le 1er PDF (un mail commence souvent par l'image de
    // signature inline) ; sinon sur le premier élément.
    const wantedPart = params.get("part");
    let startIndex = wantedPart
      ? state.items.findIndex((it) => it.partName === wantedPart)
      : -1;
    if (startIndex < 0) startIndex = state.items.findIndex((it) => it.kind === "pdf");
    if (startIndex < 0) startIndex = 0;
    await selectItem(startIndex);
  } catch (err) {
    console.error("[Aperçu PJ] init:", err);
    setError(`Erreur d'initialisation : ${err.message || err}`);
  }
}

init();
