// viewer.js — UI + PDF.js
//
// Responsabilités :
//   - écouter les messages postMessage venant de content/inject.js
//   - charger PDF.js (ESM legacy) et configurer le worker
//   - gérer la liste verticale des PDFs du mail
//   - rendre la page courante du PDF actif, gérer pagination et zoom
//   - appliquer le garde-fou de taille (bouton « Charger l'aperçu »)
//   - exposer la toolbar via le registre d'actions extensible

import * as pdfjsLib from "../vendor/pdfjs/build/pdf.mjs";
import { toolbar } from "./toolbar/registry.js";
import "./toolbar/actions/print.js";

// Worker PDF.js : chemin absolu via moz-extension://
pdfjsLib.GlobalWorkerOptions.workerSrc =
  new URL("../vendor/pdfjs/build/pdf.worker.mjs", import.meta.url).href;

const CMAP_URL = new URL("../vendor/pdfjs/web/cmaps/", import.meta.url).href;
const STANDARD_FONT_URL = new URL("../vendor/pdfjs/web/standard_fonts/", import.meta.url).href;
const WASM_URL = new URL("../vendor/pdfjs/web/wasm/", import.meta.url).href;
const ICC_URL = new URL("../vendor/pdfjs/web/iccs/", import.meta.url).href;

// ---------- État ----------
const state = {
  messageId: null,
  pdfs: [],            // [{partName, name, size}, ...]
  activeIndex: -1,
  settings: null,      // {maxAutoSizeBytes, panelCollapsed}
  doc: null,           // PDFDocumentProxy en cours
  pageNum: 1,
  numPages: 0,
  zoom: "fit-width",   // "fit-width" | nombre
  renderTask: null,
};

// ---------- DOM ----------
const el = {
  root: document.getElementById("root"),
  list: document.getElementById("pdf-list"),
  empty: document.getElementById("empty-state"),
  canvas: document.getElementById("pdf-canvas"),
  loading: document.getElementById("loading"),
  error: document.getElementById("error"),
  guard: document.getElementById("size-guard"),
  guardMsg: document.getElementById("size-guard-msg"),
  guardLoad: document.getElementById("size-guard-load"),
  renderArea: document.getElementById("render-area"),
  pageInput: document.getElementById("page-input"),
  pageTotal: document.getElementById("page-total"),
  btnPrev: document.getElementById("btn-prev"),
  btnNext: document.getElementById("btn-next"),
  btnZoomIn: document.getElementById("btn-zoom-in"),
  btnZoomOut: document.getElementById("btn-zoom-out"),
  zoomSelect: document.getElementById("zoom-select"),
  actions: document.getElementById("toolbar-actions"),
};

// ---------- Helpers UI ----------
function show(node) { node.hidden = false; }
function hide(node) { node.hidden = true; }
function setError(msg) {
  hide(el.canvas); hide(el.loading); hide(el.guard); hide(el.empty);
  el.error.textContent = msg;
  show(el.error);
}
function clearError() { hide(el.error); el.error.textContent = ""; }

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

// ---------- Liste verticale ----------
function renderList() {
  el.list.innerHTML = "";
  el.root.classList.toggle("single-pdf", state.pdfs.length <= 1);

  state.pdfs.forEach((pdf, i) => {
    const item = document.createElement("div");
    item.className = "pdf-list-item" + (i === state.activeIndex ? " active" : "");
    item.tabIndex = 0;
    item.textContent = pdf.name;
    const size = document.createElement("span");
    size.className = "size";
    size.textContent = formatSize(pdf.size);
    item.appendChild(size);
    item.addEventListener("click", () => selectPdf(i));
    item.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selectPdf(i); }
    });
    el.list.appendChild(item);
  });
}

// ---------- Sélection d'un PDF ----------
async function selectPdf(index) {
  if (index < 0 || index >= state.pdfs.length) return;
  state.activeIndex = index;
  renderList();
  clearError();
  hide(el.canvas); hide(el.empty); hide(el.guard);

  const pdf = state.pdfs[index];
  const maxAuto = state.settings?.maxAutoSizeBytes ?? (15 * 1024 * 1024);

  if (pdf.size > maxAuto) {
    el.guardMsg.textContent =
      `« ${pdf.name} » fait ${formatSize(pdf.size)}, au-delà du seuil de chargement automatique (${formatSize(maxAuto)}).`;
    show(el.guard);
    el.guardLoad.onclick = () => { hide(el.guard); loadAndRender(pdf); };
    refreshToolbar(null);
    return;
  }

  await loadAndRender(pdf);
}

