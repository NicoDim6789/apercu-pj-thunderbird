// actions/print.js — Imprimer le PDF actif
//
// window.print() et même un appel depuis une fenêtre proxy ne déclenchent pas
// la boîte d'impression dans les popups Thunderbird. La seule méthode fiable :
//   1. Rendu de chaque page en JPEG (canvas PDF.js, scale réduit pour limiter la taille)
//   2. Stockage temporaire dans storage.local (clé auto-nettoyée par la proxy)
//   3. Ouverture d'une fenêtre proxy (print-proxy.html) qui, une fois les images
//      chargées, envoie un message au background → messenger.tabs.print() sur cette
//      fenêtre focalisée (seule API TB qui ouvre réellement la boîte d'impression).

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

    try {
      const total = Math.min(pdfDoc.numPages, 25);
      const pages = [];

      for (let i = 1; i <= total; i++) {
        // Feedback de progression dans le bouton
        if (btn) btn.innerHTML = `<span class="tb-act-icon">⏳</span><span class="tb-act-label">${i}/${total}…</span>`;

        const page = await pdfDoc.getPage(i);
        // Scale 0.8 → ~476×674 px par page A4 : ~25–40 Ko JPEG, 25 pages ≈ 600 Ko–1 Mo
        const vp = page.getViewport({ scale: 0.8 });
        const canvas = document.createElement("canvas");
        canvas.width  = Math.round(vp.width);
        canvas.height = Math.round(vp.height);
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: ctx, viewport: vp }).promise;
        pages.push(canvas.toDataURL("image/jpeg", 0.75));
      }

      const key = Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
      await browser.storage.local.set({ ["apj_print_" + key]: pages });

      if (btn) btn.innerHTML = `<span class="tb-act-icon">⏳</span><span class="tb-act-label">Ouverture…</span>`;

      await browser.windows.create({
        url: browser.runtime.getURL(`viewer/print-proxy.html?k=${key}`),
        type: "popup",
        width: 860,
        height: 740,
      });

      if (btn) {
        btn.innerHTML = `<span class="tb-act-icon">✓</span><span class="tb-act-label">Impression…</span>`;
        setTimeout(() => { if (btn) btn.innerHTML = prevHTML; }, 3500);
      }
    } catch (err) {
      if (btn) btn.innerHTML = prevHTML;
      throw err;
    }
  },
});
