// inject/inline.js — barre d'aperçu des pièces jointes injectée DANS le message
// via scripting.messageDisplay.registerScripts() (MV3). Affiche une chip cliquable
// par PJ en haut du message, façon Outlook. Clic → ouvre la fenêtre d'aperçu.
// Miniatures (PDF 1re page + images) générées côté background via getThumb.

(async () => {
  try {
    if (document.getElementById("apj-inline-strip")) return; // déjà injecté

    // Le messageId courant est persisté par le background (storage). Au tout
    // premier affichage il peut ne pas être encore écrit → quelques essais.
    let messageId = null;
    for (let i = 0; i < 12; i++) {
      const cur = await browser.runtime.sendMessage({ type: "getCurrent" });
      if (cur && cur.messageId != null) { messageId = cur.messageId; break; }
      await new Promise((r) => setTimeout(r, 100));
    }
    if (messageId == null) return;

    const res = await browser.runtime.sendMessage({ type: "getPdfList", messageId });
    const items = (res && res.pdfs) || [];
    if (!items.length) return;
    if (document.getElementById("apj-inline-strip")) return;

    const strip = document.createElement("div");
    strip.id = "apj-inline-strip";

    const label = document.createElement("span");
    label.className = "apj-strip-label";
    label.textContent = "📎 Aperçu :";
    strip.appendChild(label);

    items.forEach((item) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "apj-chip";
      chip.title = item.name; // nom seulement en infobulle (pas de texte sous la miniature)

      const thumb = document.createElement("span");
      thumb.className = "apj-chip-thumb";
      thumb.textContent = item.kind === "image" ? "🖼" : "📄"; // placeholder le temps du rendu
      chip.appendChild(thumb);

      chip.addEventListener("click", (e) => {
        e.preventDefault();
        browser.runtime.sendMessage({ type: "openViewer", messageId, part: item.partName });
      });
      strip.appendChild(chip);

      // Miniature générée par le background (1re page PDF / image réduite).
      browser.runtime.sendMessage({ type: "getThumb", messageId, partName: item.partName })
        .then((r) => {
          if (!r || !r.ok || !r.dataUrl) return;
          const img = document.createElement("img");
          img.src = r.dataUrl;
          img.alt = "";
          thumb.textContent = "";
          thumb.appendChild(img);
        })
        .catch(() => {});
    });

    const root = document.body ?? document.documentElement;
    root.prepend(strip);
  } catch (e) {
    console.error("[Aperçu PJ inline]", e);
  }
})();
