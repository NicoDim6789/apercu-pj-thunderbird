// background.js — Aperçu PJ (architecture popup, TB 151 MV3)
//
// Pourquoi cette architecture : en TB 151 MV3, AUCUNE API n'expose
// l'injection d'un script dans la zone du message. On utilise un bouton
// messageDisplayAction + une fenêtre popup déplaçable contenant le viewer.
//
// Points d'entrée pour ouvrir l'aperçu :
//   - clic sur le bouton messageDisplayAction
//   - entrée de menu contextuel sur une pièce jointe (C1)
//   - raccourci clavier Ctrl+Alt+P (C2)
//   - ouverture auto si le message ouvert ne contient qu'un seul PDF (C3, option)
//
// Le badge du bouton affiche le nombre total de pièces jointes (C4).

// PDF.js est chargé À LA DEMANDE (import dynamique) pour générer les miniatures.
// Background classique ("scripts") → pas d'import statique ; import() lazy via
// une URL d'extension absolue (runtime.getURL). Évite de passer le background en
// page module (qui ne se rechargeait pas / risquait de tout casser).
const APJ_CMAP_URL = messenger.runtime.getURL("vendor/pdfjs/web/cmaps/");
const APJ_STD_FONT_URL = messenger.runtime.getURL("vendor/pdfjs/web/standard_fonts/");
const APJ_WASM_URL = messenger.runtime.getURL("vendor/pdfjs/web/wasm/");
const APJ_ICC_URL = messenger.runtime.getURL("vendor/pdfjs/web/iccs/");
const APJ_THUMB_W = 200; // largeur de rendu des miniatures inline (px)

let _pdfjsPromise = null;
function getPdfjs() {
  if (!_pdfjsPromise) {
    _pdfjsPromise = import(messenger.runtime.getURL("vendor/pdfjs/build/pdf.mjs")).then((m) => {
      m.GlobalWorkerOptions.workerSrc = messenger.runtime.getURL("vendor/pdfjs/build/pdf.worker.mjs");
      return m;
    });
  }
  return _pdfjsPromise;
}

console.log("[Aperçu PJ] background démarré v" + messenger.runtime.getManifest().version);

const PDF_MIME = "application/pdf";

const DEFAULTS = {
  windowGeom: { width: 900, height: 950 },
};

async function getSettings() {
  return await messenger.storage.local.get(DEFAULTS);
}

// Pièces jointes affichables par le viewer : PDF + images (D1).
function previewKind(contentType) {
  if (contentType === PDF_MIME) return "pdf";
  if (typeof contentType === "string" && contentType.startsWith("image/")) return "image";
  return null;
}

function collectPreviewable(parts) {
  const out = [];
  for (const p of parts || []) {
    const kind = previewKind(p.contentType);
    if (kind && p.name) {
      out.push({
        partName: p.partName,
        name: p.name,
        size: p.size ?? 0,
        contentType: p.contentType,
        kind,
      });
    }
    if (p.parts) out.push(...collectPreviewable(p.parts));
  }
  return out;
}

// C4 : nombre total de pièces jointes (tous types, pas seulement affichables).
// Note : l'API TB ne retourne pas content-disposition, donc on ne peut pas
// distinguer les images inline (logos de signature) des PJ réelles. Le badge
// peut donc être légèrement surévalué pour les mails avec logos inline nommés.
function countAttachments(parts) {
  let n = 0;
  for (const p of parts || []) {
    if (p.name) n++;
    if (p.parts) n += countAttachments(p.parts);
  }
  return n;
}

// Cache mémoire des pièces affichables par mail, alimenté à onMessagesDisplayed,
// consulté à l'ouverture du viewer (évite un second listAttachments).
const previewByMessage = new Map();

// Dernier message unique affiché (pour que le popup sache de quoi parler).
let lastMessageId = null;

// Cache des vignettes du popup : `${messageId}:${partName}` → dataURL.
const thumbCache = new Map();
const thumbKey = (messageId, partName) => `${messageId}:${partName}`;

// C3 : messages déjà auto-ouverts (anti-réouverture).
const autoOpened = new Set();

