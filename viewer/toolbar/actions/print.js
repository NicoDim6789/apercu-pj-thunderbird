// actions/print.js — stub d'impression
//
// Phase 1 : action enregistrée mais désactivée tant que l'hôte natif
// (Phase 1bis) n'est pas installé.
//
// Phase 1bis branchera ici un browser.runtime.sendNativeMessage()
// vers un hôte natif qui exécutera :
//   SumatraPDF.exe -print-to-default -silent <fichier.pdf>

import { toolbar } from "../registry.js";

toolbar.register({
  id: "print",
  label: "🖨 Imprimer",
  order: 10,
  isAvailable: () => false, // désactivé en Phase 1
  handler: async (_ctx) => {
    // À implémenter en Phase 1bis :
    //   const port = browser.runtime.connectNative("apercu_pj_print");
    //   port.postMessage({ pdfBytes: [...new Uint8Array(buffer)] });
    throw new Error("Impression non encore implémentée (Phase 1bis).");
  },
});
