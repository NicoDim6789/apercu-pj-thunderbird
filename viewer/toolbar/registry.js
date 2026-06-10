// registry.js — registre d'actions de la toolbar
//
// Contrat figé (cf. CLAUDE.md) :
//   {
//     id, label, icon, order,
//     isAvailable: ({pdf, message}) => boolean,
//     handler: async ({pdfBlob, pdfName, message}) => void
//   }
//
// Phase 1 : seul 'print' est enregistré (stub désactivé).
// Phase 1bis : print branchera le native messaging vers SumatraPDF.
// Phase 2 : 'archive-chantier' + 'send-ccm' s'ajouteront ici sans toucher au viewer.

const actions = new Map();

export const toolbar = {
  register(action) {
    if (!action?.id) throw new Error("toolbar.register : id manquant");
    if (typeof action.handler !== "function") {
      throw new Error(`toolbar.register : handler manquant pour ${action.id}`);
    }
    actions.set(action.id, {
      order: 0,
      isAvailable: () => true,
      ...action,
    });
  },

  unregister(id) {
    actions.delete(id);
  },

  list() {
    return [...actions.values()].sort((a, b) => a.order - b.order);
  },

  /**
   * Rendu de la toolbar dans le conteneur fourni.
   * Re-rendu à chaque changement de PDF actif pour évaluer isAvailable.
   */
  render(container, ctx) {
    container.innerHTML = "";
    for (const action of this.list()) {
      let available = true;
      try { available = action.isAvailable(ctx); } catch (_) { available = false; }
      if (!available) continue;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.title = action.label;
      btn.dataset.actionId = action.id;
      btn.textContent = action.label;
      btn.addEventListener("click", async () => {
        btn.disabled = true;
        try {
          await action.handler(ctx);
        } catch (err) {
          console.error(`[Aperçu PJ] action ${action.id}:`, err);
        } finally {
          btn.disabled = false;
        }
      });
      container.appendChild(btn);
    }
  },
};
