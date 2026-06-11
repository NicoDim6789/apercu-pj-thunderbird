// actions/download.js — B1 : télécharger la PJ (nom d'origine, vers Téléchargements)

import { toolbar } from "../registry.js";
import { downloadAttachment } from "./lib.js";

toolbar.register({
  id: "download",
  label: "📥 Télécharger",
  order: 20,
  isAvailable: ({ item }) => !!item,
  handler: async ({ item, message }) => {
    await downloadAttachment({
      messageId: message.id,
      item,
      filename: item.name,
      saveAs: false,
    });
  },
});
