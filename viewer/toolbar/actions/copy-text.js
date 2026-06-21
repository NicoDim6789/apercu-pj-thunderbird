// actions/copy-text.js — Copier le texte de la page visible (PDF.js getTextContent)

import { toolbar } from "../registry.js";

toolbar.register({
  id: "copy-text",
  label: "📋 Copier le texte",
  order: 15,
  isAvailable: ({ pdf }) => !!pdf,
  handler: async ({ pdfDoc, viewer }) => {
    if (!pdfDoc) return;
    const page = await pdfDoc.getPage(viewer.currentPageNumber);
    const content = await page.getTextContent();
    const text = content.items.map((item) => item.str).join(" ").trim();

    const btn = document.querySelector('[data-action-id="copy-text"]');
    const prevHTML = btn?.innerHTML;

    if (!text) {
      if (btn) {
        btn.innerHTML = `<span class="tb-act-icon">⚠</span><span class="tb-act-label">Pas de texte</span>`;
        setTimeout(() => { if (btn) btn.innerHTML = prevHTML; }, 2500);
      }
      return;
    }
    await navigator.clipboard.writeText(text);
    if (btn) {
      btn.innerHTML = `<span class="tb-act-icon">✓</span><span class="tb-act-label">Copié !</span>`;
      setTimeout(() => { if (btn) btn.innerHTML = prevHTML; }, 2000);
    }
  },
});
