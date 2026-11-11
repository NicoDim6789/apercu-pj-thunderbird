# Recréer le Container SEMA dans cadwork 2026

Vous n'êtes pas passé à côté d'un Container caché : cadwork 3D 2026 n'en possède pas d'équivalent natif. Aucune source officielle ne décrit de panneau ancré qui réunisse arborescence, vignettes et insertion rapide, et aucune note de version 2025 ou 2026 n'en annonce. cadwork répartit ces fonctions entre l'explorateur *Ajouter → Catalogue* (touche N, fichiers `.3dc`), les *Variantes* paramétriques, les axes de connexion avec favoris et les matériaux texturés. Ce Container peut en revanche être construit. L'API Python officielle de cadwork 2026 (paquet `cwapi3d` 33.x, Python 3.14, interface PyQt6) sait insérer catalogues, variantes, éléments standard et connecteurs, tailler mi-bois et tenons, affecter matériaux et attributs, puis sortir listes, plans pièce par pièce et BTLx. cadwork publie même un serveur MCP qui branche la documentation de cette API directement dans Claude Code. Le seul vrai verrou technique est l'**ancrage du panneau dans la fenêtre de cadwork** : l'API Python ne fournit aucune fonction de panneau ancré, et la seule voie démontrée passe par un plugin C++ Qt6. C'est très probablement celle qu'utilise Caddev pour le Steel Tools Center déjà ancré chez vous. Nous recommandons donc quatre choses : un cœur métier en Python dans un dépôt Git dédié (`ccm-tools-cadwork`), une première fenêtre flottante, un prototype court qui tranche la question de l'ancrage (Python, petit hôte C++ ou commande à Caddev/Cadwork04) avant tout gros investissement, et un contrôleur qualité en trois portes (modèle, fabrication, achats). Côté données, cadwork ne gère ni chiffrage ni bons de commande. La liaison avec CCM reposera donc sur les identifiants GUID persistants des éléments et sur un stockage clé/valeur privé, et la logique de prix et d'achat restera dans CCM. Le contrôleur qualité, lui, répond à un constat : cadwork vérifie nativement les collisions, les numéros de position et les plans obsolètes, mais pas vos règles métier. Deux réserves s'appliquent à tout ce rapport. Votre build 298 est probablement antérieur à plusieurs fonctions récentes de l'API, et les sites de cadwork n'ont pas pu être consultés directement pendant la recherche.

**Comment lire ce rapport.** Ce rapport synthétise cinq notes de recherche datées du 11 novembre 2026. Les sites de cadwork (kb.cadwork.ch, docs.cadwork.com, cadwork.ca, 04.cadwork.com) étaient bloqués par le réseau de la session de recherche. Ce qui en est rapporté vient donc d'extraits de moteur de recherche : relisez la page avant de reprendre un libellé de menu mot pour mot. En revanche, toutes les affirmations sur l'API ont été vérifiées dans le code source officiel que cadwork publie sur GitHub (dépôt `cwapi3d/cwapi3dpython`, version 33.397.17 du 11 novembre 2026). Ce code est la source même de la documentation docs.cadwork.com. Votre poste n'a pas pu être inspecté : le numéro « Version 2026 (298) » vient uniquement de votre capture d'écran. Trois étiquettes servent tout au long du texte. **Confirmé** désigne un fait tiré d'une source officielle ou primaire, avec son lien. **Déduit** désigne notre raisonnement, sans source directe. **À vérifier sur le poste** désigne un point à tester chez vous.

## 1. Aucun Container natif : cadwork répartit la fonction entre cinq outils

### Ce qui est confirmé

