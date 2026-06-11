// background.js — Aperçu PJ (architecture popup, TB 151 MV3)
//
// Pourquoi cette architecture : en TB 151 MV3, AUCUNE API n'expose
// l'injection d'un script dans la zone du message (ni message_display_scripts
// manifest, ni messageDisplayScripts.register, ni scripting.executeScript,
// ni tabs.executeScript). On bascule sur un bouton messageDisplayAction
// + fenêtre popup déplaçable contenant le viewer PDF.js.
//
// Flux :
//   1. onMessagesDisplayed : on liste les PDFs et on met à jour le badge
//      du bouton avec leur nombre. Ainsi l'utilisateur voit en un coup d'œil
//      combien de PDFs contient le message.
//   2. Clic sur le bouton : ouverture d'une fenêtre popup
//      (windows.create type:popup) avec viewer.html?messageId=N.
//   3. Le viewer demande la liste des PDFs et leur contenu via runtime.

console.log("[Aperçu PJ] background démarré v0.4.0");

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

// Cache mémoire des pièces affichables par mail, alimenté à onMessagesDisplayed,
// consulté à l'ouverture du viewer (évite un second listAttachments).
const previewByMessage = new Map();

async function refreshBadge(tab, messages) {
  const isMono = messages.length === 1;
  const messageId = isMono ? messages[0].id : null;

  if (!isMono) {
    await messenger.messageDisplayAction.setBadgeText({ tabId: tab.id, text: "" });
    return;
  }

  try {
    const attachments = await messenger.messages.listAttachments(messageId);
    const items = collectPreviewable(attachments);
    previewByMessage.set(messageId, items);
    await messenger.messageDisplayAction.setBadgeText({
      tabId: tab.id,
      text: items.length > 0 ? String(items.length) : "",
    });
    await messenger.messageDisplayAction.setBadgeBackgroundColor({
      tabId: tab.id,
      color: items.length > 0 ? "#c0392b" : null,
    });
  } catch (err) {
    console.error("[Aperçu PJ] refreshBadge:", err);
  }
}

messenger.messageDisplay.onMessagesDisplayed.addListener(async (tab, displayedMessages) => {
  const messages = displayedMessages?.messages || [];
  console.log("[Aperçu PJ] onMessagesDisplayed tab=", tab.id, "messages=", messages.length);
  await refreshBadge(tab, messages);
});

// Clic sur le bouton de la barre du message → ouverture de la fenêtre popup.
messenger.messageDisplayAction.onClicked.addListener(async (tab) => {
  try {
    const displayed = await messenger.messageDisplay.getDisplayedMessages(tab.id);
    const messages = displayed?.messages || [];
    if (messages.length !== 1) {
      console.warn("[Aperçu PJ] aucun message unique sélectionné");
      return;
    }
    const messageId = messages[0].id;

    const settings = await getSettings();
    const g = settings.windowGeom || DEFAULTS.windowGeom;
    const createParams = {
      url: messenger.runtime.getURL(`viewer/viewer.html?messageId=${messageId}`),
      type: "popup",
      width: g.width,
      height: g.height,
    };
    if (Number.isFinite(g.left)) createParams.left = g.left;
    if (Number.isFinite(g.top)) createParams.top = g.top;

    await messenger.windows.create(createParams);
  } catch (err) {
    console.error("[Aperçu PJ] onClicked:", err);
  }
});

// Endpoint runtime utilisé par le viewer.
messenger.runtime.onMessage.addListener((msg, _sender) => {
  if (msg?.type === "getPdfList") return handleGetPdfList(msg.messageId);
  if (msg?.type === "getPdf") return handleGetPdf(msg.messageId, msg.partName);
  if (msg?.type === "saveGeometry") return saveGeometry(msg.geom);
  return undefined;
});

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
