// actions/open-external.js — Ouvrir la PJ dans la visionneuse système
// (télécharge en arrière-plan → background ouvre via downloads.open/show → app OS).
// Le background a le bon contexte de permission pour downloads.open() ; depuis un
// popup, l'appel échoue avec une erreur de contexte sur certaines versions de TB.

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
      // Délégué au background : downloads.open() fonctionne mieux depuis ce contexte.
      // Fallback automatique vers downloads.show() si open() échoue (affiche le dossier).
      await browser.runtime.sendMessage({ type: "openDownload", downloadId: id });
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
