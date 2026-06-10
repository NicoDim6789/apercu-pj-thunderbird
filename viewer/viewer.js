// viewer.js — fenêtre popup d'aperçu PDF
//
// Charge la liste des PDFs du message via runtime, rend le PDF sélectionné
// avec PDF.js, expose une toolbar extensible (registre d'actions).
// Sauvegarde la géométrie de la fenêtre dans storage.local (via background)
// pour la restaurer à l'ouverture suivante.

import * as pdfjsLib from "../vendor/pdfjs/build/pdf.mjs";
import { toolbar } from "./toolbar/registry.js";
import "./toolbar/actions/print.js";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  new URL("../vendor/pdfjs/build/pdf.worker.mjs", import.meta.url).href;

const CMAP_URL = new URL("../vendor/pdfjs/web/cmaps/", import.meta.url).href;
const STANDARD_FONT_URL = new URL("../vendor/pdfjs/web/standard_fonts/", import.meta.url).href;
const WASM_URL = new URL("../vendor/pdfjs/web/wasm/", import.meta.url).href;
const ICC_URL = new URL("../vendor/pdfjs/web/iccs/", import.meta.url).href;

const params = new URLSearchParams(location.search);
const messageId = Number(params.get("messageId"));

const state = {
  messageId,
  pdfs: [],
  activeIndex: -1,
  doc: null,
  pageNum: 1,
  numPages: 0,
  zoom: "fit-width",
  renderTask: null,
};

const el = {
  root: document.getElementById("root"),
  list: document.getElementById("pdf-list"),
  empty: document.getElementById("empty-state"),
  canvas: document.getElementById("pdf-canvas"),
  loading: document.getElementById("loading"),
  error: document.getElementById("error"),
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

function show(n) { n.hidden = false; }
function hide(n) { n.hidden = true; }
function setError(msg) {
  hide(el.canvas); hide(el.loading); hide(el.empty);
  el.error.textContent = msg;
  show(el.error);
}
function clearError() { hide(el.error); el.error.textContent = ""; }

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

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

async function selectPdf(index) {
  if (index < 0 || index >= state.pdfs.length) return;
  state.activeIndex = index;
  renderList();
  clearError();
  hide(el.canvas); hide(el.empty);

  await loadAndRender(state.pdfs[index]);
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
    document.title = `Aperçu PJ — ${pdf.name}`;
    hide(el.loading);
    show(el.canvas);
    await renderPage();
    refreshToolbar(pdf);
  } catch (err) {
    console.error("[Aperçu PJ] loadAndRender:", err);
    hide(el.loading);
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
  if (!res?.ok) throw new Error(res?.error || "Lecture pièce jointe échouée");
  return res.buffer;
}

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
    const availableWidth = el.renderArea.clientWidth - 24;
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

  state.renderTask = page.render({ canvasContext: ctx, viewport });
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

function refreshToolbar(pdf) {
  const ctx = {
    pdf,
    message: { id: state.messageId },
    pdfName: pdf?.name,
    // Permet aux actions (impression, etc.) d'accéder au document chargé.
    pdfDoc: state.doc,
    pdfCanvas: el.canvas,
  };
  toolbar.render(el.actions, ctx);
}

// --------- Événements UI ---------
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

// Sauvegarde de la géométrie avant fermeture (pour restauration à la
// prochaine ouverture). Déclenché aussi quand l'utilisateur ferme via la
// croix : l'event beforeunload est l'occasion fiable.
function saveGeometry() {
  const geom = {
    left: window.screenX,
    top: window.screenY,
    width: window.outerWidth,
    height: window.outerHeight,
  };
  // sendMessage est "fire and forget" ici, on n'attend pas.
  try { browser.runtime.sendMessage({ type: "saveGeometry", geom }); } catch (_) {}
}
window.addEventListener("beforeunload", saveGeometry);

// --------- Initialisation ---------
async function init() {
  if (!Number.isFinite(state.messageId)) {
    setError("messageId manquant dans l'URL.");
    return;
  }
  try {
    const res = await browser.runtime.sendMessage({
      type: "getPdfList",
      messageId: state.messageId,
    });
    if (!res?.ok) throw new Error(res?.error || "getPdfList a échoué");
    state.pdfs = res.pdfs || [];

    if (state.pdfs.length === 0) {
      hide(el.canvas); hide(el.loading); clearError();
      show(el.empty);
      el.list.innerHTML = "";
      el.pageTotal.textContent = "/ 0";
      refreshToolbar(null);
      return;
    }

    hide(el.empty);
    renderList();
    await selectPdf(0);
  } catch (err) {
    console.error("[Aperçu PJ] init:", err);
    setError(`Erreur d'initialisation : ${err.message || err}`);
  }
}

init();
