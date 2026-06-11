# Aperçu PJ — extension Thunderbird

**Statut Phase 1 : ✅ validée 2026-06-10 sur TB 151.0.1 (v0.2.0).**
**v0.3.0 (Lot 1 « Affichage », 2026-06-11) : à tester dans TB.** Viewer reconstruit sur les
composants officiels PDF.js (`vendor/pdfjs/web/pdf_viewer.mjs`) → scroll continu (A1), vignettes
(A2), recherche texte (A3), rotation (A4), zoom mémorisé (A5), raccourcis clavier (A6), aperçu
images (D1). Détails et checklist de test : `.claude/session-log.md`.

Extension WebExtension qui affiche l'aperçu des PDF en pièce jointe dans une fenêtre dédiée déplaçable, ouverte d'un clic sur un bouton de la barre du message.

---

## 🔧 Reprendre ce projet avec Claude Code

**Démarche standard pour toute modification ultérieure :**

1. Ouvrir un terminal dans `D:\NICO\CLAUDE\Thunderbird\` et lancer `claude` (ou ouvrir le dossier depuis l'extension VSCode/JetBrains).
2. Claude Code chargera automatiquement ce CLAUDE.md (contexte projet) et la mémoire associée (machine-locale, dans `C:\Users\Nico\.claude\projects\D--NICO-CLAUDE-Thunderbird\memory\`).
3. Décrire la modification souhaitée en langage naturel. Exemples typiques :
   - « ajoute un bouton 📥 Télécharger dans la toolbar »
   - « change la couleur du badge en bleu »
   - « la fenêtre s'ouvre trop petite, augmente la taille par défaut »
   - « commence la Phase 1bis : impression silencieuse via SumatraPDF »

**Après chaque modification de code, recharger l'extension dans Thunderbird :**
- Ouvrir `about:debugging` (cf. README)
- Cliquer **Actualiser** sur la carte « Aperçu PJ »
- Tester l'effet directement

**Pour packager en .xpi (install permanente) :**
```powershell
.\tools\build-xpi.ps1
```
Génère `dist/apercu-pj-vX.Y.Z.xpi` à installer via Modules complémentaires → ⚙.

**Synchronisation 2 machines (PC fixe ↔ Surface Pro) :**
- Le code est synchronisé via Git (push depuis l'une, pull sur l'autre).
- Les préférences `storage.local` sont par machine (volontaire).
- La mémoire Claude (`C:\Users\Nico\.claude\projects\...\memory\`) reste locale à chaque poste. Tout ce qui est nécessaire pour reprendre le projet est dans **ce CLAUDE.md** et dans **`.claude/session-log.md`** — donc l'autre machine peut reprendre sans cette mémoire (Claude la reconstituera au fil des sessions).

---

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

## Contrat du registre d'actions toolbar

```js
toolbar.register({
  id, label, icon, order,
  isAvailable: ({pdf, message}) => boolean,
  handler: async ({pdf, item, pdfDoc, pdfName, message, viewer}) => void
});
```

**Évolution v0.3 :** `ctx.pdfCanvas` vaut désormais `null` (plus de canvas unique en scroll continu).
Ajout de `ctx.item` (`{partName, name, size, contentType, kind}`) et `ctx.viewer` (l'instance
`PDFViewer`). `ctx.pdf` est l'item quand c'est un PDF, sinon `null` (les images ont `ctx.item` mais
`ctx.pdf === null`). Les actions Lot 2+ (download, etc.) doivent s'appuyer sur `item.partName` +
`message.id`, pas sur le canvas.

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
├── background/background.js   ← collectPreviewable (PDF + images), badge, endpoints runtime
├── viewer/
│   ├── viewer.html, viewer.js, viewer.css   ← shell maison autour des composants PDF.js
│   └── toolbar/
│       ├── registry.js
│       └── actions/print.js
├── vendor/pdfjs/             ← bundle legacy PDF.js v6.0.227 local
│   ├── build/pdf.mjs, pdf.worker.mjs         ← cœur (getDocument, worker)
│   └── web/pdf_viewer.mjs, pdf_viewer.css     ← composants viewer (PDFViewer, Find, Link, EventBus)
├── options/options.html, options.css, options.js
├── _locales/fr/messages.json
├── icons/icon.svg
├── README.md
├── CLAUDE.md
└── .claude/session-log.md
```

**Viewer v0.3 (composants PDF.js) :** notre shell garde la liste multi-PJ + la barre d'actions
(contrat figé) et embarque `PDFViewer`/`PDFFindController`/`PDFLinkService` via `pdf_viewer.mjs`.
Le document est créé par `pdf.mjs` (`getDocument`) puis passé à `PDFViewer.setDocument()` — pattern
officiel « components ». Les images sont rendues hors viewer (`<img>`). Vignettes = rendu maison.
`#viewerContainer` DOIT rester `position:absolute; overflow:auto` et visible avant `setDocument`.

## Phase 1bis — préparée

Bouton 🖨 Imprimer actuellement = `window.print()`. Pour impression silencieuse (sans dialogue) d'un PDF entier, prévoir native messaging vers `SumatraPDF.exe -print-to-default -silent`. Le stub `print.js` peut être étendu sans toucher au viewer.

## Phase 2 — préparée, pas développée

- Action « Archiver dans le chantier » : push Supabase avec référence `CH-AAAA-NNN`
- Action « Envoyer au CCM » : transmission Factur-X

Les deux s'enregistrent dans le registre toolbar sans modifier `viewer.js`.
