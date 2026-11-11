# Prompt — Module « Cours » de l'application CCM

> Prompt optimisé à coller dans Claude Code, ouvert à la racine du dépôt de l'application CCM.
> Rédigé le 2026-11-11. Les références normatives sont à **revérifier au moment du développement** :
> c'est justement le rôle du module « Veille » (§ 7).

---

## RÔLE ET CONTEXTE

Tu es à la fois **développeur senior** de l'application CCM et **ingénieur structure bois / formateur**
expert en statique, résistance des matériaux (RdM), Eurocodes (EN 1990, EN 1991, EN 1995, EN 1998)
et NF DTU de la charpente et de l'ossature bois.

Je suis professionnel de la charpente / construction bois. Je suis une formation et j'utilise les
logiciels **ACORD-Bat**, **SEMA** et **Cadwork**. Je veux comprendre ce que ces logiciels calculent, être
capable de **vérifier leurs résultats à la main** et de **justifier mes choix** face à un bureau de contrôle.

Crée dans l'application CCM un nouveau module nommé **« Cours »** : un parcours de formation
progressif, rigoureux et à jour des normes, avec suivi de progression, fiches de calcul réutilisables,
journal de questions et veille normative mensuelle.

## ÉTAPE 0 — AVANT DE CODER (obligatoire)

1. Lis le `README`, le `CLAUDE.md` et la structure de l'application CCM : stack, routage, système de
   modules/menus, design system, base de données, authentification, conventions de nommage.
2. **Intègre le module dans l'architecture existante** (même navigation, mêmes composants, même
   stockage). N'ajoute aucune dépendance lourde sans me la proposer d'abord.
3. Présente-moi un **plan court** (modèle de données, écrans, découpage en lots) et attends ma
   validation avant d'écrire le code.
4. Développe en **lots livrables** :
   - Lot 1 : squelette du module + modèle de données + tableau de bord + statuts.
   - Lot 2 : moteur de leçons + modules 0 à 4 rédigés intégralement.
   - Lot 3 : modules 5 à 10.
   - Lot 4 : modules 11 à 15 + fiches de calcul + journal de questions.
   - Lot 5 : veille normative + export/sauvegarde.

## 1. EXIGENCES TECHNIQUES ET UX

- **Responsive mobile-first** : utilisable au quotidien sur smartphone (révision 10 min dans les
  transports) et sur ordinateur (étude approfondie, calculs). Cibles tactiles ≥ 44 px, pas de scroll
  horizontal, tableaux de calcul repliables / défilables dans leur conteneur.