// Ouvre la fenêtre d'aperçu pour un message donné, en restaurant la géométrie.
// `part` (optionnel) pré-sélectionne une pièce jointe précise dans le viewer.
async function openViewerForMessage(messageId, part) {
  const settings = await getSettings();
  const g = settings.windowGeom || DEFAULTS.windowGeom;
  let path = `viewer/viewer.html?messageId=${messageId}`;
  if (part) path += `&part=${encodeURIComponent(part)}`;
  const createParams = {
    url: messenger.runtime.getURL(path),
    type: "popup",
    width: g.width,
    height: g.height,
  };
  if (Number.isFinite(g.left)) createParams.left = g.left;
  if (Number.isFinite(g.top)) createParams.top = g.top;
  return messenger.windows.create(createParams);
}

// messageId du message unique affiché dans un onglet, sinon null.
async function getDisplayedMessageId(tabId) {
  const displayed = await messenger.messageDisplay.getDisplayedMessages(tabId);
  const messages = displayed?.messages || [];
  return messages.length === 1 ? messages[0].id : null;
}

// ---------- Affichage d'un message : badge + cache + ouverture auto ----------
async function onDisplayed(tab, messages) {
  if (messages.length !== 1) {
    lastMessageId = null;
    messenger.storage.local.set({ currentMessageId: null });
    await messenger.messageDisplayAction.setBadgeText({ tabId: tab.id, text: "" });
    return;
  }
  const messageId = messages[0].id;
  lastMessageId = messageId;
  // Persisté pour le popup : survit à la mise en veille de l'event page MV3
  // (lastMessageId en mémoire serait perdu → popup vide, bug v0.6.0/0.6.1).
  messenger.storage.local.set({ currentMessageId: messageId });
  try {
    const attachments = await messenger.messages.listAttachments(messageId);
    const items = collectPreviewable(attachments);
    previewByMessage.set(messageId, items);

    const total = countAttachments(attachments); // C4
    await messenger.messageDisplayAction.setBadgeText({
      tabId: tab.id,
      text: total > 0 ? String(total) : "",
    });
    await messenger.messageDisplayAction.setBadgeBackgroundColor({
      tabId: tab.id,
      color: total > 0 ? "#c0392b" : null,
    });

    // C3 : ouverture auto si exactement 1 PDF, option activée, et message ouvert
    // dans son propre onglet/fenêtre (pas le volet d'aperçu — sinon spam de
    // fenêtres en parcourant la liste).
    if (tab.type === "messageDisplay") {
      const { autoOpenSingle } = await messenger.storage.local.get({ autoOpenSingle: false });
      if (autoOpenSingle && !autoOpened.has(messageId)) {
        const pdfCount = items.filter((i) => i.kind === "pdf").length;
        if (pdfCount === 1) {
          autoOpened.add(messageId);
          await openViewerForMessage(messageId);
        }
      }
    }
  } catch (err) {
    console.error("[Aperçu PJ] onDisplayed:", err);
  }
}

messenger.messageDisplay.onMessagesDisplayed.addListener(async (tab, displayedMessages) => {
  const messages = displayedMessages?.messages || [];
  await onDisplayed(tab, messages);
});

// Clic sur le bouton de la barre du message → ouverture de la fenêtre d'aperçu.
messenger.messageDisplayAction.onClicked.addListener(async (tab) => {
  try {
    const messageId = await getDisplayedMessageId(tab.id);
    if (messageId == null) {
      console.warn("[Aperçu PJ] aucun message unique sélectionné");
      return;
    }
    await openViewerForMessage(messageId);
  } catch (err) {
    console.error("[Aperçu PJ] onClicked:", err);
  }
});

