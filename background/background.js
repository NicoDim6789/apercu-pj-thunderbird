// background.js — Aperçu PJ
//
// Rôle : détecter les PDF en pièce jointe sur affichage d'un message, et
// fournir leur contenu binaire au viewer sur demande.
//
// Flux :
//   1. messageDisplay.onMessageDisplayed → on extrait les PDF
//   2. on envoie la liste au content script (qui injecte l'iframe viewer)
//   3. le viewer demande chaque PDF via runtime.sendMessage({type:'getPdf'})

const PDF_MIME = "application/pdf";

const DEFAULTS = {
  maxAutoSizeBytes: 15 * 1024 * 1024, // garde-fou taille : 15 Mo
  panelCollapsed: false,              // état déplié par défaut
};

async function getSettings() {
  const stored = await messenger.storage.local.get(DEFAULTS);
  return { ...DEFAULTS, ...stored };
}

// Filtre récursif des pièces jointes PDF (les PJ peuvent être imbriquées
// dans des parts multipart).
function collectPdfAttachments(parts) {
  const out = [];
  for (const p of parts || []) {
    if (p.contentType === PDF_MIME && p.name) {
      out.push({
        partName: p.partName,
        name: p.name,
        size: p.size ?? 0,
      });
    }
    if (p.parts) out.push(...collectPdfAttachments(p.parts));
  }
  return out;
}

// Envoi de la liste des PDF au content script de l'onglet courant.
async function notifyTab(tabId, messageId, pdfs, settings) {
  try {
    await messenger.tabs.sendMessage(tabId, {
      type: "pdfsFound",
      messageId,
      pdfs,
      settings,
    });
  } catch (err) {
    // Le content script peut ne pas encore être prêt (race au premier affichage).
    // On laisse tomber silencieusement : il redemandera via 'requestPdfs'.
    console.debug("[Aperçu PJ] tabs.sendMessage:", err.message);
  }
}

messenger.messageDisplay.onMessageDisplayed.addListener(async (tab, message) => {
  try {
    const attachments = await messenger.messages.listAttachments(message.id);
    const pdfs = collectPdfAttachments(attachments);
    const settings = await getSettings();
    await notifyTab(tab.id, message.id, pdfs, settings);
  } catch (err) {
    console.error("[Aperçu PJ] onMessageDisplayed:", err);
  }
});

// Endpoint runtime : le content script et le viewer demandent ici les bytes
// d'un PDF, ou la liste actuelle si le content script s'est chargé en retard.
messenger.runtime.onMessage.addListener((msg, sender) => {
  if (msg?.type === "getPdf") {
    return handleGetPdf(msg.messageId, msg.partName);
  }
  if (msg?.type === "requestPdfs") {
    return handleRequestPdfs(sender.tab?.id);
  }
  return undefined;
});

async function handleGetPdf(messageId, partName) {
  const file = await messenger.messages.getAttachmentFile(messageId, partName);
  // File hérite de Blob → on transfère l'ArrayBuffer, plus fiable que le Blob
  // à travers les frontières de contexte en MV3.
  const buffer = await file.arrayBuffer();
  return { ok: true, buffer, name: file.name, size: file.size };
}

async function handleRequestPdfs(tabId) {
  if (!tabId) return { ok: false };
  const tab = await messenger.tabs.get(tabId);
  const message = await messenger.messageDisplay.getDisplayedMessage(tab.id);
  if (!message) return { ok: true, pdfs: [], messageId: null };
  const attachments = await messenger.messages.listAttachments(message.id);
  const pdfs = collectPdfAttachments(attachments);
  const settings = await getSettings();
  return { ok: true, messageId: message.id, pdfs, settings };
}
