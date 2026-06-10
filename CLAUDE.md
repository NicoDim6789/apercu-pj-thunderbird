# Aperçu PJ — extension Thunderbird

**Statut Phase 1 : ✅ validée 2026-06-10 sur TB 151.0.1 (v0.2.0).**

Extension WebExtension qui affiche l'aperçu des PDF en pièce jointe dans une fenêtre dédiée déplaçable, ouverte d'un clic sur un bouton de la barre du message.

## Cible

- **Thunderbird 151+** (testé sur 151.0.1)
- Manifest **V3**
- Plateforme : Windows 11, deux postes synchronisés via Git

## Pivot architectural — v0.2.0 (2026-06-10)

**Constat technique TB 151 MV3 :** aucune API n'expose plus l'injection d'un script dans le DOM du message affiché.

| API testée | Résultat |
|---|---|
| `message_display_scripts` manifest field | Reconnu, script jamais injecté |
| `messageDisplayScripts.register()` | Namespace inexistant |
| `scripting.messageDisplay.registerScripts()` | Inexistant |
| `scripting.executeScript()` | Inexistant |
| `tabs.executeScript()` | Inexistant |

→ Les APIs MV2 ont été retirées en MV3, sans remplacement standard. La piste inline est morte (l'unique alternative serait une Experiment API, exclue par contrainte projet).

**Solution adoptée : fenêtre popup déplaçable.**
- Bouton `messageDisplayAction` dans la barre du message + **badge** affichant le nombre de PDFs
- Clic → `windows.create({type:"popup"})` ouvre une **vraie fenêtre Windows** : déplaçable, redimensionnable, agrandissable
- Clic droit dans la fenêtre → menu contextuel natif TB avec « Imprimer la page »
- Bouton 🖨 Imprimer aussi dans la toolbar (`window.print()`) + raccourci Ctrl+P
- Géométrie de la fenêtre (position + taille) persistée dans `storage.local` et restaurée à l'ouverture suivante

## Décisions d'architecture (figées et révisées)

| # | Décision initiale | État après v0.2 |
|---|---|---|
| 1 | Manifest V3 | Maintenu |
| 2 | Panneau sous le corps du message | ❌ Abandonné — API d'injection retirée. Fenêtre popup à la place. |
| 3 | PDF.js legacy ESM bundlé localement | Maintenu (v6.0.227) |
| 4 | Liste verticale multi-PDFs | Maintenu — dans la fenêtre popup |
| 5 | Préférences locales par machine | Maintenu |
| 6 | Racine `D:\NICO\CLAUDE\Thunderbird\` | Maintenu |
| 7 | Garde-fou taille 15 Mo configurable | Supprimé — l'utilisateur ouvre la fenêtre explicitement, plus de garde-fou auto |
| 8 | Toolbar = registre d'actions extensible | Maintenu — `print` activé en Phase 1, `archive-chantier` et `send-ccm` viendront en Phase 2 |

## Contrat du registre d'actions toolbar (inchangé)

```js
toolbar.register({
  id, label, icon, order,
  isAvailable: ({pdf, message}) => boolean,
  handler: async ({pdf, pdfDoc, pdfCanvas, pdfName, message}) => void
});
```

## Flux de données (v0.2)

```
TB affiche un mail
   │
   ▼
background.js  ── onMessagesDisplayed(tab, displayedMessages)
   │           ── listAttachments → collectPdfAttachments
   │           ── messageDisplayAction.setBadgeText(n)
   ▼
Utilisateur clique le bouton de la barre du message
   │
   ▼
background.js  ── onClicked → windows.create({
   │              url: "viewer/viewer.html?messageId=N",
   │              type: "popup", width, height, left, top })
   ▼
viewer.html (fenêtre popup, déplaçable)
   │  → runtime.sendMessage({type:'getPdfList', messageId}) → liste des PDFs
   │  → runtime.sendMessage({type:'getPdf', messageId, partName}) → ArrayBuffer
   │  → PDF.js render canvas
   │  → toolbar via registry.js
   │  → beforeunload → runtime.sendMessage({type:'saveGeometry', geom})
```

## Structure du repo

```
.
├── manifest.json
├── background/background.js
├── viewer/
│   ├── viewer.html, viewer.js, viewer.css
│   └── toolbar/
│       ├── registry.js
│       └── actions/print.js
├── vendor/pdfjs/              ← bundle legacy PDF.js v6.0.227 local
├── options/options.html, options.css, options.js
├── _locales/fr/messages.json
├── icons/icon.svg
├── README.md
├── CLAUDE.md
└── .claude/session-log.md
```

## Phase 1bis — préparée

Bouton 🖨 Imprimer actuellement = `window.print()`. Pour impression silencieuse (sans dialogue) d'un PDF entier, prévoir native messaging vers `SumatraPDF.exe -print-to-default -silent`. Le stub `print.js` peut être étendu sans toucher au viewer.

## Phase 2 — préparée, pas développée

- Action « Archiver dans le chantier » : push Supabase avec référence `CH-AAAA-NNN`
- Action « Envoyer au CCM » : transmission Factur-X

Les deux s'enregistrent dans le registre toolbar sans modifier `viewer.js`.
