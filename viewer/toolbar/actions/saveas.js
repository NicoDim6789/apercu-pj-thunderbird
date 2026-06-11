// actions/saveas.js — B2 : « Enregistrer sous… » avec nom intelligent
// (AAAA-MM-JJ_Expéditeur_Sujet.ext) pré-rempli dans le dialogue.

import { toolbar } from "../registry.js";
import { downloadAttachment, smartFilename } from "./lib.js";

toolbar.register({
  id: "save-as",
  label: "💾 Enregistrer sous…",
  order: 30,
  isAvailable: ({ item }) => !!item,
  handler: async ({ item, message, meta }) => {
    await downloadAttachment({
      messageId: message.id,
      item,
      filename: smartFilename(item, meta),
      saveAs: true,
    });
  },
});