// ---------- Endpoints runtime utilisés par le viewer ----------
// ⚠️ ENREGISTRÉ EN PREMIER (avant menus/commands) : si une API optionnelle
// échoue au chargement, le viewer doit malgré tout pouvoir dialoguer avec le
// background. Sinon → « Could not establish connection. Receiving end does not exist ».
messenger.runtime.onMessage.addListener((msg, _sender) => {
  if (msg?.type === "getPdfList") return handleGetPdfList(msg.messageId);
  if (msg?.type === "getPdf") return handleGetPdf(msg.messageId, msg.partName);
  if (msg?.type === "saveGeometry") return saveGeometry(msg.geom);
  // Endpoints du popup de prévisualisation.
  if (msg?.type === "getCurrent") {
    return messenger.storage.local.get({ currentMessageId: null })
      .then((r) => ({ ok: true, messageId: r.currentMessageId }));
  }
  if (msg?.type === "openViewer") return openViewerFromPopup(msg.messageId, msg.part);
  if (msg?.type === "getThumb") return handleGetThumb(msg.messageId, msg.partName);
  return undefined;
});

// ---------- C1 : entrée de menu contextuel sur les pièces jointes ----------
// Gardé : si l'API menus est indisponible, on n'interrompt pas le script.
async function setupMenus() {
  try { await messenger.menus.removeAll(); } catch (_) {}
  try {
    messenger.menus.create({
      id: "apercu-pj-open",
      title: "Aperçu PJ — voir les pièces jointes",
      contexts: ["message_attachments", "all_message_attachments"],
    });
  } catch (err) {
    console.error("[Aperçu PJ] setupMenus:", err);
  }
}
if (messenger.menus?.onClicked) {
  setupMenus();
  messenger.menus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId !== "apercu-pj-open") return;
    try {
      const messageId = await getDisplayedMessageId(tab.id);
      if (messageId != null) await openViewerForMessage(messageId);
    } catch (err) {
      console.error("[Aperçu PJ] menu onClicked:", err);
    }
  });
} else {
  console.warn("[Aperçu PJ] API menus indisponible — C1 désactivé");
}

// ---------- C2 : raccourci clavier (déclaré dans le manifest) ----------
if (messenger.commands?.onCommand) {
  messenger.commands.onCommand.addListener(async (name, tab) => {
    if (name !== "open-preview") return;
    try {
      const messageId = await getDisplayedMessageId(tab.id);
      if (messageId != null) await openViewerForMessage(messageId);
    } catch (err) {
      console.error("[Aperçu PJ] command:", err);
    }
  });
} else {
  console.warn("[Aperçu PJ] API commands indisponible — C2 désactivé");
}

// ---------- Aperçu inline DANS le message (scripting.messageDisplay — MV3) ----------
// En MV3, l'API est scripting.messageDisplay (pas messageDisplayScripts, qui est
// MV2) et ne demande que `messagesRead` + `scripting`. Injecte inject/inline.*.
// S'applique aux messages affichés APRÈS l'enregistrement → ouvrir un AUTRE message.
// Statut écrit dans storage (visible dans les préférences) + infobulle.
function reportInline(status) {
  // Statut consultable dans les préférences (diagnostic). Le titre du bouton
  // reste propre en version finale (plus de version/diagnostic dans l'infobulle).
  try { messenger.storage.local.set({ inlineStatus: status }); } catch (_) {}
}
async function setupInline() {
  const api = messenger.scripting && messenger.scripting.messageDisplay;
  if (!api) {
    console.warn("[Aperçu PJ] scripting.messageDisplay indisponible");
    reportInline("API ABSENTE (scripting.messageDisplay indisponible)");
    return;
  }
  try {
    try { await api.unregisterScripts({ ids: ["apj-inline"] }); } catch (_) {}
    await api.registerScripts([{
      id: "apj-inline",
      js: ["inject/inline.js"],
      css: ["inject/inline.css"],
      runAt: "document_idle",
    }]);
    console.log("[Aperçu PJ] aperçu inline enregistré (scripting.messageDisplay)");
    reportInline("ENREGISTRÉ OK");
  } catch (err) {
    console.error("[Aperçu PJ] registerScripts:", err);
    reportInline("ERREUR: " + (err?.message || err));
  }
}
setupInline();

