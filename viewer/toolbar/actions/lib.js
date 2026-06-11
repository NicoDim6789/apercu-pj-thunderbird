// actions/lib.js — utilitaires partagés par les actions sur pièce jointe (Lot 2)

// Récupère le contenu d'une PJ (via background) et en fait une URL blob,
// utilisable par downloads.download / downloads.open.
export async function fetchBlobUrl(messageId, partName, contentType) {
  const res = await browser.runtime.sendMessage({ type: "getPdf", messageId, partName });
  if (!res?.ok) throw new Error(res?.error || "Lecture pièce jointe échouée");
  const blob = new Blob([res.buffer], { type: contentType || "application/octet-stream" });
  return URL.createObjectURL(blob);
}

// Date locale AAAA-MM-JJ (volontairement pas d'UTC, pour éviter les décalages de minuit).
export function ymd(d) {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

// Nettoie une chaîne pour en faire un nom de fichier valide (Windows).
export function sanitize(s) {
  return (s || "")
    .replace(/[\\/:*?"<>|\r\n\t]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Extrait un nom lisible d'un en-tête « author » : `Jean Dupont <j@x.fr>` → `Jean Dupont`.
export function authorName(author) {
  if (!author) return "";
  const named = /^\s*"?([^"<]+?)"?\s*</.exec(author);
  if (named && named[1].trim()) return named[1].trim();
  const email = /<?([^<>@\s]+)@/.exec(author);
  return email ? email[1] : author.trim();
}

function extOf(name) {
  const m = /\.([A-Za-z0-9]{1,8})$/.exec(name || "");
  return m ? m[1].toLowerCase() : "";
}

// Nom intelligent : AAAA-MM-JJ_Expéditeur_Sujet.ext — tronqué, fallback = nom d'origine.
export function smartFilename(item, meta) {
  let datePart = "";
  if (meta?.date) {
    const d = meta.date instanceof Date ? meta.date : new Date(meta.date);
    if (!Number.isNaN(d.getTime())) datePart = ymd(d);
  }
  const from = sanitize(authorName(meta?.author));
  const subj = sanitize(meta?.subject);
  const base = [datePart, from, subj].filter(Boolean).join("_").slice(0, 120);
  if (!base) return item.name;
  const ext = extOf(item.name) || (item.kind === "pdf" ? "pdf" : "");
  return ext ? `${base}.${ext}` : base;
}

// Télécharge la PJ. saveAs:true → dialogue « Enregistrer sous » (nom proposé = filename).
export async function downloadAttachment({ messageId, item, filename, saveAs }) {
  const url = await fetchBlobUrl(messageId, item.partName, item.contentType);
  try {
    return await browser.downloads.download({
      url,
      filename: filename || item.name,
      saveAs: !!saveAs,
    });
  } finally {
    // L'URL blob doit survivre au démarrage du téléchargement : révocation différée.
    setTimeout(() => { try { URL.revokeObjectURL(url); } catch (_) {} }, 60000);
  }
}

// Attend qu'un téléchargement soit terminé (nécessaire avant downloads.open).
export function waitDownloadComplete(id) {
  return new Promise((resolve, reject) => {
    function onChanged(delta) {
      if (delta.id !== id) return;
      if (delta.state?.current === "complete") { cleanup(); resolve(); }
      else if (delta.state?.current === "interrupted") { cleanup(); reject(new Error("Téléchargement interrompu")); }
    }
    function cleanup() { browser.downloads.onChanged.removeListener(onChanged); }
    browser.downloads.onChanged.addListener(onChanged);
  });
}
