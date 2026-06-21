// inject/inline.js — barre PJ style Outlook injectée via scripting.messageDisplay (MV3).
// Chips cliquables avec miniature, nom, taille, montant TTC détecté et bouton "À traiter".

(async () => {
  try {
    if (document.getElementById("apj-inline-strip")) return;

    // Attendre que le background ait persisté le messageId courant
    let messageId = null;
    for (let i = 0; i < 12; i++) {
      const cur = await browser.runtime.sendMessage({ type: "getCurrent" });
      if (cur?.messageId != null) { messageId = cur.messageId; break; }
      await new Promise((r) => setTimeout(r, 100));
    }
    if (messageId == null) return;

    const res = await browser.runtime.sendMessage({ type: "getPdfList", messageId });
    const items = res?.pdfs || [];
    if (!items.length) return;
    if (document.getElementById("apj-inline-strip")) return; // guard async

    // ---- Utilitaires ----
    function formatSize(bytes) {
      if (!bytes) return "";
      if (bytes < 1024) return `${bytes} o`;
      if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
    }

    // Extraction du montant TTC/Net à payer depuis le texte brut du PDF
    function extractMontant(text) {
      const patterns = [
        /net\s+[àa]\s+payer[^\d€\n]{0,40}([\d\s]+[.,]\d{2})\s*€?/i,
        /(?:total\s+(?:ttc|t\.t\.c\.?)|montant\s+ttc)[^\d€\n]{0,30}([\d\s]+[.,]\d{2})\s*€?/i,
        /(?:total|sous.total)[^\d€\n]{0,20}([\d\s]+[.,]\d{2})\s*€/i,
      ];
      for (const p of patterns) {
        const m = text.match(p);
        if (m?.[1]) {
          const n = parseFloat(m[1].replace(/\s/g, "").replace(",", "."));
          if (n > 0 && n < 10_000_000) {
            return n.toLocaleString("fr-FR", { minimumFractionDigits: 2 }) + " €";
          }
        }
      }
      return null;
    }

    // ---- Construction du strip ----
    const strip = document.createElement("div");
    strip.id = "apj-inline-strip";

    // En-tête
    const header = document.createElement("div");
    header.className = "apj-strip-header";

    const label = document.createElement("span");
    label.className = "apj-strip-label";
    label.textContent = "Pièces jointes";
    header.appendChild(label);

    const countSpan = document.createElement("span");
    countSpan.className = "apj-strip-count";
    countSpan.textContent = `(${items.length})`;
    header.appendChild(countSpan);

    // Bouton "À traiter" — toggle du tag TB
    const toProcessBtn = document.createElement("button");
    toProcessBtn.type = "button";
    toProcessBtn.className = "apj-to-process-btn";
    toProcessBtn.title = "Marquer ce message comme 'À traiter' (tag Thunderbird)";
    toProcessBtn.textContent = "📌 À traiter";

    // Initialiser l'état du bouton (message déjà tagué ?)
    browser.runtime.sendMessage({ type: "getTagState", messageId })
      .then((r) => {
        if (r?.tagged) {
          toProcessBtn.classList.add("active");
          toProcessBtn.textContent = "📌 À traiter ✓";
        }
      })
      .catch(() => {});

    toProcessBtn.addEventListener("click", async (e) => {
      e.stopPropagation();
      toProcessBtn.disabled = true;
      try {
        const r = await browser.runtime.sendMessage({ type: "markToProcess", messageId });
        if (r?.ok) {
          toProcessBtn.classList.toggle("active", r.tagged);
          toProcessBtn.textContent = r.tagged ? "📌 À traiter ✓" : "📌 À traiter";
        }
      } catch (_) {}
      toProcessBtn.disabled = false;
    });
    header.appendChild(toProcessBtn);
    strip.appendChild(header);

    // Rangée de chips
    const chipsRow = document.createElement("div");
    chipsRow.className = "apj-strip-chips";

    items.forEach((item) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "apj-chip";
      chip.title = item.name;

      // ---- Zone miniature ----
      const thumbDiv = document.createElement("div");
      thumbDiv.className = "apj-chip-thumb";

      const badge = document.createElement("span");
      badge.className = `apj-type-badge apj-type-${item.kind === "pdf" ? "pdf" : "image"}`;
      badge.textContent = item.kind === "pdf" ? "PDF" : "IMG";
      thumbDiv.appendChild(badge);
      chip.appendChild(thumbDiv);

      // ---- Zone info ----
      const infoDiv = document.createElement("div");
      infoDiv.className = "apj-chip-info";

      const nameEl = document.createElement("div");
      nameEl.className = "apj-chip-name";
      nameEl.textContent = item.name;
      infoDiv.appendChild(nameEl);

      const sizeEl = document.createElement("div");
      sizeEl.className = "apj-chip-size";
      sizeEl.textContent = formatSize(item.size);
      infoDiv.appendChild(sizeEl);

      const amountEl = document.createElement("div");
      amountEl.className = "apj-chip-amount";
      amountEl.hidden = true;
      infoDiv.appendChild(amountEl);

      chip.appendChild(infoDiv);

      chip.addEventListener("click", () => {
        browser.runtime.sendMessage({ type: "openViewer", messageId, part: item.partName });
      });

      chipsRow.appendChild(chip);

      // ---- Miniature (arrière-plan) ----
      browser.runtime.sendMessage({ type: "getThumb", messageId, partName: item.partName })
        .then((r) => {
          if (!r?.ok || !r.dataUrl) return;
          thumbDiv.innerHTML = "";
          const img = document.createElement("img");
          img.src = r.dataUrl;
          img.alt = "";
          thumbDiv.appendChild(img);
          // Ré-ajouter le badge type sur l'image
          const b2 = document.createElement("span");
          b2.className = badge.className;
          b2.textContent = badge.textContent;
          thumbDiv.appendChild(b2);
        })
        .catch(() => {});

      // ---- Montant TTC (PDF uniquement) ----
      if (item.kind === "pdf") {
        browser.runtime.sendMessage({ type: "getPdfText", messageId, partName: item.partName })
          .then((r) => {
            if (!r?.ok || !r.text) return;
            const montant = extractMontant(r.text);
            if (montant) {
              amountEl.textContent = "💶 " + montant;
              amountEl.hidden = false;
            }
          })
          .catch(() => {});
      }
    });

    strip.appendChild(chipsRow);
    const root = document.body ?? document.documentElement;
    root.prepend(strip);
  } catch (e) {
    console.error("[Aperçu PJ inline]", e);
  }
})();
