// registry.js — registre d'actions de la toolbar
//
// Contrat de chaque action :
//   { id, label, order, isAvailable: (ctx) => bool, handler: async (ctx) => void }
//
// label peut commencer par un emoji/symbole : "🖨 Imprimer"
// Le render extrait l'icône et le premier mot pour un bouton compact.

const actions = new Map();

// Extrait [icône, premierMot] du label "🖨 Imprimer" → ["🖨", "Imprimer"]
function splitLabel(label) {
  const m = label.match(/^([^\w\s]{1,2})\s*(\S+)/u);
  if (m) return [m[1], m[2].replace(/[….]$/, "")];  // supprime "…" final
  return [null, label];
}

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

  unregister(id) { actions.delete(id); },

  list() {
    return [...actions.values()].sort((a, b) => a.order - b.order);
  },

  /**
   * Rendu compact : icône + premier mot du label.
   * Tooltip = label complet. Re-rendu à chaque changement de PDF actif.
   */
  render(container, ctx) {
    container.innerHTML = "";
    for (const action of this.list()) {
      let available = true;
      try { available = action.isAvailable(ctx); } catch (_) { available = false; }
      if (!available) continue;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.title = action.label;      // tooltip = label complet
      btn.dataset.actionId = action.id;

      const [icon, word] = splitLabel(action.label);
      if (icon) {
        const iconEl = document.createElement("span");
        iconEl.className = "tb-act-icon";
        iconEl.setAttribute("aria-hidden", "true");
        iconEl.textContent = icon;
        btn.appendChild(iconEl);
      }
      const textEl = document.createElement("span");
      textEl.className = "tb-act-label";
      textEl.textContent = word || action.label;
      btn.appendChild(textEl);

      btn.addEventListener("click", async () => {
        btn.disabled = true;
        const prevHTML = btn.innerHTML;
        try {
          await action.handler(ctx);
        } catch (err) {
          console.error(`[Aperçu PJ] action ${action.id}:`, err);
          // Feedback erreur rapide
          btn.innerHTML = `<span class="tb-act-icon">⚠</span><span class="tb-act-label">Erreur</span>`;
          await new Promise((r) => setTimeout(r, 2200));
          btn.innerHTML = prevHTML;
        } finally {
          btn.disabled = false;
        }
      });
      container.appendChild(btn);
    }
  },
};
