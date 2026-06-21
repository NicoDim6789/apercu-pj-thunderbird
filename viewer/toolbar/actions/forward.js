// actions/forward.js — Transférer le message (compose.beginForward)
//
// Ouvre une fenêtre de rédaction avec le message complet en transfert
// (expéditeur, sujet, corps, pièces jointes incluses).

import { toolbar } from "../registry.js";

toolbar.register({
  id: "forward",
  label: "↪ Transférer",
  order: 50,
  isAvailable: ({ message }) => Number.isFinite(message?.id),
  handler: async ({ message }) => {
    await messenger.compose.beginForward(message.id);
    const btn = document.querySelector('[data-action-id="forward"]');
    if (btn) {
      const prev = btn.innerHTML;
      btn.innerHTML = `<span class="tb-act-icon">✓</span><span class="tb-act-label">Ouvert</span>`;
      setTimeout(() => { if (btn) btn.innerHTML = prev; }, 2000);
    }
  },
});
