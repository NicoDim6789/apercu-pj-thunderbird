# Aperçu PJ — Extension Thunderbird

Affiche les PDF en pièce jointe dans une fenêtre dédiée déplaçable, ouverte d'un clic sur un bouton de la barre du message.

- **Cible :** Thunderbird ≥ 128 (testé sur 151)
- **Manifest :** V3
- **Rendu PDF :** PDF.js v6.0.227 (legacy ESM), embarqué — **aucun appel réseau**
- **Confidentialité :** aucune donnée ne sort de la machine

> ℹ️ La v0.1 visait un aperçu **inline** sous le corps du message. TB 151 MV3 a retiré toutes les APIs qui le permettaient (cf. `CLAUDE.md`). La v0.2 utilise une fenêtre popup déplaçable comme alternative pragmatique.

---

## Installation

### Mode debug (rechargement à chaud)

1. Menu **☰** → **Modules complémentaires et thèmes** (Ctrl+Maj+A)
2. Roue dentée ⚙ → **Déboguer les modules complémentaires**
3. Sur `about:debugging` → **Charger un module complémentaire temporaire…**
4. Sélectionner `D:\NICO\CLAUDE\Thunderbird\manifest.json`
5. L'extension est active jusqu'à fermeture de Thunderbird

### Installation permanente (.xpi)

```powershell
Compress-Archive -Path D:\NICO\CLAUDE\Thunderbird\* -DestinationPath apercu-pj.zip -Force
Rename-Item apercu-pj.zip apercu-pj.xpi
```
Puis Outils → Modules complémentaires → ⚙ → Installer un module depuis un fichier.

> Si TB refuse l'install non signée : `about:config` → `xpinstall.signatures.required = false`.

### Sur les deux machines

Le repo Git est synchronisé entre PC fixe et Surface Pro. Sur chaque machine, suivre l'install ci-dessus. Les préférences (`storage.local`) sont propres à chaque poste.

---

## Utilisation

1. **Sélectionner un mail** contenant un ou plusieurs PDF
2. Dans la barre d'outils du message, un bouton 🟥 apparaît avec un **badge rouge** indiquant le nombre de PDFs (ex : « 3 »)
3. **Cliquer le bouton** → ouverture d'une fenêtre déplaçable contenant l'aperçu
4. La fenêtre se souvient de sa **position et taille** entre les ouvertures

### Dans la fenêtre

- **Liste verticale** à gauche (si plusieurs PDFs) — cliquer pour basculer
- **Navigation** : flèches ◀ ▶ ou saisir un numéro de page
- **Zoom** : boutons − / + ou liste déroulante (« Ajuster largeur » par défaut)
- **🖨 Imprimer** : bouton dans la toolbar (ou Ctrl+P, ou **clic droit → Imprimer la page**)
- **Fermer** : croix de la fenêtre

---

## Configuration

Préférences → Modules complémentaires → Aperçu PJ → ⚙

| Réglage | Défaut | Effet |
|---|---|---|
| Géométrie par défaut | 900 × 950 px | Taille initiale ; ensuite la fenêtre se souvient de sa dernière position/taille |

---

## Procédure de test

Sur chaque machine après installation :

| # | Cas | Résultat attendu |
|---|---|---|
| 1 | Mail sans pièce jointe | Bouton sans badge ; clic ouvre fenêtre vide « Aucun PDF dans ce message » |
| 2 | Mail avec 1 PDF léger | Badge « 1 », clic ouvre la fenêtre, PDF rendu page 1 |
| 3 | Mail avec 3 PDFs | Badge « 3 », fenêtre s'ouvre avec liste verticale, premier PDF actif |
| 4 | PDF de 50 pages | Navigation page par page fonctionnelle, saisie de numéro de page directe |
| 5 | Zoom +/−, Ajuster largeur | Re-rendu propre |
| 6 | Déplacer la fenêtre, la redimensionner, la fermer | À la prochaine ouverture, position et taille restaurées |
| 7 | Mail avec PJ mixtes (PDF + image + .htm) | Badge ne compte que les PDFs |
| 8 | PDF corrompu | Message d'erreur lisible, pas de crash |
| 9 | Clic droit dans la fenêtre → Imprimer la page | Dialogue d'impression Windows |
| 10 | Bouton 🖨 dans la toolbar | Dialogue d'impression Windows |
| 11 | Ctrl+P | Dialogue d'impression Windows |
| 12 | Thème sombre Thunderbird | Couleurs cohérentes |
| 13 | Hors-ligne complet | Rendu fonctionne (zéro réseau) |
| 14 | Changer de mail sans fermer la fenêtre | La fenêtre reste sur le mail initial (intentionnel) ; le badge se met à jour pour le nouveau mail |

---

## Structure du projet

```
.
├── manifest.json
├── background/background.js         ← détection PDFs, badge, ouverture popup, fourniture Blob
├── viewer/
│   ├── viewer.html / .js / .css     ← UI + intégration PDF.js
│   └── toolbar/
│       ├── registry.js              ← registre d'actions extensible
│       └── actions/print.js         ← bouton Imprimer (Phase 1bis : SumatraPDF)
├── vendor/pdfjs/                    ← PDF.js v6.0.227 legacy, bundle local
├── options/                         ← page Préférences
├── _locales/fr/messages.json
├── icons/icon.svg
├── README.md
├── CLAUDE.md
└── .claude/session-log.md
```

---

## Roadmap

- **Phase 1 (cette version, v0.2)** : popup, badge, multi-PDF, options, registre toolbar avec Imprimer actif
- **Phase 1bis** : impression silencieuse via native messaging → `SumatraPDF.exe -print-to-default -silent`
- **Phase 2** : Archiver chantier (Supabase, ref `CH-AAAA-NNN`) + Envoyer CCM (Factur-X)

---

## Dépannage

- **Pas de bouton dans la barre du message** : vérifier l'extension est bien chargée dans `about:debugging`, et que le mail est sélectionné dans la liste (pas en multi-sélection).
- **Badge présent mais clic sans effet** : ouvrir l'Examiner depuis `about:debugging` → onglet Console → chercher les erreurs préfixées par `[Aperçu PJ]`.
- **Fenêtre s'ouvre minuscule ou hors écran** : Préférences → Réinitialiser.
