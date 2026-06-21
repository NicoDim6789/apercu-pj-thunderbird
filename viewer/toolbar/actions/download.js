// actions/download.js — Télécharger la PJ (nom d'origine, vers Téléchargements)

import { toolbar } from "../registry.js";
import { downloadAttachment } from "./lib.js";

toolbar.register({
  id: "download",
  label: "📥 Télécharger",
  order: 20,
  isAvailable: ({ item }) => !!item,
  handler: async ({ item, message }) => {
    const btn = document.querySelector('[data-action-id="download"]');
    const prevHTML = btn?.innerHTML;
    if (btn) {
      btn.innerHTML = `<span class="tb-act-icon">⏳</span><span class="tb-act-label">En cours…</span>`;
    }
    await downloadAttachment({ messageId: message.id, item, filename: item.name, saveAs: false });
    if (btn) {
      btn.innerHTML = `<span class="tb-act-icon">✓</span><span class="tb-act-label">Téléchargé</span>`;
      setTimeout(() => { if (btn) btn.innerHTML = prevHTML; }, 2200);
    }
  },
});
