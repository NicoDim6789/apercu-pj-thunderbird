// actions/print.js — bouton Imprimer
//
// Phase 1 : window.print() ouvre le dialogue d'impression natif Windows avec
// la fenêtre courante (donc le PDF rendu dans le canvas). Suffisant pour
// 1 à quelques pages. Pour imprimer un PDF de 20+ pages en silencieux, voir
// Phase 1bis (native messaging vers SumatraPDF).
//
// Note : le clic droit dans la fenêtre offre déjà « Imprimer la page » nativement.

import { toolbar } from "../registry.js";

toolbar.register({
  id: "print",
  label: "🖨 Imprimer",
  order: 10,
  isAvailable: ({ pdf }) => !!pdf,
  handler: async () => {
    window.print();
  },
});
