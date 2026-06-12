// inject/inline.js — barre d'aperçu des pièces jointes injectée DANS le message
// (via messageDisplayScripts). Affiche une « chip » cliquable par PJ, en haut du
// message, façon Outlook. Clic → ouvre la fenêtre d'aperçu sur cette PJ.
//
// Les vignettes image sont rendues ici (faciles) ; les vignettes PDF viendront
// d'une étape suivante (génération côté background). En attendant : icône 📄.

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
      chip.title = "Ouvrir « " + item.name + " »";

      const thumb = document.createElement("span");
      thumb.className = "apj-chip-thumb";
      thumb.textContent = item.kind === "image" ? "🖼" : "📄";
      chip.appendChild(thumb);

      const name = document.createElement("span");
      name.className = "apj-chip-name";
      name.textContent = item.name;
      chip.appendChild(name);

      chip.addEventListener("click", (e) => {
        e.preventDefault();
        browser.runtime.sendMessage({ type: "openViewer", messageId, part: item.partName });
      });
      strip.appendChild(chip);

      // Vignette image : récupération directe des octets → blob → <img>.
      if (item.kind === "image") {
        browser.runtime.sendMessage({ type: "getPdf", messageId, partName: item.partName })
          .then((r) => {
            if (!r || !r.ok) return;
            const url = URL.createObjectURL(new Blob([r.buffer], { type: item.contentType || "image/*" }));
            const img = document.createElement("img");
            img.src = url;
            img.alt = "";
            thumb.textContent = "";
            thumb.appendChild(img);
          })
          .catch(() => {});
      }
    });

    const root = document.body || document.documentElement;
    if (root) root.insertBefore(strip, root.firstChild);
  } catch (e) {
    console.error("[Aperçu PJ inline]", e);
  }
})();
