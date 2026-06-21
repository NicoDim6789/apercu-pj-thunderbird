// actions/open-external.js — Ouvrir la PJ dans la visionneuse système
// (télécharge en arrière-plan → downloads.open → app par défaut de l'OS).

import { toolbar } from "../registry.js";
import { downloadAttachment, waitDownloadComplete } from "./lib.js";

toolbar.register({
  id: "open-external",
  label: "🖥 Ouvrir (système)",
  order: 40,
  isAvailable: ({ item }) => !!item,
  handler: async ({ item, message }) => {
    const btn = document.querySelector('[data-action-id="open-external"]');
    const prevHTML = btn?.innerHTML;
    if (btn) {
      btn.innerHTML = `<span class="tb-act-icon">⏳</span><span class="tb-act-label">Ouverture…</span>`;
    }
    try {
      const id = await downloadAttachment({
        messageId: message.id, item, filename: item.name, saveAs: false,
      });
      try { await waitDownloadComplete(id); } catch (_) {}
      await browser.downloads.open(id);
      if (btn) {
        btn.innerHTML = `<span class="tb-act-icon">✓</span><span class="tb-act-label">Ouvert</span>`;
        setTimeout(() => { if (btn) btn.innerHTML = prevHTML; }, 2200);
      }
    } catch (err) {
      if (btn) btn.innerHTML = prevHTML;
      throw err;
    }
  },
});
