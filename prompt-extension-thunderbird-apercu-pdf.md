# Prompt Claude Code — Extension Thunderbird « Aperçu PJ »

## Contexte

Je dirige une PME de construction (charpente, couverture, zinguerie) et je reçois quotidiennement des dizaines de mails avec des PDF en pièce jointe : comptes rendus de chantier d'architectes, devis fournisseurs, factures, rapports de bureaux de contrôle. Aujourd'hui, chaque PDF doit être ouvert dans un nouvel onglet Thunderbird, ce qui casse mon flux de lecture.

**Objectif : quand je sélectionne un mail contenant un ou plusieurs PDF, l'aperçu du PDF doit s'afficher automatiquement dans la zone du message, sans aucun clic.**

Mon environnement :
- Windows 11, deux machines (PC fixe + Surface Pro) synchronisées via Git
- Thunderbird version récente (vérifie la version installée avant de choisir le manifest)
- Comptes IMAP (hébergement Jimdo + Orange)
- Je suis à l'aise techniquement mais je veux un dialogue itératif : **pose-moi tes questions et valide l'architecture avec moi AVANT d'écrire la moindre ligne de code.**

## Phase 1 — Aperçu PDF inline (à développer maintenant)

### Comportement attendu

1. À l'affichage d'un message (`messageDisplay.onMessageDisplayed`), lister les pièces jointes
2. Pour chaque PDF détecté : récupérer le fichier via `messages.getAttachmentFile()`, le transmettre au script d'affichage
3. Rendre le PDF avec **PDF.js embarqué dans l'extension** (aucun appel réseau, tout en local)
4. Afficher l'aperçu dans un panneau intégré à la zone du message (injecté via `messageDisplayScripts`)

### Spécifications du panneau d'aperçu

- Position : sous le corps du message (proposer aussi une variante latérale si techniquement propre, on tranchera ensemble)
- Repliable/dépliable d'un clic, état mémorisé entre les sessions
- Navigation entre les pages (précédent/suivant + numéro de page), zoom +/−/ajuster à la largeur
- Si plusieurs PDF dans le mail : onglets ou liste horizontale pour basculer de l'un à l'autre
- Performance : rendre la première page immédiatement, les suivantes à la demande (lazy rendering)
- Garde-fou : au-delà d'une taille configurable (défaut 15 Mo), ne pas rendre automatiquement — afficher un bouton « Charger l'aperçu »
- Ignorer les pièces jointes non-PDF (les .htm de signature, images, etc.)
- Interface en français, sobre, cohérente avec le thème Thunderbird (clair/sombre)

### Contraintes techniques

- Détecter la version de Thunderbird installée et choisir le manifest (V2 ou V3) le plus stable pour cette version — justifie ton choix
- **Uniquement des APIs WebExtensions standard.** Pas d'Experiment API (trop fragile aux mises à jour)
- Aucune donnée ne sort de la machine : pas de télémétrie, pas de réseau
- Code commenté en français, structure de projet propre (repo Git)

## Phase 1bis — Bouton Imprimer (optionnel, à me proposer une fois la phase 1 validée)

Barre de boutons au-dessus de l'aperçu avec un bouton 🖨 **Imprimer** : impression silencieuse du PDF via **native messaging** vers un petit hôte natif (script qui appelle `SumatraPDF.exe -print-to-default -silent`). Prévoir l'installation de l'hôte natif sur les deux machines (clé de registre + manifest JSON).

## Phase 2 — Intégration CCM (NE PAS développer maintenant, juste prévoir l'architecture)

Plus tard, la barre de boutons accueillera :
- 📁 **Archiver dans le chantier** : push du PDF vers Supabase avec référence chantier `CH-AAAA-NNN`
- ➡ **Envoyer au CCM** : transmission des factures fournisseurs (préparation Factur-X)

**Conséquence pour la phase 1 : conçois la barre de boutons comme un composant extensible** (registre d'actions) pour que ces boutons s'ajoutent sans refonte.

## Livrables attendus

1. Dossier d'extension complet, installable via Outils → Modules complémentaires → ⚙ → « Installer un module depuis un fichier » (.xpi ou dossier en mode debug)
2. README.md : installation pas à pas sur les deux machines, options de configuration
3. Procédure de test : liste de cas à vérifier (mail sans PJ, 1 PDF, plusieurs PDF, PDF volumineux, PDF corrompu)
4. Mise à jour de CLAUDE.md et .claude/session-log.md avec les décisions d'architecture

## Méthode de travail

Avant de coder :
1. Vérifie la version de Thunderbird et la documentation des APIs concernées (messageDisplayScripts, messages.listAttachments, getAttachmentFile)
2. Présente-moi l'architecture proposée (manifest choisi, structure des fichiers, flux de données background ↔ script d'affichage)
3. Liste les points d'incertitude ou limitations connues (ex. restrictions CSP dans la zone message pour PDF.js)
4. Attends ma validation, puis développe par itérations testables
