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

    // Filtrer les pièces jointes affichées dans le strip :
    // 1. Si le message contient des PDFs → afficher seulement les PDFs (les images
    //    sont quasi-toujours des logos/signatures du corps du mail).
    // 2. Si le message n'a que des images → masquer celles < 30 Ko (logos de signature).
    //    TB n'expose pas content-disposition, c'est la seule heuristique disponible.
    const hasPdf = items.some(i => i.kind === "pdf");
    const displayItems = hasPdf
      ? items.filter(i => i.kind === "pdf")
      : items.filter(i => i.kind !== "image" || i.size >= 30720);

    // Charger les états "Vu" en une seule requête (seulement pour les items affichés)
    const seenRes = await browser.runtime.sendMessage({
      type: "getSeenStates", messageId, partNames: displayItems.map((i) => i.partName),
    }).catch(() => null);
    const seenAt = seenRes?.seenAt || {};

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
    countSpan.textContent = displayItems.length < items.length
      ? `(${displayItems.length} sur ${items.length})`
      : `(${items.length})`;
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

    // Bouton "Tout télécharger" (uniquement si plusieurs items affichés)
    if (displayItems.length > 1) {
      const dlAllBtn = document.createElement("button");
      dlAllBtn.type = "button";
      dlAllBtn.className = "apj-to-process-btn";
      dlAllBtn.style.marginLeft = "6px";
      dlAllBtn.title = "Télécharger toutes les pièces jointes affichées";
      dlAllBtn.textContent = "📥 Tout";
      dlAllBtn.addEventListener("click", async (e) => {
        e.stopPropagation();
        dlAllBtn.disabled = true;
        dlAllBtn.textContent = "📥 En cours…";
        const r = await browser.runtime.sendMessage({
          type: "downloadAll",
          messageId,
          partNames: displayItems.map(i => i.partName),
        }).catch(() => null);
        dlAllBtn.textContent = r?.ok ? `📥 ${r.count} téléchargé${r.count > 1 ? "s" : ""}` : "📥 Erreur";
        setTimeout(() => { dlAllBtn.textContent = "📥 Tout"; dlAllBtn.disabled = false; }, 3000);
      });
      header.appendChild(dlAllBtn);
    }

    strip.appendChild(header);

    // Rangée de chips
    const chipsRow = document.createElement("div");
    chipsRow.className = "apj-strip-chips";

    displayItems.forEach((item) => {
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

      // Badge "Nouveau" ou "Vu le JJ/MM"
      const seenEl = document.createElement("div");
      seenEl.className = "apj-chip-seen";
      if (seenAt[item.partName]) {
        const d = new Date(seenAt[item.partName]);
        seenEl.textContent = `Vu le ${d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}`;
        seenEl.style.cssText = "font-size:10.5px;color:#a19f9d;margin-top:2px;";
      } else {
        seenEl.textContent = "✦ Nouveau";
        seenEl.style.cssText = "font-size:10.5px;font-weight:700;color:#0078d4;margin-top:2px;";
      }
      infoDiv.appendChild(seenEl);

      const amountEl = document.createElement("div");
      amountEl.className = "apj-chip-amount";
      amountEl.hidden = true;
      infoDiv.appendChild(amountEl);

      chip.appendChild(infoDiv);

      chip.addEventListener("click", () => {
        // Marquer comme vu et ouvrir le viewer
        browser.runtime.sendMessage({ type: "markSeen", messageId, partName: item.partName }).catch(() => {});
        if (!seenAt[item.partName]) {
          seenEl.textContent = "Vu le " + new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
          seenEl.style.cssText = "font-size:10.5px;color:#a19f9d;margin-top:2px;";
        }
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
