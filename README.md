# Aperçu PJ — Extension Thunderbird

Affiche automatiquement l'aperçu des PDF en pièce jointe directement dans la zone du message, sans clic.

- **Cible :** Thunderbird ≥ 128 (testé sur 151)
- **Manifest :** V3
- **Rendu PDF :** PDF.js v6.0.227 (legacy), embarqué — **aucun appel réseau**
- **Confidentialité :** aucune donnée ne sort de la machine

---

## Installation

### Installation en mode debug (rechargement à chaud, pour développement)

1. Thunderbird → menu **☰** → **Outils du développeur** → **Débogage des modules complémentaires**
2. Cocher *Activer le mode débogage des extensions*
3. Cliquer **Charger un module temporaire…**
4. Sélectionner le fichier `manifest.json` à la racine de ce dossier
5. L'extension est active jusqu'à fermeture de Thunderbird

### Installation permanente (.xpi)

1. Zipper le contenu de ce dossier (le ZIP doit contenir `manifest.json` à sa racine, **pas un dossier parent**) :
   ```powershell
   Compress-Archive -Path D:\NICO\CLAUDE\Thunderbird\* -DestinationPath apercu-pj.zip -Force
   Rename-Item apercu-pj.zip apercu-pj.xpi
   ```
2. Thunderbird → **Outils** → **Modules complémentaires et thèmes** → roue dentée ⚙ → **Installer un module depuis un fichier…**
3. Sélectionner `apercu-pj.xpi`
4. Confirmer l'installation

> Pour une extension non-signée, Thunderbird Release peut refuser l'installation .xpi. Dans ce cas, utiliser le mode debug ou activer la préférence `xpinstall.signatures.required = false` dans `about:config`.

### Installation sur les deux machines (PC fixe + Surface Pro)

Le repo Git de ce dossier est synchronisé entre les deux machines : sur chacune, suivre simplement la procédure d'installation en mode debug. Les préférences (`storage.local`) sont propres à chaque machine.

---

## Utilisation

- Sélectionner un mail contenant un ou plusieurs PDF → l'aperçu s'affiche automatiquement sous le corps du message.
- **Plusieurs PDFs** : barre latérale gauche, cliquer pour basculer.
- **Navigation** : flèches ◀ ▶ ou saisir un numéro de page.
- **Zoom** : boutons − / + ou liste déroulante (ajuster largeur par défaut).
- **Replier le panneau** : bouton ▼ dans l'en-tête (état mémorisé entre sessions).
- **Préférences** : Modules complémentaires → Aperçu PJ → ⚙ → Préférences

---

## Configuration

| Réglage | Défaut | Effet |
|--------|--------|-------|
| Taille max chargement auto | 15 Mo | Au-delà, bouton « Charger l'aperçu » manuel |
| Panneau replié par défaut | Non | Mémorisé localement après usage |

---

## Procédure de test

À dérouler sur **chaque machine** après installation :

| # | Cas | Résultat attendu |
|---|-----|------------------|
| 1 | Mail texte sans aucune pièce jointe | Aucun panneau d'aperçu n'apparaît |
| 2 | Mail avec un seul PDF léger (< 1 Mo) | Panneau s'ouvre, page 1 rendue automatiquement, sidebar masquée |
| 3 | Mail avec 3 PDFs | Sidebar verticale visible, premier PDF actif, clic sur les autres bascule l'aperçu |
| 4 | PDF de 50 pages | Navigation page par page fonctionnelle, valeur du champ page modifiable |
| 5 | Zoom +/− et « Ajuster largeur » | Re-rendu propre, pas de débordement |
| 6 | Mail avec PDF de 25 Mo | Bouton « Charger l'aperçu » apparaît, le clic charge le PDF |
| 7 | Modifier la taille max à 1 Mo dans les options | Cas 2 déclenche désormais le garde-fou |
| 8 | Mail avec PJ mixtes (PDF + image + .htm signature) | Seuls les PDFs sont listés/affichés |
| 9 | Replier le panneau, sélectionner un autre mail, revenir | L'état replié est restauré |
| 10 | Mail avec PDF corrompu (modifié à la main) | Message d'erreur lisible, pas de crash |
| 11 | Thunderbird en thème sombre | Couleurs du panneau et du viewer cohérentes |
| 12 | Mode hors-ligne complet | Le rendu fonctionne (preuve d'absence d'appel réseau) |

---

## Structure du projet

```
.
├── manifest.json
├── background/background.js        ← détection PDF, fourniture des Blob
├── content/
│   ├── inject.js                   ← messageDisplayScript : injecte l'iframe
│   └── inject.css
├── viewer/
│   ├── viewer.html / .js / .css    ← UI + intégration PDF.js
│   └── toolbar/
│       ├── registry.js             ← registre d'actions extensible
│       └── actions/print.js        ← stub Phase 1bis
├── vendor/pdfjs/                   ← PDF.js v6.0.227 legacy, bundle local
├── options/                        ← page Préférences
├── _locales/fr/messages.json
├── icons/icon.svg
├── README.md (ce fichier)
├── CLAUDE.md                       ← décisions d'architecture
└── .claude/session-log.md          ← journal de session
```

---

## Roadmap

- **Phase 1** (cette version) : aperçu PDF inline, multi-PDF, options, registre toolbar
- **Phase 1bis** : bouton 🖨 Imprimer via native messaging → SumatraPDF silencieux
- **Phase 2** : actions Archiver chantier (Supabase, ref `CH-AAAA-NNN`) + Envoyer CCM (Factur-X)

---

## Dépannage

- **Le panneau ne s'affiche pas** : ouvrir la console du débogueur de l'extension (Modules complémentaires → ⚙ → Déboguer) et vérifier les erreurs.
- **« Impossible d'afficher »** : généralement un PDF chiffré ou corrompu. Tenter d'ouvrir le PDF normalement pour confirmer.
- **Garde-fou de taille trop strict** : augmenter la limite dans les Préférences.
