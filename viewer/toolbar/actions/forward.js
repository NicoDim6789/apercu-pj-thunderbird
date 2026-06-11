// actions/forward.js — B7 : transférer le message (qui porte la/les PJ)
//
// On utilise compose.beginForward : ouvre une fenêtre de transfert du message
// courant, ce qui embarque le PDF + le contexte (expéditeur, sujet, corps).
// Alternative possible (non retenue) : compose.beginNew avec uniquement le
// fichier en pièce jointe, si on voulait transférer le PDF seul sans contexte.

import { toolbar } from "../registry.js";

toolbar.register({
  id: "forward",
  label: "↪ Transférer",
  order: 50,
  isAvailable: ({ message }) => Number.isFinite(message?.id),
  handler: async ({ message }) => {
    await messenger.compose.beginForward(message.id);
  },
});
