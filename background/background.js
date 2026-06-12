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

console.log("[Aperçu PJ] background démarré v0.6.2");

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
    await messenger.messageDisplayAction.setBadgeText({ tabId: tab.id, text: "" });
    return;
  }
  const messageId = messages[0].id;
  lastMessageId = messageId;
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

// ---------- C1 : entrée de menu contextuel sur les pièces jointes ----------
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

// ---------- C2 : raccourci clavier (déclaré dans le manifest) ----------
messenger.commands.onCommand.addListener(async (name, tab) => {
  if (name !== "open-preview") return;
  try {
    const messageId = await getDisplayedMessageId(tab.id);
    if (messageId != null) await openViewerForMessage(messageId);
  } catch (err) {
    console.error("[Aperçu PJ] command:", err);
  }
});

// ---------- Endpoints runtime utilisés par le viewer ----------
messenger.runtime.onMessage.addListener((msg, _sender) => {
  if (msg?.type === "getPdfList") return handleGetPdfList(msg.messageId);
  if (msg?.type === "getPdf") return handleGetPdf(msg.messageId, msg.partName);
  if (msg?.type === "saveGeometry") return saveGeometry(msg.geom);
  // Endpoints du popup de prévisualisation.
  if (msg?.type === "getCurrent") return Promise.resolve({ ok: true, messageId: lastMessageId });
  if (msg?.type === "openViewer") return openViewerFromPopup(msg.messageId, msg.part);
  if (msg?.type === "getThumb") {
    return Promise.resolve({ ok: true, dataUrl: thumbCache.get(thumbKey(msg.messageId, msg.partName)) || null });
  }
  if (msg?.type === "putThumb") {
    thumbCache.set(thumbKey(msg.messageId, msg.partName), msg.dataUrl);
    return Promise.resolve({ ok: true });
  }
  return undefined;
});

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

async function saveGeometry(geom) {
  try {
    await messenger.storage.local.set({ windowGeom: geom });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}