L'outil natif le plus proche du Container est l'explorateur **Ajouter → Catalogue**. En 2025, il a gagné un **champ de filtre** qui cherche les noms de fichiers dans le dossier courant et ses sous-dossiers, une info-bulle qui affiche le chemin complet, et l'**insertion en miroir** avec aperçu (touche S puis X) ([KB cadwork – Nouveautés Ajouter/Supprimer](https://kb.cadwork.ch/en/news/manual/1780/add-and-delete)). Il s'agit donc d'un explorateur de fichiers `.3dc` rangés en dossiers et ouvert depuis un menu, pas d'un panneau permanent. La poignée d'insertion se règle par « Configurer catalogue » (**Ctrl+Alt+A**). Les catalogues livrés par cadwork sont désormais installés dans un emplacement protégé en écriture, séparé des catalogues de l'entreprise, ce qui permet de les mettre à jour sans écraser les vôtres ([KB cadwork – Nouveautés Outils](https://kb.cadwork.ch/en/news/manual/1826)). Les extraits ne s'accordent pas sur la version qui a introduit ce changement. Un livret de formation plus ancien (V25) donne les raccourcis historiques : **N** pour un élément de catalogue, **Maj+N** pour une variante ([Livret Cecobois](https://cecobois.com/wp-content/uploads/2020/10/Livret-Formation-Cadwork-Cecobois.pdf)).

Pour la quincaillerie, cadwork utilise les **axes de connexion** (VBA). Depuis 2025, les connecteurs, les éléments de connecteur, les définitions de perçage et la base des axes peuvent être marqués en **favoris** (étoile). Un onglet Favoris les affiche dans leur arborescence ([KB cadwork – Nouveautés Axe de connexion](https://kb.cadwork.ch/en/news/manual/1788/vba)). Une vidéo 2026 montre le choix automatique de la vis à la longueur standard immédiatement inférieure ([YouTube – V2026 VBA](https://www.youtube.com/watch?v=_dltq4QeQIE)). Les fabricants fournissent aussi des bibliothèques :

- Simpson Strong-Tie France propose un catalogue 3D compatible cadwork ([Simpson.fr](https://www.simpson.fr/fr-FR/actualites/du-nouveau-cote-logiciels-de-dessin)).
- Rothoblaas cite cadwork parmi les logiciels de ses bibliothèques BIM/CAO ([Rothoblaas](https://www.rothoblaas.com/bimcad)).
- Knapp figure dans les catalogues 3D de cadwork ([cadwork – catalogues 3D](https://www.cadwork.com/indexL1.jsp?neid=12262)).
- La version 2025 a ajouté des éléments de catalogue Hilti HCW ([cadwork.swiss – Nouveautés 2025](https://cadwork.swiss/docs/neuerungen-version-2025/)).

Pour les objets paramétriques, le module **Variante** définit un élément une seule fois, avec des paramètres liés par des formules. **Une licence n'est nécessaire que pour créer des variantes, pas pour les utiliser** ([cadwork.ca – Module Variante](https://cadwork.ca/fr/modules/variante/)). Les textures sont portées par les **matériaux**. On peut les modifier élément par élément avec **Modifier → Texture/Transparence**, dont le bouton « Supprimer texture » rétablit la texture définie par le matériau ([KB cadwork FR – Nouveautés Modifier](https://kb.cadwork.ch/fr/news/manual/1783/modifier)).

cadwork sait par ailleurs ancrer des panneaux.

- Le **BIM Management Tool** est un outil natif. Il s'ouvre par le menu Fenêtre et sert de centre pour l'IFC, les bâtiments et les étages. Ce n'est pas une bibliothèque de composants, et il suppose le module BIM Manager ([KB cadwork – BMT](https://kb.cadwork.ch/en/3d-bim/manual/1036/bim-management-tool)).
- La version 2026 ajoute **Bridge**, un gestionnaire de plans d'atelier **ancré à gauche de la zone graphique**. Il vérifie que les plans exportés correspondent encore au modèle 3D et signale ceux qui sont devenus obsolètes ([KB cadwork – Nouveautés 2026, Général](https://kb.cadwork.ch/en/news/manual/1840/general)).
- Le **Steel Tools Center** visible sur votre écran est un module tiers. Cadwork04, distributeur de cadwork en France, le présente comme un outil « intégré à cadwork en tant que TOOL CENTER » ([Cadwork04 – brochure STC, février 2026](https://www.04.cadwork.com/wp-content/uploads/2026/02/cadwork-stc.pdf)).

L'éditeur du Steel Tools Center, **Caddev**, est une entité du groupe français Work4Cad, propriétaire de Cadwork04 ([W4C – Nos entités](https://www.w4c.group/en/nos-entites)). D'après un responsable de Cadwork04, Caddev développe toute la famille des Tool Centers, présentée en démonstration à Batimat 2026 ([LinkedIn – N. Quidet, Cadwork04](https://www.linkedin.com/in/nicolas-quidet-cadwork04-work4cad/)) :

- JTC, pour la menuiserie ;
- STC, pour le métal et la tôlerie ;
- CTC, pour les liaisons bois-métal ;
- OTC, pour les ouvertures.

Caddev édite aussi **C-CONNECT**, qui crée, gère et automatise les axes de connexion bois-bois et bois-métal. Le métal-métal est la nouveauté 2026 ([Eurobois – C-CONNECT](https://www.eurobois-events.com/fr/offering/38926eae-fcfc-f011-832e-6045bd95454f/c-connect-plugin-cadwork)). Aucune recherche n'a trouvé de panneau bibliothèque natif avec vignettes, ni de retour d'expérience public en français sur le remplacement du Container SEMA. Ce constat couvre les notes de version, les forums et les vidéos.

### Correspondance SEMA → cadwork 2026

| Fonction du Container SEMA | Équivalent natif cadwork 2026 le plus proche | Ce qui manque | Statut |
|---|---|---|---|
| Données souches Conteneur (arbre d'objets 3D, connecteurs métalliques) | *Ajouter → Catalogue* (N) sur les catalogues `.3dc` livrés et entreprise ; catalogues fabricants Simpson, Rothoblaas, Knapp, Hilti | Panneau permanent, vignettes dans la liste (non confirmées), glisser-déposer | Fonctions : confirmé. Manques : déduit |
| Raccords / types d'extrémité (mi-bois, tenon, queue d'aronde) | Commandes d'usinage et types d'extrémité ; « bibliothèque d'assemblages pré-paramétrés » citée par Cadwork04 ([brochure 2023](https://www.04.cadwork.com/wp-content/uploads/2024/09/Brochure-2023-B-light.pdf)) | Navigateur visuel des assemblages | Confirmé / déduit |
| Mes assemblages | Catalogues utilisateur `.3dc`, Variantes (Maj+N), favoris d'axes de connexion | Classement unique, recherche, vignettes | Confirmé / déduit |
| Sabots SAE/SAI, Simpson, Hilti, Rothoblaas, Knapp | Axes de connexion avec favoris ; catalogues fabricants ; C-CONNECT (Caddev, payant) | Pose en un clic sur une jonction | Confirmé |
| Textures bois | Matériaux texturés et *Modifier → Texture/Transparence* ; bases tierces comme mtextur ([mtextur](https://www.mtextur.com/posts?locale=en)) | Galerie visuelle de textures | Confirmé / déduit |
| Centre de contrôle | Pas d'équivalent direct. Le contrôle de collision natif et le BMT (arbre du modèle) s'en approchent | Tableau de bord de contrôle | Déduit |
| Gestionnaire de chargement | Pas d'équivalent direct trouvé. S'il s'agit du chargement des camions, le module **Opticargo** y répond ([Cadwork04 – Opticargo](https://04.cadwork.com/opticargo)) | Dépend du rôle exact de cet onglet chez SEMA | Déduit |
| Barre latérale ancrée | BMT et Bridge (natifs), STC (tiers) : l'ancrage existe | Aucune API d'ancrage documentée pour les plugins | Confirmé / déduit |
| Accès rapide | Touches F configurables, barre de plugins (*Fenêtre → Plugins*), boutons 3Dconnexion ([KB – Installation 2026](https://kb.cadwork.ch/en/installation/manual/1786/installation-procedure-v2026)) | Raccourci clavier direct vers un script | Confirmé |

### Ce que nous en déduisons

*Ajouter → Catalogue* reste l'équivalent le plus proche, mais il fonctionne autrement : on choisit un fichier dans une boîte de dialogue, puis on clique un point dans le modèle. Aucune source ne documente de glisser-déposer depuis un panneau. Sans aucun développement, vous pouvez déjà tirer davantage de l'existant. Il suffit de ranger les `.3dc` de l'entreprise dans une arborescence qui reprend celle de SEMA, de marquer les connecteurs courants en favoris et d'affecter les fonctions fréquentes aux touches F. C'est un socle utile dès la première semaine, mais il n'apporte ni navigation visuelle, ni recherche transversale, ni lien avec CCM. Le Steel Tools Center prouve qu'un éditeur tiers sait ancrer un onglet à côté du BMT. Personne ne documente publiquement comment il le fait.

## 2. L'API 2026 sait tout insérer ; seul l'ancrage reste à prouver

### Ce qui est confirmé : l'API couvre chaque type d'objet du Container

Le paquet Python `cwapi3d` suit le numéro de version de cadwork : « la version majeure suit la version de cadwork 3D (33 = cadwork v2026) » ([notes de version cwapi3d](https://github.com/cwapi3d/cwapi3dpython/blob/main/docs/release_notes.md)). La dernière version, **33.397.17, a été publiée le 11 novembre 2026** et exige Python 3.14 ([PyPI cwapi3d](https://pypi.org/pypi/cwapi3d/json)). cadwork 2026 embarque en effet l'interpréteur **Python 3.14**, a **complètement abandonné Lua** et oblige les scripts à passer de PyQt5 à **PyQt6** ([KB cadwork – Plugins 2026](https://kb.cadwork.ch/en/news/manual/1877/plugins)). La page officielle « Getting Started » mentionne encore CPython 3.9.10 : elle n'est plus à jour ([get_started.md](https://github.com/cwapi3d/cwapi3dpython/blob/main/docs/get_started.md)). L'API compte **19 modules et environ 1 100 fonctions** ([sources cwapi3d](https://github.com/cwapi3d/cwapi3dpython/tree/main/src)). Le tableau ci-dessous associe chaque besoin du Container à ses fonctions.

| Besoin du Container | Fonctions de l'API | Remarque |
|---|---|---|
| Insérer un assemblage ou un objet enregistré | `file_controller.import_3dc_file_with_options` | **Ne crée pas d'étape d'annulation** : l'add-on doit appeler `add_created_elements_to_undo` |
| Insérer un objet paramétrique | `file_controller.import_variant_file` (fichier `.val`) | Construit la variante et renvoie les éléments créés |
| Insérer un élément standard (section, panneau, acier) | `create_standard_element_from_guid_points`, `get_standard_element_guid_from_name` (ajoutée en 33.392) | « Les dossiers de la bibliothèque ne sont pas gérés par l'API » |
| Ajouter la sélection à « Mes assemblages » | `export_3dc_file`, `export_as_standard_element` | Équivalent d'un bouton « Enregistrer dans la bibliothèque » (assemblage : déduit) |
| Poser un connecteur | `connector_axis_controller.create_standard_connector`, `get_standard_connector_list`, `import_from_file` | Références de commande lisibles via `get_axis_item_order_number` |
| Tailler un assemblage | `cut_half_lap` (mi-bois), `cut_double_tenon`, `cut_corner_lap`, `cut_t_lap`, `cut_cross_lap`, `cut_scarf_*` (entures), `cut_*_shoulder` (embrèvements) | Les pièces partenaires sont détectées automatiquement |
| Tenons, queues d'aronde | `endtype_controller` (types d'extrémité, `get_existing_dovetail_ids`) | — |
| Matériaux et textures | `create_material`, `set_price`, `set_texture_*` ; `visualization_controller.set_material` | **Aucune fonction pour définir l'image de texture** |
| Attributs et identifiants | `set_name`, `set_user_attribute` (1 à 999), `set_sku`, `set_additional_data`, `set_additional_guid` | `set_name` applique les réglages enregistrés pour ce nom |
| Vignettes | `utility_controller.export_screen_to_image` | Génération automatique non testée |
| Interaction | `get_user_point(s)`, `get_user_edge` (33.397), `menu_controller.display_simple_menu`, barre de progression | — |

Sources : fichiers de définition officiels de [file_controller](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/file_controller/__init__.pyi), [element_controller](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/element_controller/__init__.pyi), [connector_axis_controller](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/connector_axis_controller/__init__.pyi), [endtype_controller](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/endtype_controller/__init__.pyi), [material_controller](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/material_controller/__init__.pyi), [attribute_controller](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/attribute_controller/__init__.pyi) et [utility_controller](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/utility_controller/__init__.pyi).

### Ce qui est confirmé : les limites qui structurent l'architecture

**Aucune des quelque 1 100 fonctions Python ne crée de panneau ancré.** Côté fenêtres, l'API se limite à trois fonctions ([utility_controller](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/utility_controller/__init__.pyi)) :

- `get_3d_hwnd()`, qui renvoie le descripteur de la fenêtre principale, « utile pour rattacher vos propres fenêtres à cadwork » ;
- `get_3d_main_window_geometry()`, qui donne la position et la taille de cette fenêtre ;
- `get_3d_gui_upper_left_screen_coordinates()`.

**Un script ne peut pas être lié à un raccourci clavier.** Un mainteneur de l'API l'a confirmé en janvier 2026 ([discussion #306](https://github.com/cwapi3d/cwapi3dpython/discussions/306)). La communauté utilise des contournements : une touche F réglée sur « Programme externe », AutoHotkey, ou des raccourcis propres à la fenêtre du plugin, actifs seulement quand elle a le focus ([discussion #146](https://github.com/cwapi3d/cwapi3dpython/discussions/146)).

**Python ne peut pas encore s'abonner aux événements de cadwork.** La version 33.378 du 7 octobre 2026 a ajouté une énumération `event_type` (`on_geometry`, `on_attribute`, etc.), mais aucune fonction Python ne permet de s'y abonner. En C++, la méthode `getEventSubscriptionController()` existe, mais son en-tête n'est pas publié ([event_type.pyi](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/cadwork/event_type.pyi) ; [ICwAPI3DControllerFactory.h](https://github.com/cwapi3d/cwapi3dcpp/blob/main/include/cwapi3d/ICwAPI3DControllerFactory.h)).

**Deux incidents récents concernent directement votre projet.** Le premier est un bogue ouvert le 9 novembre 2026 : lancé depuis la barre de plugins, un plugin de plusieurs fichiers ne voit pas son propre dossier, ce qui oblige à ajouter `sys.path.insert(...)` en tête de script ([issue #432](https://github.com/cwapi3d/cwapi3dpython/issues/432)). Le second est un conflit de versions Qt. cadwork charge Qt 6.8.3 alors que le PyQt6 livré embarque Qt 6.8.2, ce qui provoque l'erreur « Cannot mix incompatible Qt library ». Le problème a été signalé en mars et reproduit le 30 octobre 2026, sans solution à ce jour. Dans le même fil, un mainteneur recommande PyQt plutôt que PySide6, qui avait provoqué des plantages ([discussion #291](https://github.com/cwapi3d/cwapi3dpython/discussions/291)).

**Le C++ est l'autre voie officielle.** L'API C++ (`cwapi3dcpp`, licence MIT) produit un plugin sous forme de DLL qui exporte `plugin_x64_init` ([getting_started_cpp.rst](https://github.com/cwapi3d/cwapi3dcpp/blob/main/docs/getting_started_cpp.rst)). Le plugin officiel **BorderLine**, écrit en C++23 et Qt6, montre le geste clé : il récupère la fenêtre principale de cadwork par `QWidget::find(get3DHWND())`, puis y rattache sa propre fenêtre Qt ([BorderLine – bootstrap.cc](https://github.com/cwapi3d/BorderLine/blob/main/src/App/bootstrap.cc)). Ce dépôt est sous licence AGPL : il faut s'inspirer du principe, pas copier le code.

**La voie .NET n'est pas viable.** Le modèle C# reste bloqué sur l'API 30.x, sans version 32 ni 33 ([Cadwork.Templates](https://github.com/cwapi3d/Cadwork.Templates) ; [NuGet Cadwork.Api](https://www.nuget.org/packages/Cadwork.Api)).

### Ce que nous en déduisons : pourquoi l'ancrage est le vrai risque

Pour qu'un panneau s'ancre comme un onglet, à la manière du BMT ou du STC, il doit vivre dans la même « application Qt » que cadwork. Un plugin C++ compilé avec la même version de Qt partage cette application. L'ajout d'un onglet (`addDockWidget` sur la fenêtre principale) est alors la suite logique de ce que fait BorderLine, même si personne ne le documente. Une fenêtre PyQt6, elle, peut tourner sur sa propre copie de Qt, comme le montre le conflit 6.8.2/6.8.3, et dans ce cas l'ancrage échoue. Le tableau suivant compare les quatre options possibles.

| Option | Principe | Avantages | Risques | Verdict |
|---|---|---|---|---|
| **A. Fenêtre flottante PyQt6** | Le plugin Python ouvre une fenêtre toujours au premier plan, calée sur le bord gauche grâce à `get_3d_main_window_geometry` | Tout en Python, rapide à écrire avec Claude Code ; mêmes outils que les plugins livrés par cadwork | Ce n'est pas un vrai onglet ; conflit Qt à tester | **Point de départ recommandé** |
| **B. Ancrage depuis Python** | `QWidget.find(get_3d_hwnd())` puis `addDockWidget` | Vrai onglet, si cela fonctionne | Copie séparée de Qt, plantage « Cannot mix » | À tester dans le prototype, sans compter dessus |
| **C. Petit hôte C++ Qt6 + cœur Python** | Une DLL C++ compilée avec Qt 6.8 crée l'onglet et délègue les actions au code Python | Voie démontrée (BorderLine) ; même rendu que STC et BMT | Chaîne Visual Studio et Qt à maintenir à chaque version majeure ; ajout d'onglet non documenté | **Cible si l'ancrage est indispensable** |
| **D. Commande à Caddev/Cadwork04** | Un Tool Center « bibliothèque CCM » | Ancrage déjà maîtrisé, support, suivi des versions | Prix non public, dépendance, moindre maîtrise de la liaison CCM | À chiffrer en parallèle |

Une remarque d'usage relativise l'enjeu. Une fenêtre flottante bien placée, qui garde sa position d'une session à l'autre, offre l'essentiel de la rapidité de SEMA. L'ancrage améliore le confort ; il ne conditionne pas le gain de temps. C'est pourquoi le cœur métier doit rester indépendant de l'affichage (section 4).

### Votre build 298 face à l'API 33.397

**Confirmé.** L'en-tête C++ officiel déclare `versionMajor = 2026` et `versionMinor = 397`, avec le commentaire « matching the build number +1 manually for now », c'est-à-dire « aligné à la main sur le numéro de build + 1 pour l'instant » ([CwAPI3DVersion.h](https://github.com/cwapi3d/cwapi3dcpp/blob/main/include/cwapi3d/CwAPI3DVersion.h)). L'historique PyPI donne les jalons suivants ([PyPI JSON](https://pypi.org/pypi/cwapi3d/json)) :

- version 33.264.1 le 7 mai 2026 ;
- version 33.343.2 le 24 août 2026 ;
- version 33.378.0 le 7 octobre 2026.

cadwork.de recommande de passer la mise à jour Live Update **idéalement une fois par semaine**. Le numéro de build s'affiche sur l'écran de démarrage ([cadwork.de – Version 2026](https://cadwork.de/en/knowledgebase/cadwork-version-2026/)).

**Déduit, non confirmé par cadwork.** Si le numéro mineur de l'API suit bien le numéro de build, votre build 298 se situe entre mai et fin août 2026. Il lui manquerait alors plusieurs fonctions ajoutées depuis :

- `get_connector_axis_guid_by_name` (33.343) ;
- l'énumération `event_type` et `get_element_collision_type` (33.378) ;
- `export_file_with_options` (33.383) ;
- `get_wall_sections` (33.384) ;
- `get_standard_element_guid_from_name` (33.392) ;
- `get_user_edge` (33.397).

**À vérifier sur le poste.** Le numéro réel s'obtient avec `utility_controller.get_3d_build()`, ou en lançant Live Update. Le code de l'add-on doit de toute façon tester la présence de chaque fonction récente (`hasattr`) et noter la version de cadwork dans ses journaux.

## 3. Python 3.14, PyQt6, Git et Claude Code forment la boîte à outils

### La pile recommandée

| Brique | Choix recommandé | Pourquoi | Statut |
|---|---|---|---|
| Langage métier | Python 3.14, l'interpréteur embarqué dans cadwork | Langage principal des plugins 2026 ([KB Plugins 2026](https://kb.cadwork.ch/en/news/manual/1877/plugins)) | Confirmé |
| Interface | PyQt6, déjà livré avec cadwork ; tkinter en secours ([exemple officiel](https://github.com/cwapi3d/cwapi3dpython/blob/main/docs/examples/tk_gui.md)) | Recommandé par un mainteneur ; PySide6 a provoqué des plantages ([#291](https://github.com/cwapi3d/cwapi3dpython/discussions/291)) | Confirmé |
| Ancrage éventuel | C++23, Qt 6.8, CMake, Visual Studio 2022 | Seule voie démontrée ([BorderLine](https://github.com/cwapi3d/BorderLine/blob/main/src/App/bootstrap.cc)) | Principe : confirmé. Chaîne d'outils exacte : déduit |
| Autocomplétion | `pip install cwapi3d==33.x` dans un environnement Python 3.14 | Définitions typées et documentées ([get_started.md](https://github.com/cwapi3d/cwapi3dpython/blob/main/docs/get_started.md)) | Confirmé |
| Assistance IA | Claude Code + serveur MCP officiel : `claude mcp add --transport http cadwork-pyapi https://pyapi.mcp.cadwork.dev/mcp` | Réponses fondées sur la documentation de l'API ([mcp.md](https://github.com/cwapi3d/cwapi3dpython/blob/main/docs/mcp.md)) ; également indexée sur [Context7](https://context7.com/cwapi3d/cwapi3dpython) | Confirmé |
| Lancement en développement | `ci_start.exe … /RUNPROGRAM="D:\…\plugin.py"` ; console via « User Test » | Tester sans copier dans `API.x64` ([command_line.md](https://github.com/cwapi3d/cwapi3dpython/blob/main/docs/command_line.md) ; [debug.md](https://github.com/cwapi3d/cwapi3dpython/blob/main/docs/debug.md)) | Confirmé |
| Débogage | PyCharm (`pydevd_pycharm.settrace`) ; VS Code non documenté | Seule méthode de débogage à distance documentée | Confirmé / déduit |
| Rechargement à chaud | [D2P-ReloadCadworkPythonModules](https://github.com/design-to-production/D2P-ReloadCadworkPythonModules) | Sinon, les modules modifiés ne sont pris en compte qu'après redémarrage de cadwork | Confirmé |
| Tests hors cadwork | Tous les appels à cadwork passent par un adaptateur unique, remplaçable par un faux cadwork en mémoire, sur le modèle de [pycadwork](https://github.com/Brunner246/pycadwork) (630 tests) | Claude Code peut tester la logique sans cadwork | Confirmé (modèle) |
| Dépendances | requests et openpyxl copiés dans le dossier du plugin (`pip install --target`, paquets précompilés pour Python 3.14 64 bits) | cadwork n'a ni `python.exe` ni pip ([installation pycadwork](https://github.com/Brunner246/pycadwork/blob/main/docs/installation.md)) ; pandas/numpy sont délicats ([#325](https://github.com/cwapi3d/cwapi3dpython/discussions/325)) | Confirmé |
| Base CCM | Appels HTTPS directs à l'API REST de Supabase (PostgREST) ou à des Edge Functions | Évite les dépendances compilées de supabase-py | Déduit |
| Versionnement | Git ; dossier du dépôt relié à `API.x64` par jonction `mklink /J` | Synchronisation simple entre postes ([installation pycadwork](https://github.com/Brunner246/pycadwork/blob/main/docs/installation.md)) | Technique : confirmé. Organisation : déduit |

Le format d'un plugin est simple et documenté ([get_started.md](https://github.com/cwapi3d/cwapi3dpython/blob/main/docs/get_started.md)). Chaque plugin occupe un dossier sous `userprofil\3d\API.x64`. Ce dossier contient un fichier `.py` du même nom, une icône `Icon.svg` ou `Icon.png` (environ 30×30 px) et un fichier `plugin_info.xml` qui porte la version, l'auteur et une description en français affichée en info-bulle. Le plugin peut démarrer avec cadwork grâce à `enable_autostart`, et la ligne de commande accepte `/PLUGIN=`, `/RUNPROGRAM=` et `/NO-GUI` pour les traitements sans interface ([utility_controller](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/utility_controller/__init__.pyi) ; [command_line.md](https://github.com/cwapi3d/cwapi3dpython/blob/main/docs/command_line.md)).

Deux projets communautaires méritent votre attention. [cadwork_listener](https://github.com/Brunner246/cadwork_listener) reçoit des scripts sur le port local 127.0.0.1:9999 et les exécute dans la session cadwork ouverte : on peut ainsi tester un script envoyé depuis VS Code sans cliquer. [open-mcp-cad](https://github.com/sebastiankoukoui/open-mcp-cad) relie un assistant IA à un cadwork en cours d'exécution, avec file d'attente de tâches, cartes d'approbation et annulation. Il a été testé sur 2025 et 2026, mais il ne contient volontairement aucune logique de construction. Pour les licences, deux points sont confirmés. L'API apparaît comme un module chez cadwork Amérique du Nord ([cadwork.ca – API](https://cadwork.ca/en/modules/api/)). Certaines fonctions sont en outre bridées par les licences : les exports de listes « ne font rien sans la licence Liste », et l'export BTL ne produit rien sans la licence de la version concernée ([list_controller](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/list_controller/__init__.pyi) ; [machine_controller](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/machine_controller/__init__.pyi)). Il faut demander à Cadwork04 si l'usage de l'API est payant en France.

Nous déconseillons quatre voies. Lua ne fonctionne plus depuis 2026. PyQt5 non plus. La voie .NET est bloquée sur l'API 30. Quant aux bibliothèques scientifiques lourdes (pandas, numpy), elles sont difficiles à charger dans l'interpréteur embarqué.

### Ce qui a bougé entre le 11 octobre et le 11 novembre 2026

Ce volet n'a été couvert qu'en partie. Les pages d'actualité officielles (kb.cadwork.ch, cadwork.ca, 04.cadwork.com) étaient inaccessibles, et la recherche web n'a trouvé **aucune annonce cadwork datée de cette période** : ni feuille de route 2027, ni fonction d'IA, ni service pack documenté. Une page de téléchargement des bêtas existe chez cadwork Amérique du Nord, mais elle n'a pas pu être lue ([cadwork.ca – Beta downloads](https://cadwork.ca/en/support/beta-downloads/)). Le développement de l'API, en revanche, est très visible sur GitHub et PyPI, avec presque une publication par semaine.

| Date (2026) | Fait | Intérêt pour CCM | Source |
|---|---|---|---|
| 28 sept. – 1er oct. (juste avant la période) | Batimat : démonstration des Tool Centers JTC, STC, CTC et OTC sur le stand Cadwork04 | Caddev investit dans des modules métier ancrés | [Cadwork04 – Batimat](https://www.04.cadwork.com/salons/batimat/) |
| 7 oct. (juste avant la période) | API 33.378 : énumération `event_type`, `get_element_collision_type`, `get_additional_data_keys` | Classement des collisions pour le contrôle qualité ; les événements arrivent | [Notes de version](https://github.com/cwapi3d/cwapi3dpython/blob/main/docs/release_notes.md) |
| 13 oct. | 33.382 : correction de `set_texture_transparency` ; 33.383 : `export_file_with_options` (STEP/SAT/IGES avec niveau de détail) | Textures ; exports 3D | [Notes de version](https://github.com/cwapi3d/cwapi3dpython/blob/main/docs/release_notes.md) |
| 20 oct. | 33.384 : `get_wall_sections`, `get_export_solid_cuts`, splines ; discussion #422 sur la stabilité des GUID (sans réponse) | Plans de murs ; fiabilité de la synchronisation | [Notes de version](https://github.com/cwapi3d/cwapi3dpython/blob/main/docs/release_notes.md) ; [Discussions](https://github.com/cwapi3d/cwapi3dpython/discussions) |
| 27–29 oct. | 33.392 : `get_standard_element_guid_from_name` et son inverse ; 33.394 : documentation des limites de noms et de dossiers | Insertion d'éléments standard par nom | [Notes de version](https://github.com/cwapi3d/cwapi3dpython/blob/main/docs/release_notes.md) |
| 30 oct. | Conflit Qt 6.8.2/6.8.3 reproduit en 2026, toujours ouvert | Risque direct pour une interface PyQt6 | [#291](https://github.com/cwapi3d/cwapi3dpython/discussions/291) |
| 4–5 nov. | 33.396 : couleur et type de fond ; 33.397 : `get_user_edge` (choisir une arête à la souris) | Générateurs de solivage | [Notes de version](https://github.com/cwapi3d/cwapi3dpython/blob/main/docs/release_notes.md) |
| 5 nov. | Mise à jour d'open-mcp-cad (pont IA vers cadwork 2025/2026) | Référence pour un futur assistant | [open-mcp-cad](https://github.com/sebastiankoukoui/open-mcp-cad) |
| 9 nov. | Issue #432 : dossier du plugin absent de `sys.path` | Contournement à prévoir dès le départ | [#432](https://github.com/cwapi3d/cwapi3dpython/issues/432) |
| 10–11 nov. | 33.397.2 → 33.397.17 : réécriture massive de la documentation des fonctions | Meilleures réponses via le MCP et dans l'éditeur | [Commits](https://github.com/cwapi3d/cwapi3dpython/commits/main) ; [PyPI](https://pypi.org/pypi/cwapi3d/json) |

Une précision sur les versions : l'agrégateur libraries.io affichait encore 33.343.2 ([libraries.io](https://libraries.io/pypi/cwapi3d)). Il est en retard ; la référence est PyPI. **Déduit** : ces évolutions sont toutes des ajouts. Aucune n'apporte d'ancrage, d'abonnement aux événements en Python ni de liaison de raccourci. Le rythme hebdomadaire est un atout, car de nouvelles fonctions arrivent chaque mois. C'est aussi une contrainte : un poste qui n'est pas à jour n'a pas les mêmes fonctions que la documentation.

## 4. Une architecture en couches relie dessin, fiches de taille et CCM

### Le principe : séparer le métier de l'affichage

La règle d'architecture la plus rentable est de **garder toute la logique métier dans un paquet Python pur (`ccm_core`)**. Ce paquet ne parle à cadwork qu'à travers un adaptateur unique, et ne dépend d'aucune interface. On peut alors passer de la fenêtre flottante (option A) à un hôte C++ (C), voire à un Tool Center Caddev (D), sans réécrire le métier. Claude Code peut aussi tester ce métier sans cadwork, grâce à un faux adaptateur. Les extensions passent par des **registres**. Chaque type d'objet du catalogue, chaque contrôle qualité et chaque export s'enregistre auprès du cœur sans le modifier, sur le même principe que le registre d'actions `toolbar.register` de votre extension Aperçu PJ. Le contenu (fichiers `.3dc`, variantes, vignettes, règles) relève des données versionnées dans Git. Les prix, références fournisseurs et commandes vivent dans CCM. Ce schéma est **déduit** : il s'appuie sur les fonctions confirmées plus haut.

```
┌──────────────────── cadwork 3D 2026 (chaque poste Windows) ────────────────────┐
│  Barre de plugins / fenêtre flottante / onglet ancré (option A, B, C ou D)     │
│     CCM Container        CCM Contrôle        CCM Fabrication & Données         │
│  ──────────── Interface PyQt6  (ou hôte C++ Qt6 qui appelle le Python) ─────── │
│                                │                                               │
│  ccm_core (Python pur) : registres d'objets, de contrôles, d'exports, synchro  │
│                                │  un seul adaptateur                           │
│  cwapi3d 33.x (API officielle cadwork)                                         │
└───────────────┬────────────────────────────────────────┬───────────────────────┘
                │ fichiers versionnés (Git)              │ HTTPS (session utilisateur + RLS)
   Dépôt ccm-tools-cadwork                       Application CCM / Supabase
   catalogue .3dc/.val, vignettes,               projets, éléments (GUID), tarifs,
   règles qualité, préréglages listes            fournisseurs, bons de commande
```

### Le dépôt `ccm-tools-cadwork`

Sur le modèle de votre dépôt `ccm-tools-bricscad`, nous proposons un dépôt dédié dont chaque poste relie le dossier `plugins/` à son `API.x64` par une jonction. Une mise à jour se résume alors à `git pull` suivi d'un redémarrage de cadwork.

```
ccm-tools-cadwork/
├── plugins/                 ← reliés à userprofil\3d\API.x64
│   ├── CCM_Container/       (CCM_Container.py, Icon.svg, plugin_info.xml)
│   ├── CCM_Controle/
│   └── CCM_Donnees/         (successeur de _CCM_data)
├── ccm_core/                ← logique métier, testable hors cadwork
├── catalogue/               ← .3dc, .val, vignettes PNG, catalogue.json
├── regles/                  ← sections.csv, longueurs_stock.csv, attributs_obligatoires.json
├── presets/                 ← réglages de listes (.xml), pièce par pièce, BTL
├── vendor/                  ← dépendances pures Python (requests, openpyxl)
├── dock_host_cpp/           ← (optionnel) hôte d'ancrage C++ Qt6
├── tests/                   ← tests avec faux adaptateur cadwork
└── tools/                   ← installation (jonctions, contrôle de version cadwork)
```

Le catalogue se décrit dans un manifeste, ce qui permet d'ajouter une famille d'objets sans écrire de code. L'exemple ci-dessous est purement illustratif :

```json
{
  "id": "sabot-ailes-ext-100x200",
  "libelle": "Sabot à ailes extérieures 100×200",
  "categorie": ["Connecteurs", "Sabots", "Simpson"],
  "type": "3dc",
  "fichier": "catalogue/connecteurs/simpson/sabot_100x200.3dc",
  "vignette": "catalogue/vignettes/sabot-ailes-ext-100x200.png",
  "attributs": {"sku": "REF-FOURNISSEUR", "groupe": "Quincaillerie"},
  "insertion": {"point": "clic", "miroir_autorise": true}
}
```

Chaque `type` correspond à un gestionnaire enregistré dans le cœur :

| `type` | Fonctions utilisées |
|---|---|
| `3dc` | `import_3dc_file_with_options`, puis enregistrement dans l'annulation |
| `variante` | `import_variant_file` |
| `standard` | création par GUID |
| `connecteur` | `create_standard_connector` |
| `assemblage` | `cut_half_lap`, `cut_double_tenon`… avec paramètres prédéfinis |
| `materiau` | `set_material` |

Les textures font exception. L'API ne sait pas définir l'image de texture d'un matériau ([material_controller](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/material_controller/__init__.pyi)) : il faut donc créer une seule fois, à la main, les matériaux texturés de l'entreprise dans cadwork. L'add-on se contente ensuite de les affecter.

### Fiches de taille, métrés, prix et bons de commande

**Confirmé.** Le module Liste distingue liste de pièces, liste de production et liste d'assemblage. Il exporte en CSV, TXT ou XLSX et enregistre des modèles de format ([KB – module Liste](https://kb.cadwork.ch/list_module/manual/1745) ; [cadwork – module Liste](https://en.cadwork.com/indexL1.jsp?did=433)). Le module plans d'atelier produit automatiquement des **plans pièce par pièce** prédimensionnés ([Cadwork04 – Liste/DPP](https://04.cadwork.com/modules/list-dpp/?lang=en)). L'API orchestre toute la chaîne :

- `generate_new_production_list_silently` numérote les pièces ;
- `check_position_numbers_production_list` vérifie la numérotation ;
- `export_production_list_with_settings(ids, "….xlsx", preset.xml)` produit la liste ([list_controller](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/list_controller/__init__.pyi)) ;
- `export_piece_by_piece_with_clipboard` produit les plans pièce par pièce ([shop_drawing_controller](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/shop_drawing_controller/__init__.pyi)) ;
- `export_btl` produit le fichier machine ([machine_controller](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/machine_controller/__init__.pyi)) ;
- la commande `ci_start.exe "plan.2d" /L PDF` imprime en PDF les cadres d'un fichier 2D ([command_line.md](https://github.com/cwapi3d/cwapi3dpython/blob/main/docs/command_line.md)).

La documentation avertit que l'export de liste ne renvoie rien et **ne signale pas ses échecs** : il faut vérifier que le fichier existe ensuite. Pour les métrés, la géométrie fournit volume de liste, volume net, longueurs de liste, poids et surfaces ([geometry_controller](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/geometry_controller/__init__.pyi)). Chaque matériau porte un prix et une unité (m³, m², m, pièce, kg…), mais **aucune devise n'est enregistrée** ([material_controller](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/material_controller/__init__.pyi)). Les **attributs remplis par script**, disponibles depuis la v29, calculent leur valeur en Python à l'exécution. Ils servent de critère de tri, figurent dans les listes exportées, et la documentation cite leur usage pour transmettre des informations à un ERP ([auto_attributes.md](https://github.com/cwapi3d/cwapi3dpython/blob/main/docs/auto_attributes.md)). Les recherches n'ont trouvé **aucun module natif de chiffrage ni de bon de commande**.

**Déduit.** La « fiche de taille » SEMA correspond, dans cadwork, à l'ensemble formé par les plans pièce par pièce, la liste de production et l'export BTLx. Un bouton « Un clic fabrication » peut enchaîner, dans l'ordre :

1. numérotation ;
2. contrôle ;
3. liste XLSX au format CCM ;
4. plans pièce par pièce ;
5. BTLx ;
6. PDF.

Avant de scripter les plans, il faut évaluer Bridge, qui gère déjà les plans d'atelier en 2026 mais n'a aucun équivalent dans l'API. Une colonne de prix peut apparaître directement dans les listes natives grâce à un attribut rempli par script (volume de liste × prix du matériau ou prix CCM). Le bon de commande, lui, gagne à être construit dans CCM. L'add-on lui envoie des lignes agrégées par référence article, puis par matériau et section, avec les métrés. CCM choisit le fournisseur et le tarif, produit le PDF ou le courriel, puis le numéro de commande revient sur les éléments dans cadwork.

### Synchronisation avec CCM : identifiants stables et détection des changements

**Confirmé.**

- `get_element_cadwork_guid` renvoie un GUID **persistant**, qui survit à l'enregistrement, à la réouverture et à la fusion de documents. Au premier appel, il peut créer ce GUID ([element_controller](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/element_controller/__init__.pyi)).
- `get_project_guid` est présenté comme « une clé stable pour stocker des données du projet hors de cadwork » ([utility_controller](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/utility_controller/__init__.pyi)).
- `set_additional_data` et `set_additional_guid` stockent des paires clé/valeur privées dans le document, avec la consigne d'utiliser un préfixe propre au script ([attribute_controller](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/attribute_controller/__init__.pyi)).
- Le GUID IFC court se lit sans licence IFC ([bim_controller](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/bim_controller/__init__.pyi)).
- Deux questions restent sans réponse publique : comment piloter de l'extérieur une session cadwork ouverte (discussion #420), et quelle est la stabilité des GUID (discussion #422) ([Discussions](https://github.com/cwapi3d/cwapi3dpython/discussions)).
- Côté Supabase, l'écriture « insérer ou mettre à jour » (upsert) est documentée ([Supabase – upsert Python](https://supabase.com/docs/reference/python/upsert)).

| Donnée | Côté cadwork | Côté CCM (Supabase) |
|---|---|---|
| Projet | `get_project_guid()`, numéro et nom de projet | `projets.cadwork_project_guid`, unique |
| Élément | `get_element_cadwork_guid()` | `elements(projet_id, cadwork_guid)` unique, écrit par upsert |
| Lien retour | `set_additional_guid(ids, "ccm.element_id", uuid)` | identifiant de la ligne CCM |
| Détection de changement | `set_additional_data(ids, "ccm.hash", …)` | `hash`, `synced_at`, `deleted_at` |
| Commande | attribut utilisateur « Commande » ou clé `ccm.po` | lignes de bon de commande |
| Prix | `set_price` par matériau, ou attribut par élément | tarifs fournisseurs |

**Déduit.** Faute d'événements en Python, la détection des changements se fait au moment de la synchronisation. L'add-on calcule une empreinte (hash) des champs utiles aux listes et la compare à `ccm.hash`. Un GUID présent dans CCM mais absent de cadwork désigne un élément supprimé, à marquer comme tel plutôt qu'à effacer. Un nouveau GUID devient une insertion. Comme aucun moyen officiel ne permet à une application externe de piloter cadwork, **c'est le plugin qui va chercher les données dans CCM**, et non l'inverse. Un agent local inspiré d'open-mcp-cad pourra venir plus tard. La sécurité impose deux règles. Le plugin s'authentifie avec la session de l'utilisateur, les droits étant filtrés par les règles RLS de Supabase, ou passe par une Edge Function. **La clé `service_role` ne doit jamais résider sur un poste.** Si Internet est coupé, les envois attendent dans des fichiers JSON du dossier projet. Trois points sont à tester en conditions réelles :

- les certificats HTTPS dans le Python embarqué ;
- le sort du GUID quand on copie un élément (le copier peut le dupliquer) ;
- le fait que CCM repose bien sur Supabase.

### Faire, faire faire, ou combiner

Quatre options s'offrent à vous.

1. **Le natif seul** : catalogues rangés, favoris, touches F. Il ne coûte rien et se met en place vite, mais n'apporte ni vignettes, ni ancrage, ni lien avec CCM.
2. **Le développement maison avec Claude Code** donne la maîtrise complète. Il prolonge votre pratique `ccm-tools-bricscad` et profite du serveur MCP officiel. Son coût caché est l'entretien à chaque version majeure. Le passage de Qt5 à Qt6 et l'abandon de Lua en 2026 ont cassé des plugins existants ([KB Plugins 2026](https://kb.cadwork.ch/en/news/manual/1877/plugins)).
3. **La commande à Caddev/Cadwork04** profite d'une maîtrise de l'ancrage déjà démontrée chez vous. En revanche, aucun prix ni aucune offre de développement sur mesure n'est publique, et la liaison avec CCM resterait dépendante d'un tiers.
4. **La combinaison**, que nous recommandons : construire `ccm_core` en interne dès maintenant, et demander en parallèle à Cadwork04 un devis pour un hôte d'ancrage ou un Tool Center bibliothèque. On compare ensuite les deux voies une fois le prototype terminé. Sur la quincaillerie, CTC et C-CONNECT couvrent peut-être déjà une partie du besoin : cela mérite une démonstration avant de développer.

### Autres idées pour gagner du temps

| Idée | Gain attendu | Briques (API ou outil) | Statut |
|---|---|---|---|
| Préréglages d'attributs CCM : « Solive 75×225 C24 » → nom, groupe, sous-groupe, matériau, référence article, type de process en un clic | Fin des saisies répétitives et des fautes de frappe | `set_name`, `set_group`, `set_sku`, `set_process_type_and_extended_settings_from_name` | Fonctions confirmées ; outil déduit |
| Listes déroulantes alimentées par CCM | Les dessinateurs ne voient que des valeurs validées | `add_item_to_name_list`, `add_item_to_sku_list`… | Idem |
| Numérotation par bâtiment et étage (plages 1000+, 2000+) | Numérotation par lots, à la manière de SEMA | `map_elements` par étage, `generate_new_production_list_silently` | Idem |
| Bouton « Un clic fabrication » | Liste, plans, BTLx et PDF en une fois | Chaîne décrite plus haut | Idem |
| Colonne prix et contrôle « section standard/spéciale » dans les listes natives | Métrés valorisés sans Excel | Attributs remplis par script | Confirmé ([auto_attributes.md](https://github.com/cwapi3d/cwapi3dpython/blob/main/docs/auto_attributes.md)) |
| Générateur de solivage : choisir une arête, saisir entraxe et section | Plancher posé en quelques secondes | `get_user_edge` (33.397), `create_standard_beam_points` | Déduit ; build récent requis |
| Pose automatique de sabots aux abouts de solives, avec leur référence de commande | Quincaillerie dessinée et comptée en même temps | `get_p1`/`get_p2`, `create_standard_connector`, `get_axis_item_order_number` | Déduit |
| Chevronnage sur pans de toiture | Création répétitive automatisée | `roof_controller` + création de pièces | Déduit |
| Nomenclature de quincaillerie vers CCM | Bon de commande quincaillerie sans recomptage | `get_axis_items_guids`, `get_bolt_order_number` | Fonctions confirmées |
| Optimisation de débit sur les longueurs de stock CCM | Moins de chutes, commandes en barres | `create_linear_optimization` | Fonction confirmée |
| « Ajouter la sélection à la bibliothèque » avec vignette automatique | Bibliothèque alimentée au fil des affaires | `export_3dc_file`, `export_screen_to_image` | Déduit, à tester |
| Lien de partage BIMteam enregistré dans la fiche CCM du projet | Partage client ou architecte en un clic | `upload_to_bim_team_and_create_share_link` | Fonction confirmée |
| Régénération des listes et du BTL sur un poste dédié, sans interface | Exports sans mobiliser un dessinateur | `ci_start.exe … /RUNPROGRAM=… /NO-GUI` | Technique confirmée ; licence à vérifier |
| Planification du chargement des camions | Si c'était le rôle du « Gestionnaire de chargement » SEMA | Module Opticargo ([Cadwork04](https://04.cadwork.com/opticargo)) | Confirmé (module) |

## 5. Un contrôleur qualité en trois portes : modèle, fabrication, achats

### Ce que cadwork contrôle déjà

**Confirmé.** cadwork dispose de longue date d'un **contrôle de collision**. Une vidéo de formation française de 2021 porte ce nom, et d'anciens manuels donnent le raccourci Ctrl+K sur les éléments actifs ([Vimeo cadwork – Contrôle de collision](https://vimeopro.com/cadwork/video-de-la-semaine/video/605445671)). Ce contrôle peut être filtré par attribut, par exemple par matériau, pour voir quels éléments se touchent ou se chevauchent ([cadwork.ca – Construction passive](https://cadwork.ca/en/solutions/passive/)). cadwork affirme aussi comparer listes, données machine et plans avec la géométrie courante ([cadwork.swiss – 3D Holzbau](https://cadwork.swiss/module/cadwork-3d-holzbau/)). D'autres outils complètent ce contrôle :

- Bridge signale en 2026 les plans obsolètes ([KB – Nouveautés 2026](https://kb.cadwork.ch/en/news/manual/1840/general)).
- Le module Élément supprime sans le dire un élément entièrement contenu dans un autre ([KB – Nouveautés Élément](https://kb.cadwork.ch/en/news/manual/1789/elementbau)).
- Le plugin « No Clash Control », l'inverse du contrôle de collision, détecte les pièces qui ne se touchent pas. Il a été distribué gratuitement vers 2022, et son statut en 2026 n'est pas vérifié ([LinkedIn – NCC](https://fr.linkedin.com/posts/aurelienbouilleaux_g%C3%A9nial-ce-plugin-cest-linverse-du-contr%C3%B4le-activity-6982972710779764736-rUWr)).
- Hundegger contrôle strictement la conformité des données reçues. cadwork demande donc de recalculer les données machine avant export ([cadwork – Nouveautés V30 SP2024](https://filehost.cadwork.ca/doc_website/en_News_Version_30_%28SP2024%29.pdf)).
- Pour l'IFC, la base de connaissances recommande Solibri ou des visionneuses gratuites ([KB cadwork 1090](https://kb.cadwork.ch/holzbau/pdf/en/1090)), avec un retour des remarques au format BCF ([cadwork-bim – BCF](https://cadwork-bim.readthedocs.io/de/latest/en/4.BCF/bcf/)).

Aucun outil trouvé ne réunit dans un même contrôle avant production le modèle, les fiches de fabrication et les achats.

L'API fournit les briques de base ([element_controller](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/element_controller/__init__.pyi) ; [geometry_controller](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/geometry_controller/__init__.pyi) ; [list_controller](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/list_controller/__init__.pyi) ; [visualization_controller](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/visualization_controller/__init__.pyi)) :

- `check_element_duplicates` pour les doublons ;
- `get_elements_in_collision` et, depuis la 33.378, `get_element_collision_type`, qui classe un couple de pièces en *contenu*, *coïncident*, *imbriqué* ou *en contact* ;
- `check_position_numbers_production_list` pour la numérotation ;
- `calculate_btl_machine_data` puis `get_element_btl_processings` pour les données machine ;
- `map_elements` et `filter_elements` pour regrouper ou filtrer par attribut ;
- `set_active`, `zoom_active_elements` et `set_element_transparency` pour montrer les fautes.

L'exemple officiel tient en trois lignes. On récupère les écarts de numérotation, on les rend actifs, puis on affiche un message d'erreur ([list_example.md](https://github.com/cwapi3d/cwapi3dpython/blob/main/docs/examples/list_example.md)). L'API a aussi ses limites. Le comportement exact de `check_element_duplicates` n'est pas documenté. Aucune fonction n'indique si un usinage est « non usinable ». Aucune ne relit le contenu d'une liste exportée : il faut analyser le fichier produit. Enfin, rien ne permet d'intercepter les exports natifs.

### Conception du contrôleur (déduit)

Le contrôleur est un **registre de contrôles**. Chaque contrôle déclare :

- un identifiant ;
- un libellé en français ;
- une priorité ;
- une porte (modèle, fabrication ou achats) ;
- une portée (sélection active ou modèle entier) ;
- une fonction `run(ids)` qui renvoie la liste des anomalies.

Les règles de l'entreprise vivent dans des fichiers versionnés : catalogue des sections, longueurs de stock par matériau, attributs obligatoires, paires de pièces autorisées à se chevaucher (isolant contre montants, par exemple), poids maximal. La fenêtre de rapport affiche la gravité, le contrôle, le nombre d'éléments et le message. Un clic sur une ligne active les éléments fautifs et zoome dessus. Mieux vaut **activer et rendre transparent plutôt que recolorer**, car les couleurs ont un sens dans vos modèles et sur vos plans. Le contrôleur écrit aussi un attribut « QC_STATUS » sur les éléments, pour pouvoir les filtrer avec les outils natifs une fois la fenêtre fermée.

Le rapport s'exporte en XLSX ou en PDF. Il mentionne le projet, le fichier, la version et la build de cadwork, la date et le contrôleur. On l'archive à côté du BTL : il devient un « bon pour fabrication » traçable. Comme les exports natifs ne peuvent pas être verrouillés, le blocage reste procédural. La commande « Contrôler puis exporter » n'appelle les exports silencieux que si tous les contrôles P1 passent, ou si un passage en force est enregistré dans le rapport. C'est la pratique de l'industrie : une porte formelle avant fabrication, avec validation humaine. Les listes de contrôle publiées le montrent, comme celle du Timber Frame Engineering Council ([TFEC – Shop Drawing Checklist](https://www.carolinatimberworks.com/wp-content/uploads/2020/08/Timber-Frame-Shop-Drawing-Checklist.pdf)), tout comme les pratiques anti-erreur d'atelier ([WOODWEB](https://woodweb.com/knowledge_base/MistakeProofing_Cabinet_Jobs.html)). Avant de rendre bloquants les contrôles P1, il faut les **étalonner sur des affaires de l'époque SEMA remodélisées dans cadwork**, pour éliminer les fausses alertes.

### Catalogue priorisé des contrôles

Les priorités se lisent ainsi :

- **P1** : bloquant avant l'envoi à l'atelier ou aux fournisseurs ;
- **P2** : avertissement ;
- **P3** : information.

Les fonctions citées figurent dans les définitions officielles de l'API. Les contrôles Q10, Q14, Q18 et Q24 sont nos ajouts, déduits des constats précédents.

| # | Contrôle | Prio | Porte | Fonctions API principales | Remarque |
|---|---|---|---|---|---|
| Q1 | Attributs obligatoires manquants (nom, groupe, sous-groupe, matériau, lot) | P1 | Modèle | `map_elements`, `get_element_material_name`, `get_user_attribute` | Règles dans `attributs_obligatoires.json` |
| Q2 | Doublons superposés | P1 | Modèle | `check_element_duplicates` | Comportement à tester sur un modèle type |
| Q3 | Collisions (coupe oubliée) | P1 | Modèle | `get_elements_in_collision` ; `get_element_collision_type` | *Imbriqué* = erreur. Liste blanche par matériau. Type de collision absent si la build est antérieure à 378 |
| Q4 | Section hors catalogue de l'entreprise | P1 | Modèle | `get_list_width`/`get_list_height`, `get_standard_element_name` | Comparaison avec `sections.csv` |
| Q5 | Longueur supérieure au stock ou inférieure au minimum usinable | P1 | Modèle | `get_list_length` | Seuils par matériau (bois massif, BLC, LVL) |
| Q6 | Pièces de volume nul ou minuscules | P1 | Modèle | `get_volume`, `get_actual_physical_volume` | Restes de découpes |
| Q7 | Numéros de production incohérents | P1 | Fabrication | `check_position_numbers_production_list` / `_part_list` | Exemple officiel réutilisable |
| Q8 | Numérotation : trous, doublons, pièces sans numéro | P2 (P1 si sans numéro) | Fabrication | `map_elements` par numéro de production | Même numéro pour deux géométries différentes = erreur |
| Q9 | Données machine absentes ou obsolètes | P1 | Fabrication | `calculate_btl_machine_data`, `get_element_btl_processings` | Recalcul systématique avant export |
| Q10 | Plans d'atelier obsolètes | P1 | Fabrication | Bridge (natif), sans API | À intégrer à la procédure de validation |
| Q11 | Assemblage manquant (solive sans sabot ni entaille) | P2 | Modèle | `get_elements_in_contact`, `get_endtype_name_start/end`, `is_connector_axis` | Règle par type de pièce |
| Q12 | Pièces hors export ou hors conteneur des fiches | P2 | Fabrication | `get_parent_container_id`, `get_export_solid_content_elements` | Chaque pièce dans exactement un ensemble |
| Q13 | Éléments masqués ou inactifs oubliés | P2 | Fabrication | `get_invisible_identifiable_element_ids` | Exclus de nombreux exports |
| Q14 | Quincaillerie sans référence article | P1 | Achats | `get_axis_item_order_number`, `get_bolt_order_number`, `get_sku` | Sinon, commande impossible |
| Q15 | Connecteurs : comptage du modèle comparé à la liste et à la commande ; boulon trop court | P2 | Achats | `get_axis_items_guids`, `get_bolt_length`, `get_bolt_length_automatic` | Comparaison avec les lignes CCM |
| Q16 | Liste matières comparée au bon de commande (m³, ml, nombre de barres) | P2 | Achats | `get_list_volume`, `get_list_quantity`, `create_linear_optimization` | Logique entièrement maison |
| Q17 | Matériau inconnu ou sans prix | P2 | Achats | `get_all_materials`, `get_price` | Sinon, chiffrage faux |
| Q18 | Modèle modifié depuis la dernière commande ou la dernière fiche | P1 | Achats et fabrication | Empreinte calculée comparée à `ccm.hash` (`get_additional_data`) | Découle directement de la synchronisation |
| Q19 | Éléments sans bâtiment ni étage | P2 | Modèle | `get_building`, `get_storey` | Regroupement des listes et IFC |
| Q20 | Type de sortie ou de process incorrect | P3 | Fabrication | `get_output_type`, `get_name_process_type` | Pièce ignorée sans avertissement |
| Q21 | Poids et manutention | P3 | Fabrication | `get_list_weight`, `get_center_of_gravity_for_list` | Limites de grue et de transport |
| Q22 | Angles de coupe aberrants ou face de référence douteuse | P3 | Fabrication | `get_*_cut_angle`, `get_reference_side` | Plage de la machine |
| Q23 | Type IFC non défini | P3 | Modèle | `get_ifc2x3_element_type`, `export_ifc4_silently_with_options` | Livrables BIM |
| Q24 | Fichier de liste exporté absent ou vide | P1 | Fabrication | `export_*_list_with_settings`, puis vérification du fichier | L'API « ne signale pas ses échecs » ; licence Liste requise |

Le catalogue dans son ensemble repose sur [element_controller](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/element_controller/__init__.pyi), [geometry_controller](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/geometry_controller/__init__.pyi), [attribute_controller](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/attribute_controller/__init__.pyi), [connector_axis_controller](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/connector_axis_controller/__init__.pyi), [machine_controller](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/machine_controller/__init__.pyi) et [bim_controller](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/bim_controller/__init__.pyi). Deux précautions de performance s'imposent. Les contrôles d'attributs doivent passer par `map_elements` et `filter_elements` plutôt que par des boucles pièce par pièce. Les collisions doivent être présélectionnées par boîtes englobantes, car tester toutes les paires devient vite très lent sur un gros modèle.

## 6. Feuille de route : prouver l'ancrage avant d'investir

Les durées indiquées sont des ordres de grandeur, à recaler après la phase 1 selon le temps que vous y consacrerez. Le prototype de la phase 1 doit trancher deux risques : l'ancrage et la fiabilité de l'insertion.

| Phase | Objectif | Contenu | Critère de passage | Durée indicative |
|---|---|---|---|---|
| **0. Inventaire** | Connaître le terrain | Build exact (`get_3d_build`) et passage Live Update ; licences (Liste, plans d'atelier, BTL, BIM Manager, API) ; chemin du userprofil 2026 ; langage et contenu de `_CCM_data` ; catalogues fabricants installés ; création de `ccm-tools-cadwork` ; MCP cadwork ajouté à Claude Code | Fiche d'inventaire complète | 1 à 2 jours |
| **1. Prototype « ancrage et insertion »** | Lever les deux risques | Bouton dans la barre de plugins ; fenêtre PyQt6 avec arbre et 5 vignettes ; insertion d'un `.3dc` au point cliqué, annulable ; mi-bois entre deux pièces sélectionnées ; affectation d'un matériau ; test de l'option B ; mini-hôte C++ (option C) si B échoue ; import de requests et appel HTTPS à un Supabase de test ; vérification du conflit Qt | Insertion fiable et annulable ; décision écrite entre A, B, C et D | 1 à 2 semaines |
| **2. Container opérationnel** | Remplacer l'usage quotidien de SEMA | Reprise de la bibliothèque (assemblages, sabots, textures) ; manifeste ; recherche et favoris ; vignettes automatiques ; synchronisation Git des postes ; démarrage automatique | Les objets courants s'insèrent sans passer par *Ajouter → Catalogue* | 3 à 6 semaines |
| **3. Données et CCM** | Gagner du temps sur listes et achats | Préréglages d'attributs ; numérotation automatique ; « Un clic fabrication » ; attributs de prix ; synchronisation par GUID ; bons de commande dans CCM ; retour du numéro de commande | Une affaire pilote traitée de bout en bout | 4 à 8 semaines |
| **4. Contrôle qualité** | Fiabiliser avant l'atelier | Moteur et contrôles P1, rapport, « Contrôler puis exporter » ; puis P2 et P3 ; étalonnage sur des affaires SEMA remodélisées | Aucune fausse alerte bloquante sur 3 affaires de référence | 3 à 5 semaines, en parallèle de la phase 3 |
| **5. Générateurs et agent** | Automatiser le dessin | Solivage, sabots automatiques, chevronnage ; agent local entre CCM et cadwork ; assistant IA via MCP | Gain mesuré par rapport à l'effort | En continu |

La règle de décision du prototype est simple :

- **Option B fiable** (l'ancrage Python fonctionne sans plantage sur votre build) : tout reste en Python.
- **Option B en échec, ancrage indispensable** : on choisit l'option C ou D. Claude Code peut écrire l'hôte C++, mais il faut installer Visual Studio 2022 et Qt 6.8 sur le poste, puis les maintenir à chaque version majeure de cadwork.
- **Dans tous les cas** : l'option A reste le filet de sécurité, utilisable dès la phase 2.

## 7. Questions ouvertes et prochaines étapes

### À vérifier sur votre poste

| Point | Pourquoi c'est important | Comment vérifier |
|---|---|---|
| Build réel et mises à jour | Écart probable entre la build 298 et l'API 33.397 | Écran de démarrage, Live Update ; `utility_controller.get_3d_build()` depuis la [PythonConsole](https://github.com/cwapi3d/PythonConsole) |
| Python et Qt embarqués | Python 3.14 et PyQt6 6.8.x attendus ; conflit Qt connu | Dossier `exe_2026\pclib.x64\python314\site-packages` ; ouvrir une fenêtre PyQt6 de test |
| Ancrage possible depuis Python | Clé du choix d'architecture | Test B du prototype |
| Script `_CCM_data` | Lua et PyQt5 ne fonctionnent plus en 2026 | Ouvrir son dossier dans `API.x64` : langage, imports, dépendances |
| Licences | Exports de listes et BTL silencieux sans licence ; BMT ; API | Informations de licence dans cadwork ; Cadwork04 |
| Vignettes dans *Ajouter → Catalogue* | Pourrait suffire pour certains usages | Ouvrir l'explorateur sur un dossier de `.3dc` |
| Catalogues Simpson, Rothoblaas, Knapp installés | Évite de remodéliser | Dossiers des catalogues livrés |
| Libellés français exacts | Les sources lues étaient surtout anglaises | Interface FR de la 2026 |
| HTTPS depuis le Python embarqué | Condition de la liaison Supabase | Test du prototype |
| GUID après copie d'un élément | Fiabilité de la synchronisation | Copier une pièce et comparer les deux GUID |
| Chemin du userprofil 2026 | Installation des plugins | Aide → Info → Userprofil |

### À demander à Cadwork04 et Caddev

Six questions fermeront les principales incertitudes :

1. L'utilisation de l'API Python ou C++ est-elle soumise à un module payant en France ?
2. Existe-t-il une méthode d'ancrage prise en charge pour les plugins, et une date pour l'abonnement aux événements en Python ?
3. Caddev propose-t-il un Tool Center de type bibliothèque, ou un développement sur mesure, et à quel prix ?
4. Que couvrent exactement CTC et C-CONNECT pour les sabots et équerres d'une charpente ?
5. No Clash Control est-il encore distribué en 2026 ?
6. Bridge est-il ou sera-t-il pilotable par l'API ?

### Prochaines étapes concrètes

1. **Créer le dépôt `ccm-tools-cadwork`** sur GitHub, à côté de `ccm-tools-bricscad`, avec l'arborescence proposée en section 4.
2. **Donner accès à l'installation réelle.** Lors d'une prochaine session, partagez un dossier de votre PC Dell Alienware avec Claude via Remote Control, dans l'application de bureau Claude (Paramètres → Claude Code → Remote Control). Cela permettra d'inspecter l'installation cadwork, le userprofil 2026 et le script `_CCM_data` existant. Le dossier partagé ne peut pas être le dossier personnel lui-même, ni un dossier caché. Vous pouvez aussi lancer Claude Code directement sur ce poste. Une session ainsi reliée pourra en outre lancer des tests automatiques par `ci_start.exe … /RUNPROGRAM=… /NO-GUI` (déduit ; licence à vérifier).
3. **Ajouter le serveur MCP cadwork** à Claude Code.
4. **Réaliser la phase 0**, puis le prototype de la phase 1.
5. **Envoyer à Cadwork04 les six questions ci-dessus**, pour disposer d'un devis au moment de la décision d'ancrage.

## Conclusion

Il est tentant de traduire la question en « peut-on refaire le Container ? ». La vraie question est « où doit vivre le panneau ? ». La réponse change peu le projet si le métier est séparé de l'affichage. Une fenêtre flottante, un hôte C++ ou un Tool Center Caddev deviennent alors des habillages interchangeables du même cœur Python. Le choix d'ancrage peut ainsi attendre la fin du prototype sans bloquer quoi que ce soit. Le gain le plus important ne viendra probablement pas de la bibliothèque elle-même. Il viendra de la boucle de données que cadwork rend possible et que SEMA n'offrait pas sous cette forme : des GUID persistants qui relient chaque pièce à CCM, des attributs calculés qui portent les prix jusque dans les listes natives, et une empreinte qui alerte dès qu'une commande ou une fiche ne correspond plus au modèle. Le Container SEMA accélérait le dessin. L'add-on cadwork peut devenir la charnière entre dessin, fabrication et achats.

L'autre enseignement concerne le rythme. L'API cadwork évolue chaque semaine : de nouvelles fonctions arrivent, la documentation est réécrite et un serveur MCP officiel la rend exploitable par Claude Code. Cette vitesse est un atout. C'est aussi un risque, comme l'ont montré l'abandon de Lua, le passage de PyQt5 à PyQt6 et l'écart probable entre la build 298 et la documentation. Dans ce projet, la discipline compte autant que les fonctions : mises à jour Live Update régulières, tests de présence des fonctions, tests sans cadwork et journal des versions dans chaque rapport. Une PME de charpente peut tout à fait la tenir si elle l'inscrit dès le départ dans le dépôt `ccm-tools-cadwork`.