async function openViewerFromPopup(messageId, part) {
  try {
    await openViewerForMessage(messageId, part);
    return { ok: true };
  } catch (err) {
    console.error("[Aperçu PJ] openViewerFromPopup:", err);
    return { ok: false, error: String(err?.message || err) };
  }
}

async function handleGetPdfList(messageId) {
  try {
    let items = previewByMessage.get(messageId);
    if (!items) {
      const attachments = await messenger.messages.listAttachments(messageId);
      items = collectPreviewable(attachments);
      previewByMessage.set(messageId, items);
    }
    // Métadonnées du message pour le « nom intelligent » (B2).
    let meta = null;
    try {
      const m = await messenger.messages.get(messageId);
      meta = { author: m.author, subject: m.subject, date: m.date };
    } catch (_) { /* meta optionnelle */ }

    // La clé reste `pdfs` côté message (lue telle quelle par le viewer).
    return { ok: true, pdfs: items, meta };
  } catch (err) {
    console.error("[Aperçu PJ] getPdfList:", err);
    return { ok: false, error: String(err?.message || err) };
  }
}

async function handleGetPdf(messageId, partName) {
  try {
    const file = await messenger.messages.getAttachmentFile(messageId, partName);
    const buffer = await file.arrayBuffer();
    return { ok: true, buffer, name: file.name, size: file.size };
  } catch (err) {
    console.error("[Aperçu PJ] getPdf:", err);
    return { ok: false, error: String(err?.message || err) };
  }
}

// ---------- Miniatures (générées dans le background pour l'aperçu inline) ----------
// La page d'arrière-plan possède un DOM → canvas + PDF.js utilisables ici.
async function handleGetThumb(messageId, partName) {
  try {
    const key = thumbKey(messageId, partName);
    if (thumbCache.has(key)) return { ok: true, dataUrl: thumbCache.get(key) };

    let items = previewByMessage.get(messageId);
    if (!items) {
      const attachments = await messenger.messages.listAttachments(messageId);
      items = collectPreviewable(attachments);
      previewByMessage.set(messageId, items);
    }
    const item = items.find((i) => i.partName === partName);
    if (!item) return { ok: false, error: "Pièce jointe introuvable" };

    const dataUrl = await generateThumbDataUrl(messageId, item);
    thumbCache.set(key, dataUrl);
    return { ok: true, dataUrl };
  } catch (err) {
    console.error("[Aperçu PJ] getThumb:", err);
    return { ok: false, error: String(err?.message || err) };
  }
}

async function generateThumbDataUrl(messageId, item) {
  const file = await messenger.messages.getAttachmentFile(messageId, item.partName);
  const buf = await file.arrayBuffer();
  return item.kind === "image"
    ? await imageBufferToDataUrl(buf, item.contentType)
    : await pdfBufferToDataUrl(buf);
}

function imageBufferToDataUrl(buf, contentType) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(new Blob([buf], { type: contentType || "image/*" }));
    const im = new Image();
    im.onload = () => {
      const scale = Math.min(1, APJ_THUMB_W / im.width);
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

async function pdfBufferToDataUrl(buf) {
  const pdfjsLib = await getPdfjs();
  const doc = await pdfjsLib.getDocument({
    data: new Uint8Array(buf),
    cMapUrl: APJ_CMAP_URL,
    cMapPacked: true,
    standardFontDataUrl: APJ_STD_FONT_URL,
    wasmUrl: APJ_WASM_URL,
    iccUrl: APJ_ICC_URL,
  }).promise;
  try {
    const page = await doc.getPage(1);
    const base = page.getViewport({ scale: 1 });
    const vp = page.getViewport({ scale: APJ_THUMB_W / base.width });
    const c = document.createElement("canvas");
    c.width = Math.round(vp.width);
    c.height = Math.round(vp.height);
    await page.render({ canvasContext: c.getContext("2d"), viewport: vp }).promise;
    return c.toDataURL("image/jpeg", 0.72);
  } finally {
    try { doc.destroy(); } catch (_) { /* PDF.js v6 : pas de doc.destroy() → GC */ }
  }
}

async function saveGeometry(geom) {
  try {
    await messenger.storage.local.set({ windowGeom: geom });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}