- **Mise à jour des statuts en 1 tap** depuis n'importe quelle leçon, notion ou question.
- **Hors-ligne au minimum en lecture** si la stack le permet (cache des leçons consultées).
- **Formules** rendues proprement (KaTeX ou équivalent déjà présent ; sinon proposer).
- **Schémas en SVG inline** (pas d'images bitmap) : lisibles en thème clair et sombre, légendés,
  avec cotes, repères, sens des efforts et conventions de signe explicites.
- **Recherche plein texte** sur leçons, fiches, formules, questions et références normatives.
- **Contenu pédagogique séparé du code** (fichiers Markdown/MDX ou JSON, ou tables dédiées) pour que
  je puisse corriger ou compléter une leçon sans toucher aux composants.
- **Export / import JSON** de toute ma progression + **export PDF/impression** d'une fiche ou d'une leçon.
- Aucune intégration externe obligatoire : le module doit fonctionner seul. La veille automatisée
  (§ 7.4) est une **option** désactivable.

## 2. MODÈLE DE DONNÉES (à adapter à la stack)

| Entité | Champs principaux |
|---|---|
| `cours_module` | id, numéro, titre, objectifs, prérequis, durée estimée, ordre |
| `cours_lecon` | id, module_id, titre, niveau (fondamental / intermédiaire / avancé / expert), durée, contenu, références normatives liées |
| `cours_notion` | id, lecon_id, intitulé, **statut**, date_dernier_statut, date_prochaine_revision, note perso |
| `cours_evaluation` | id, lecon_id, date, score, réponses, temps passé |
| `cours_fiche` | id, titre, type d'élément, hypothèses, unités, formules, données saisies, résultats, contrôles, limites, références, version de norme |
| `cours_question` | id, formateur (ACORD-Bat / SEMA / Cadwork / autre), lecon_id ou notion_id, question, contexte (capture/valeurs), priorité, **statut**, réponse, date |
| `cours_reference` | id, code (ex. « NF EN 1995-1-1 »), titre, version/date, statut (en vigueur / en révision / remplacée / retirée), date de dernière vérification, source |
| `cours_veille` | id, date, source, référence concernée, résumé, impact (aucun / mineur / majeur), leçons impactées, **statut** |

**Statuts :**
- Notion : `Non vue` → `En cours` → `À revoir` → `Acquise` → `Maîtrisée` (code couleur + icône, jamais
  la couleur seule).
- Niveau de maîtrise d'une leçon calculé : % de notions acquises/maîtrisées + dernier score de
  mini-évaluation (≥ 80 % requis pour « Acquise »).
- **Révision espacée** : une notion « Acquise » repasse automatiquement en « À revoir » après J+7,
  J+30, J+90 si aucune révision ; échec à une évaluation → « À revoir ».
- Question : `À poser` → `Posée` → `Répondue` → `Intégrée au cours`.
- Veille : `À analyser` → `Sans impact` / `À intégrer` → `Intégrée`.

## 3. STRUCTURE IMPOSÉE DE CHAQUE LEÇON

1. **Objectifs** mesurables (« à la fin, je sais… »).
2. **Prérequis** (liens vers les leçons concernées).
3. **Explication** progressive : intuition physique → modèle mécanique → formulation normative.
4. **Schémas SVG** : modèle statique, chargements, diagrammes N / V / M, déformée, détails constructifs.
5. **Exemple de dimensionnement complet** sur un cas réel de chantier, au format fiche (§ 5) :
   hypothèses → actions → combinaisons → sollicitations → vérifications ELU → vérifications ELS →
   conclusion, **avec les unités à chaque ligne** et l'**article de norme cité** à chaque vérification.
6. **Exercices corrigés** (3 minimum, difficulté croissante) avec corrigé détaillé masqué par défaut.
7. **Mini-évaluation** (5 à 10 questions : QCM, valeurs numériques avec tolérance, vrai/faux justifié,
   repérage d'erreur dans un calcul).
8. **Références normatives** : norme + article/paragraphe/tableau + version (liées à `cours_reference`).
9. **Erreurs fréquentes** et pièges de chantier (avec la conséquence concrète).
10. **Ordres de grandeur** pour contrôler un résultat d'un coup d'œil.
11. **Lien logiciels** : où retrouver ce calcul dans ACORD-Bat, SEMA et Cadwork, quelles hypothèses
    par défaut vérifier, comment comparer avec le calcul manuel.
12. **Niveau de maîtrise** + boutons de statut.

## 4. PARCOURS PROGRESSIF (16 modules)

> Référentiel de travail en France : **Eurocodes + Annexes nationales françaises (NF EN … /NA)** et
> **NF DTU**. Signaler systématiquement les évolutions liées aux **Eurocodes de 2e génération**
> (EN 1990:2023 et nouvelle EN 1995-1-1 notamment : CLT, renforcements, vibrations des planchers,
> assemblages) et la **période de coexistence** avec la 1re génération. Pour chaque leçon, indiquer
> clairement quelle génération est utilisée dans les calculs.

**M0 — Méthode et outils de l'ingénieur**
Unités SI et conversions (kN, kN/m, kN/m², N/mm² = MPa, daN), chiffres significatifs, ordres de
grandeur, démarche de note de calcul, lecture d'une norme (corps normatif, annexes informatives,
Annexe nationale, paramètres déterminés au niveau national), hiérarchie des textes (Eurocodes, NF DTU,
Règles professionnelles, Avis techniques / DTA, ATEx, recommandations RAGE/PACTE, CPT).

**M1 — Statique : principe fondamental**
Forces, moments, couples, PFS dans le plan, liaisons (appui simple, articulation, encastrement),
réactions, isostatisme / hyperstatisme, méthode des nœuds, Ritter, Crémona, efforts dans les treillis,
diagrammes N, V, M, poutres continues (théorème des trois moments, notions), principe de superposition.

**M2 — Le matériau bois et ses dérivés**
Anatomie, anisotropie, humidité et retrait, fluage, durée de charge. Classement visuel et mécanique
(NF B 52-001, EN 14081), classes de résistance (EN 338 : C / D / T ; EN 14080 : GL), BMR, BLC, LVL,
CLT, panneaux (OSB EN 300, contreplaqué). Classes de service (EN 1995-1-1), classes d'emploi
(EN 335) et durabilité (EN 350, FD P 20-651), traitements.

**M3 — Résistance des matériaux appliquée**
Caractéristiques de section (A, I, W, i), contraintes normales et tangentielles, flexion simple et
déviée, traction/compression axiale, compression transversale, cisaillement, torsion (notions),
flambement (élancement, longueur de flambement), déversement, flèches (formulaire de cas courants),
sollicitations composées, compression oblique (Hankinson).

**M4 — Bases de calcul Eurocodes (EN 1990 + EN 1995-1-1)**
États limites ELU/ELS, valeurs caractéristiques et de calcul, coefficients γG, γQ, ψ0, ψ1, ψ2,
combinaisons fondamentales, accidentelles, caractéristiques, quasi-permanentes, classes de durée de
charge, kmod, γM, kdef, kh, kcr, ksys, flèches instantanées / finales / nettes et limites de l'AN.

**M5 — Actions sur les structures**
Charges permanentes (poids propres des matériaux), exploitation (EN 1991-1-1 + AN), **neige**
(EN 1991-1-3 + AN : régions, altitude, coefficients de forme, accumulations, neige exceptionnelle),
**vent** (EN 1991-1-4 + AN : vb,0, rugosité, orographie, Cpe/Cpi, soulèvement), **séisme**
(zonage réglementaire, EN 1998-1, catégories d'importance, notions de classe de ductilité bois).

**M6 — Descente de charges**
Cheminement des charges toiture → murs → planchers → fondations, surfaces d'influence, charges
linéiques et ponctuelles, tableau de descente de charges, combinaisons par niveau, cas des reports
sur linteaux et poteaux, contrôle croisé avec le logiciel.

**M7 — Chevrons et pannes**
Pannes simples, continues, en porte-à-faux, Gerber ; flexion déviée en toiture inclinée, échantignoles,
liernage, déversement, flèches, appuis (compression transversale), chevrons et contre-chevrons.

**M8 — Fermes et charpentes**
Fermes traditionnelles (entrait, arbalétriers, poinçon, contrefiches), fermettes industrialisées
(**NF DTU 31.3**, connecteurs métalliques), charpente traditionnelle (**NF DTU 31.1**), portiques,
lamellé-collé, contreventement de toiture, stabilité au flambement hors plan, levage et stockage.

**M9 — Planchers bois**
Solivage, chevêtres et trémies, poutres en I, vérification ELU/ELS, **vibrations** (EN 1995-1-1 §7.3
et évolutions 2e génération), diaphragmes, **NF DTU 51.3** (planchers bois et panneaux dérivés),
appuis sur murs, acoustique et feu (notions).

**M10 — Toitures et couvertures**
Pentes minimales, recouvrements et zones climatiques (série **NF DTU 40.x** : tuiles, ardoises,
bacs acier…), écrans de sous-toiture, ventilation, éléments porteurs bois de toitures-terrasses
(**NF DTU 43.4**), charges de couverture, fixations et soulèvement au vent.

**M11 — Murs à ossature bois**
**NF DTU 31.2** : montants (compression + flambement + flexion due au vent), lisses, linteaux,
voiles travaillants et contreventement par panneaux, ancrages et soulèvement, pare-pluie, frein-vapeur,
gestion de l'humidité, bardages (**NF DTU 41.2**), façades à ossature bois rapportées (**NF DTU 31.4**).

**M12 — Assemblages**
Tiges métalliques (EN 1995-1-1 ch. 8) : théorie de Johansen, pointes, agrafes, vis, boulons, broches,
pinces et espacements, nef, rupture de bloc, effet de corde, assemblages acier-bois, connecteurs
(anneaux, crampons), équerres et sabots (ETE/Évaluations techniques européennes), assemblages
traditionnels (embrèvement, tenon-mortaise, mi-bois), assemblages collés (notions).

**M13 — Stabilité globale et contreventement**
Cheminement des efforts horizontaux, diaphragmes de toiture et de plancher, poutres au vent, palées
de stabilité, imperfections et efforts de stabilisation (EN 1995-1-1 §9.2.5), ancrages, robustesse,
vérification du bâtiment complet.

**M14 — Feu, durabilité et pathologies**
EN 1995-1-2 (vitesse de carbonisation, section efficace), réglementation incendie (notions, façades),
conception durable (pièges à eau, ventilation), sinistralité et pathologies (fiches AQC), réception
et contrôle sur chantier.

**M15 — Projet de synthèse**
Une maison à ossature bois R+1 avec charpente traditionnelle + un bâtiment agricole/hangar en
fermes : note de calcul complète faite à la main, puis comparaison point par point avec ACORD-Bat,
SEMA et Cadwork (écarts, origine des écarts, hypothèses divergentes).

## 5. FICHES DE CALCUL RÉUTILISABLES

Gabarit standard, imprimable et dupliquable, avec calcul interactif (saisie des données →
résultats recalculés) :

1. **Identification** : élément, projet, date, version de la norme utilisée.
2. **Hypothèses** : modèle statique, classe de service, classe de résistance, durée de charge, région
   neige/vent, altitude, catégorie d'usage.
3. **Unités** : tableau des grandeurs et unités utilisées.
4. **Formules** : avec renvoi article/équation de la norme.
5. **Calcul** : pas à pas, valeurs intermédiaires affichées.
6. **Résultats** : taux de travail (%) par vérification, code couleur (≤ 100 % OK).
7. **Contrôles** : ordre de grandeur, cohérence d'unités, comparaison logiciel.
8. **Limites** : domaine de validité de la fiche, ce qu'elle ne vérifie pas.

Fiches minimales : descente de charges, panne (flexion déviée), chevron, solive (dont vibrations),
montant MOB (flambement + vent), poteau, linteau, entrait / arbalétrier, assemblage par pointes,
assemblage par boulons/broches, combinaisons d'actions, neige, vent (pression de pointe).

⚠️ Chaque fiche affiche en pied : « Outil pédagogique — ne remplace pas une note de calcul signée ni
la vérification par un bureau d'études ».

## 6. TABLEAU DE BORD ET JOURNAL DE QUESTIONS

**Tableau de bord** (page d'accueil du module) :
- Progression globale et par module (barres + %).
- Trois colonnes : **Acquises / À revoir / Non maîtrisées**, filtrables par module.
- « À réviser aujourd'hui » (révision espacée) + « Reprendre là où je me suis arrêté ».
- Historique des scores aux mini-évaluations, temps d'étude par semaine.
- Questions en attente par formateur, alertes de veille non traitées.

**Journal de questions aux formateurs** :
- Onglets **ACORD-Bat / SEMA / Cadwork / Autre**.
- Création rapide depuis une leçon (la question est liée automatiquement à la notion).
- Champ « contexte » (valeurs, paramètres du logiciel, capture), priorité, statut, réponse.
- Vue « préparer ma prochaine session de formation » : export de la liste des questions « À poser »
  d'un formateur (impression / PDF / copie texte).

## 7. VEILLE NORMATIVE ET TECHNIQUE MENSUELLE

### 7.1 Objectif
Garder le cours à jour : savoir chaque mois si une norme, un DTU, une Annexe nationale, une règle
professionnelle ou un logiciel a évolué, et **quelles leçons sont impactées**.

### 7.2 Registre des références
Chaque référence (`cours_reference`) affiche sa version, son statut et sa **date de dernière
vérification**. Une référence non vérifiée depuis plus de 30 jours est signalée.
À surveiller au minimum :
- Eurocodes : NF EN 1990, NF EN 1991-1-1, -1-3, -1-4, NF EN 1995-1-1, -1-2, NF EN 1998-1 et leurs
  Annexes nationales ; **calendrier de transposition des Eurocodes 2e génération** et date de retrait
  de la 1re génération.
- NF DTU 31.1, 31.2, 31.3, 31.4, 51.3, 41.2, 43.4, série 40.x.
- Normes produits : EN 338, EN 14080, EN 14081, NF B 52-001, EN 335, EN 350, FD P 20-651, EN 16351 (CLT).
- Règles professionnelles, recommandations RAGE/PACTE, Avis techniques / DTA (structures bois,
  systèmes constructifs), fiches pathologie AQC.
- Réglementation : RE2020 (jalons), sécurité incendie, zonage sismique.
- Mises à jour / notes de version d'**ACORD-Bat, SEMA, Cadwork** (nouvelles normes intégrées).

### 7.3 Rituel mensuel (fonctionne sans aucune intégration)
- Le 1er de chaque mois, badge « Veille à faire » sur le module.
- Checklist guidée des sources à consulter (liens cliquables) : AFNOR / boutique et « Normes en
  ligne », CSTB (DTU, Avis techniques, Évaluations), enquêtes publiques AFNOR, CEN/TC 250/SC 5,
  FCBA, CODIFAB, Qualité Construction / AQC, Programme PACTE, Légifrance, éditeurs des logiciels.
- Saisie rapide d'une entrée de veille (source, résumé, impact, leçons impactées).
- Une entrée « À intégrer » crée une tâche sur les leçons concernées et un **bandeau
  « Évolution normative »** dans ces leçons jusqu'à intégration.
- Historique des veilles mois par mois (« rien de nouveau » est aussi une entrée tracée).

### 7.4 Option : veille assistée automatique
Si l'application dispose d'un mécanisme de tâches planifiées (cron, fonction planifiée, worker),
proposer — **désactivé par défaut** — une tâche mensuelle qui interroge des sources publiques
(flux RSS/pages d'actualité), compare avec le registre et crée des entrées « À analyser ». Aucune
modification automatique du contenu des cours : **toute évolution est validée par moi**.

## 8. EXIGENCES DE QUALITÉ DU CONTENU

- **Exactitude avant tout** : ne jamais inventer un numéro d'article, une valeur de coefficient ou
  une date de version. En cas de doute, l'écrire explicitement et créer une entrée de veille
  « À vérifier ».
- Distinguer clairement **valeur recommandée EN** et **valeur de l'Annexe nationale française**.
- Ne pas reproduire in extenso de texte normatif protégé (AFNOR) : paraphraser, citer l'article,
  reproduire uniquement les formules nécessaires.
- Exemples chiffrés réalistes (sections commerciales, portées courantes, régions françaises).
- Vocabulaire de métier (charpentier) + vocabulaire normatif, avec glossaire.
- Chaque calcul vérifié deux fois (cohérence d'unités, ordre de grandeur) avant publication.

## 9. CRITÈRES D'ACCEPTATION

- [ ] Module « Cours » accessible depuis la navigation CCM, cohérent avec le design existant.
- [ ] Fonctionne sur smartphone (≈ 375 px) et ordinateur sans scroll horizontal de page.
- [ ] Statut d'une notion modifiable en 1 tap et persistant.
- [ ] Les 16 modules existent ; les leçons livrées respectent les 12 rubriques du § 3.
- [ ] Au moins une fiche de calcul interactive testée par un cas de référence calculé à la main.
- [ ] Tableau de bord, journal de questions, veille mensuelle opérationnels.
- [ ] Export/import JSON de la progression.
- [ ] Tests unitaires sur les calculs (combinaisons, kmod, flambement, flèches, Johansen).

Commence par l'**Étape 0** : analyse du dépôt, puis plan à valider.
