# Aperçu PJ — extension Thunderbird

Extension WebExtension qui affiche l'aperçu des PDF en pièce jointe directement dans la zone du message, sans clic.

## Cible

- **Thunderbird 151+** (détecté localement : 151.0.1)
- Manifest **V3**
- Plateforme : Windows 11, deux postes synchronisés via Git

## Décisions d'architecture (figées le 2026-06-10)

| # | Décision | Justification |
|---|----------|---------------|
| 1 | Manifest V3 | TB pousse activement vers MV3 ; MV2 est en sursis. APIs utilisées (`messageDisplay`, `messages.*`, `messageDisplayScripts`) stables en MV3. |
| 2 | Panneau **sous le corps** du message | `messageDisplayScripts` injecte dans le HTML rendu — splitter latéralement nécessiterait un panneau séparé qui casse le flux de lecture. |
| 3 | PDF.js **legacy build (UMD)** bundlé localement | Compat large, indépendance réseau totale (CSP / vie privée), pas de CDN. |
| 4 | Liste **verticale** pour plusieurs PDFs dans un mail | Préférence utilisateur — sidebar fine à gauche du panneau. |
| 5 | Préférences **locales par machine** (`storage.local`) | `storage.sync` n'est pas réellement implémenté dans TB. Sync inter-postes hors scope phase 1. |
| 6 | Racine repo Git = **`D:\NICO\CLAUDE\Thunderbird\`** | Pas de sous-dossier. |
| 7 | Garde-fou taille : **15 Mo par défaut, configurable** | Au-delà, bouton « Charger l'aperçu » manuel. Évite le freeze sur les comptes rendus de chantier volumineux. |
| 8 | Toolbar = **registre d'actions extensible** | Préparation Phase 2 (Imprimer, Archiver chantier, Envoyer CCM) sans refonte. |

## Contrat du registre d'actions toolbar

Chaque action est enregistrée via :

```js
toolbar.register({
  id: 'print',           // identifiant unique
  label: 'Imprimer',     // libellé i18n
  icon: 'icons/...',     // chemin relatif à la racine extension
  order: 10,             // ordre d'affichage croissant
  isAvailable: ({ pdf, message }) => boolean,
  handler: async ({ pdfBlob, pdfName, message }) => void
});
```

Phase 1 ne livre que le **stub `print`** (désactivé). Phase 1bis branchera le native messaging vers SumatraPDF. Phase 2 ajoutera `archive-chantier` et `send-ccm`.

## Flux de données

```
TB affiche un mail
   │
   ▼
background.js          ── onMessageDisplayed(tab, msg)
   │                   ── messages.listAttachments(msg.id)
   │                   ── filtre contentType === 'application/pdf'
   │                   ── runtime.sendMessage(tabId, {type:'pdfsFound', list})
   ▼
content/inject.js      ── (messageDisplayScript, CSP restrictive)
   │                   ── insère <iframe src="moz-extension://…/viewer/viewer.html">
   ▼
viewer/viewer.html     ── page extension, CSP normale, PDF.js OK
   │                   ── runtime.sendMessage({type:'getPdf', msgId, partName})
   │                   ◄─ background répond ArrayBuffer (transférable)
   │                   ── PDF.js getDocument → render page courante uniquement
```

## Structure du repo

```
.
├── manifest.json
├── background/background.js
├── content/inject.js, inject.css
├── viewer/viewer.html, viewer.js, viewer.css
├── viewer/toolbar/registry.js, actions/print.js
├── vendor/pdfjs/              ← bundle legacy local
├── options/options.html, options.js
├── _locales/fr/messages.json
├── icons/
├── README.md
├── CLAUDE.md (ce fichier)
└── .claude/session-log.md
```

## Points d'incertitude connus

- **CSP messageDisplayScripts** : PDF.js ne peut pas tourner directement dans la zone message (eval / worker bloqués). Contournement = iframe vers page extension `moz-extension://`. Validé techniquement, à vérifier au premier essai.
- **Sérialisation Blob cross-context MV3** : on transfère `ArrayBuffer` plutôt que `Blob` pour fiabilité.
- **`message_display_scripts` en MV3** : la doc TB est explicite ; pas de `matches` requis (s'applique à tout message affiché).
- **Background MV3 TB** : utilise `background.scripts` (pas service_worker — TB ne suit pas Chrome sur ce point).

## Phase 2 — préparée, pas développée

- Archivage Supabase avec référence chantier `CH-AAAA-NNN`
- Transmission CCM (préparation Factur-X)
- Le registre d'actions doit pouvoir accueillir ces deux modules sans toucher au viewer.
