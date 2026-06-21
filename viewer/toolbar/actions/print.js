// actions/print.js — Imprimer le PDF actif
//
// window.print() dans une popup extension Thunderbird n'ouvre pas la boîte
// d'impression (limitation du moteur). Solution fiable :
//   1. Rendu de chaque page en JPEG via canvas PDF.js
//   2. Stockage temporaire dans storage.local (clé unique, auto-nettoyée)
//   3. Ouverture d'une fenêtre proxy dédiée (print-proxy.html) qui affiche
//      les images et appelle window.print() depuis son propre contexte.

import { toolbar } from "../registry.js";

toolbar.register({
  id: "print",
  label: "🖨 Imprimer",
  order: 10,
  isAvailable: ({ pdf }) => !!pdf,
  handler: async ({ pdfDoc }) => {
    if (!pdfDoc) return;

    const btn = document.querySelector('[data-action-id="print"]');
    const prevHTML = btn?.innerHTML;
    if (btn) btn.innerHTML = `<span class="tb-act-icon">⏳</span><span class="tb-act-label">Préparation…</span>`;

    try {
      // Rendre chaque page en JPEG (max 20 pages, scale 1.5 ≈ 150 dpi sur A4)
      const pages = [];
      const total = Math.min(pdfDoc.numPages, 20);
      for (let i = 1; i <= total; i++) {
        const page = await pdfDoc.getPage(i);
        const vp = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement("canvas");
        canvas.width  = Math.round(vp.width);
        canvas.height = Math.round(vp.height);
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: ctx, viewport: vp }).promise;
        pages.push(canvas.toDataURL("image/jpeg", 0.82));
      }

      // Clé unique — stockage temporaire (nettoyé par la fenêtre proxy)
      const key = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      await browser.storage.local.set({ ["apj_print_" + key]: pages });

      // Ouvrir la fenêtre dédiée à l'impression
      await browser.windows.create({
        url: browser.runtime.getURL(`viewer/print-proxy.html?k=${key}`),
        type: "popup",
        width: 860,
        height: 720,
      });

      if (btn) {
        btn.innerHTML = `<span class="tb-act-icon">✓</span><span class="tb-act-label">Envoi…</span>`;
        setTimeout(() => { if (btn) btn.innerHTML = prevHTML; }, 3000);
      }
    } catch (err) {
      if (btn) btn.innerHTML = prevHTML;
      throw err;
    }
  },
});
