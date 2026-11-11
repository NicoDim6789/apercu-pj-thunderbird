Crée dans l'application CCM un nouveau module « Cours » pour former les personnes du bureau à la charpente et à l'ossature bois.

AVANT DE CODER
- Lis le README/CLAUDE.md et la structure de CCM (stack, navigation, base de données, comptes utilisateurs, design). Intègre le module dans l'existant, sans nouvelle dépendance lourde sans me demander.
- Propose-moi un plan court (écrans, tables, lots) et attends mon accord.

UTILISATEURS
- Chaque personne du bureau se forme sous son nom : réutilise les comptes CCM s'ils existent, sinon un écran « Qui se forme ? » (choisir son nom / ajouter son nom / changer de profil).
- Commun à tous : les cours, les fiches modèles, la veille. Propre à chacun : statuts, scores, notes, fiches remplies. Partagé avec le nom de l'auteur : le journal de questions.
- Un rôle « référent » voit l'avancement de l'équipe et valide la veille. Données isolées par personne côté base.

PARCOURS (16 modules, du plus simple au plus avancé)
M0 Méthode, unités, lecture des normes · M1 Statique (PFS, liaisons, treillis, diagrammes N/V/M) · M2 Matériau bois (classes C/GL, humidité, classes de service et d'emploi) · M3 RdM (flexion, cisaillement, flambement, déversement, flèches) · M4 Bases Eurocodes (ELU/ELS, combinaisons, kmod, γM, kdef) · M5 Actions (exploitation, neige, vent, séisme) · M6 Descente de charges · M7 Chevrons et pannes · M8 Fermes et charpentes (NF DTU 31.1, 31.3) · M9 Planchers (NF DTU 51.3, vibrations) · M10 Toitures et couvertures (NF DTU série 40, 43.4) · M11 Murs à ossature bois (NF DTU 31.2, 31.4, 41.2) · M12 Assemblages (pointes, vis, boulons, broches, assemblages traditionnels) · M13 Stabilité globale et contreventement · M14 Feu, durabilité, pathologies · M15 Projet complet comparé à ACORD-Bat, SEMA et Cadwork.
Référentiel : Eurocodes avec Annexes nationales françaises + NF DTU. Signale les évolutions des Eurocodes de 2e génération (EN 1990:2023, nouvelle EN 1995-1-1).

CHAQUE LEÇON CONTIENT
Objectifs · explication · schémas SVG (efforts, cotes, diagrammes) · exemple de dimensionnement complet avec unités et article de norme cité · 3 exercices corrigés (corrigé masqué) · mini-évaluation · références normatives · erreurs fréquentes · ordres de grandeur · où retrouver ce calcul dans ACORD-Bat / SEMA / Cadwork · statut de maîtrise.

SUIVI
- Statuts modifiables en 1 tap : Non vue → En cours → À revoir → Acquise → Maîtrisée.
- Une notion acquise repasse « À revoir » après 7, 30 puis 90 jours sans révision ; « Acquise » seulement si ≥ 80 % à la mini-évaluation.
- Tableau de bord : progression par module, notions acquises / à revoir / non maîtrisées, « à réviser aujourd'hui », reprendre où j'en étais.

OUTILS
- Fiches de calcul interactives et imprimables : hypothèses, unités, formules, calcul, résultats (taux de travail %), contrôles, limites. Minimum : descente de charges, panne, chevron, solive, montant MOB, poteau, linteau, pointes, boulons, neige, vent. Mention « outil pédagogique, ne remplace pas une note de calcul ».
- Journal de questions aux formateurs ACORD-Bat / SEMA / Cadwork : statut (à poser / posée / répondue), bouton « moi aussi », export de la liste avant une session.
- Veille mensuelle : liste des normes et DTU suivis avec date de dernière vérification, rappel le 1er du mois, liens vers les sources (AFNOR, CSTB, FCBA, AQC, PACTE, Légifrance, éditeurs des logiciels), saisie d'une nouveauté avec les leçons impactées (bandeau « Évolution normative » jusqu'à mise à jour).

CONTRAINTES
- Mobile et ordinateur (pas de scroll horizontal, gros boutons), lecture hors-ligne si possible, recherche plein texte, export JSON de la progression.
- Contenu des cours dans des fichiers ou tables séparés du code, faciles à corriger.
- N'invente jamais un article, un coefficient ou une date de norme : en cas de doute, écris-le et crée une entrée de veille « À vérifier ». Distingue valeur européenne et valeur de l'Annexe nationale française. Ne recopie pas les textes AFNOR, cite-les.
- Tests unitaires sur les calculs.

LIVRAISON EN LOTS
1. Squelette, profils, tables, statuts, tableau de bord · 2. Modules 0 à 4 · 3. Modules 5 à 10 · 4. Modules 11 à 15 + fiches + journal de questions · 5. Veille + exports.
Commence par l'analyse du dépôt et le plan.