async function loadAndRender(pdf) {
  show(el.loading);
  try {
    const buf = await fetchPdfBuffer(pdf);
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(buf),
      cMapUrl: CMAP_URL,
      cMapPacked: true,
      standardFontDataUrl: STANDARD_FONT_URL,
      wasmUrl: WASM_URL,
      iccUrl: ICC_URL,
      disableAutoFetch: true,
      disableStream: true,
    });
    state.doc = await loadingTask.promise;
    state.numPages = state.doc.numPages;
    state.pageNum = 1;
    el.pageInput.value = "1";
    el.pageInput.max = state.numPages;
    el.pageTotal.textContent = `/ ${state.numPages}`;
    hide(el.loading);
    show(el.canvas);
    await renderPage();
    refreshToolbar(pdf);
  } catch (err) {
    console.error("[Aperçu PJ] loadAndRender:", err);
    setError(`Impossible d'afficher « ${pdf.name} » : ${err.message || err}`);
    refreshToolbar(null);
  }
}

async function fetchPdfBuffer(pdf) {
  const res = await browser.runtime.sendMessage({
    type: "getPdf",
    messageId: state.messageId,
    partName: pdf.partName,
  });
  if (!res?.ok) throw new Error("Lecture pièce jointe échouée");
  return res.buffer;
}

// ---------- Rendu d'une page ----------
async function renderPage() {
  if (!state.doc) return;
  if (state.renderTask) {
    try { state.renderTask.cancel(); } catch (_) {}
    state.renderTask = null;
  }
  const page = await state.doc.getPage(state.pageNum);
  const baseViewport = page.getViewport({ scale: 1 });

  let scale;
  if (state.zoom === "fit-width") {
    const availableWidth = el.renderArea.clientWidth - 24; // padding
    scale = Math.max(0.1, availableWidth / baseViewport.width);
  } else {
    scale = parseFloat(state.zoom) || 1;
  }
  const viewport = page.getViewport({ scale });

  const dpr = window.devicePixelRatio || 1;
  el.canvas.width = Math.floor(viewport.width * dpr);
  el.canvas.height = Math.floor(viewport.height * dpr);
  el.canvas.style.width = `${Math.floor(viewport.width)}px`;
  el.canvas.style.height = `${Math.floor(viewport.height)}px`;

  const ctx = el.canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  state.renderTask = page.render({
    canvasContext: ctx,
    viewport,
  });
  try {
    await state.renderTask.promise;
  } catch (err) {
    if (err?.name !== "RenderingCancelledException") throw err;
  } finally {
    state.renderTask = null;
  }

  el.btnPrev.disabled = state.pageNum <= 1;
  el.btnNext.disabled = state.pageNum >= state.numPages;
}

// ---------- Toolbar ----------
function refreshToolbar(pdf) {
  const ctx = {
    pdf,
    message: { id: state.messageId },
    pdfBlob: null, // disponible lazy : on évite de recharger inutilement
    pdfName: pdf?.name,
  };
  toolbar.render(el.actions, ctx);
}

// ---------- Événements UI ----------
el.btnPrev.addEventListener("click", () => {
  if (state.pageNum > 1) { state.pageNum--; el.pageInput.value = state.pageNum; renderPage(); }
});
el.btnNext.addEventListener("click", () => {
  if (state.pageNum < state.numPages) { state.pageNum++; el.pageInput.value = state.pageNum; renderPage(); }
});
el.pageInput.addEventListener("change", () => {
  const v = Math.max(1, Math.min(state.numPages, parseInt(el.pageInput.value, 10) || 1));
  state.pageNum = v; el.pageInput.value = v; renderPage();
});
el.zoomSelect.addEventListener("change", () => {
  state.zoom = el.zoomSelect.value;
  renderPage();
});
el.btnZoomIn.addEventListener("click", () => bumpZoom(+1));
el.btnZoomOut.addEventListener("click", () => bumpZoom(-1));

function bumpZoom(direction) {
  const steps = [0.5, 0.75, 1, 1.25, 1.5, 2];
  const current = state.zoom === "fit-width" ? 1 : parseFloat(state.zoom);
  let idx = steps.findIndex((s) => Math.abs(s - current) < 0.001);
  if (idx === -1) idx = steps.indexOf(1);
  idx = Math.max(0, Math.min(steps.length - 1, idx + direction));
  state.zoom = String(steps[idx]);
  el.zoomSelect.value = state.zoom;
  renderPage();
}

window.addEventListener("resize", () => {
  if (state.zoom === "fit-width" && state.doc) renderPage();
});

// ---------- Réception depuis content/inject.js ----------
window.addEventListener("message", async (event) => {
  const msg = event.data;
  if (msg?.type !== "showPdfs") return;

  state.messageId = msg.messageId;
  state.pdfs = msg.pdfs || [];
  state.settings = msg.settings || null;

  if (state.pdfs.length === 0) {
    state.doc = null;
    state.activeIndex = -1;
    hide(el.canvas); hide(el.guard); hide(el.loading); clearError();
    show(el.empty);
    el.list.innerHTML = "";
    el.pageTotal.textContent = "/ 0";
    refreshToolbar(null);
    return;
  }

  hide(el.empty);
  renderList();
  await selectPdf(0);
});

// Signal au parent que le viewer est prêt (le content script peut alors
// pousser l'état courant sans attendre le prochain onMessageDisplayed).
window.parent?.postMessage({ type: "viewerReady" }, "*");
