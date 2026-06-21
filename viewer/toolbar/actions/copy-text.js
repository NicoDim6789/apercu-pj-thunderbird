// actions/copy-text.js — Copier le texte de la page visible (PDF.js getTextContent)

import { toolbar } from "../registry.js";

toolbar.register({
  id: "copy-text",
  label: "📋 Copier le texte",
  order: 15,
  isAvailable: ({ pdf }) => !!pdf,
  handler: async ({ viewer }) => {
    if (!viewer?.pdfDocument) return;
    const page = await viewer.pdfDocument.getPage(viewer.currentPageNumber);
    const content = await page.getTextContent();
    const text = content.items.map((item) => item.str).join(" ").trim();
    if (!text) {
      // Pas de texte extractible (PDF scanné sans OCR)
      const btn = document.querySelector('[data-action-id="copy-text"]');
      if (btn) { const o = btn.textContent; btn.textContent = "⚠ Pas de texte"; setTimeout(() => { btn.textContent = o; }, 2500); }
      return;
    }
    await navigator.clipboard.writeText(text);
    const btn = document.querySelector('[data-action-id="copy-text"]');
    if (btn) {
      const orig = btn.textContent;
      btn.textContent = "✓ Copié !";
      setTimeout(() => { btn.textContent = orig; }, 2000);
    }
  },
});
