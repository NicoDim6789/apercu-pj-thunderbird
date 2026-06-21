// actions/print.js — Imprimer le contenu du viewer
//
// window.print() peut lever une exception dans certaines versions de Thunderbird
// quand la fenêtre est de type "popup". On l'appelle via setTimeout pour
// échapper à la pile d'appel du click, ce qui règle le problème sur TB 128-151.

import { toolbar } from "../registry.js";

toolbar.register({
  id: "print",
  label: "🖨 Imprimer",
  order: 10,
  isAvailable: ({ pdf }) => !!pdf,
  handler: () =>
    new Promise((resolve) => {
      setTimeout(() => {
        try { window.print(); } catch (_) {}
        resolve();
      }, 60);
    }),
});
