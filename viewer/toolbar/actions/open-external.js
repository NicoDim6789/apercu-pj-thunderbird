// actions/open-external.js — B4 : ouvrir la PJ dans la visionneuse système
// (télécharge puis downloads.open → application par défaut de l'OS).

import { toolbar } from "../registry.js";
import { downloadAttachment, waitDownloadComplete } from "./lib.js";

toolbar.register({
  id: "open-external",
  label: "🖥 Ouvrir (système)",
  order: 40,
  isAvailable: ({ item }) => !!item,
  handler: async ({ item, message }) => {
    const id = await downloadAttachment({
      messageId: message.id,
      item,
      filename: item.name,
      saveAs: false,
    });
    try { await waitDownloadComplete(id); } catch (_) { /* on tente l'ouverture quand même */ }
    await browser.downloads.open(id);
  },
});
