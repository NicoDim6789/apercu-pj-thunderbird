# Écosystème de plugins cadwork 3D et actualités cadwork (focus 11 oct. – 11 nov. 2026)

> Méthode et limites (à lire en premier) : recherche faite le 2026-11-11, uniquement avec WebSearch (résultats + extraits). La lecture directe des pages a échoué parce que l'environnement bloque `kb.cadwork.ch` et `cadwork.ca` (« host not allowed / ENOTFOUND »). Conformément aux consignes de l'environnement, je n'ai pas essayé d'autres domaines en lecture directe. Les faits ci-dessous viennent donc des extraits de moteur de recherche et doivent être vérifiés sur la page source avant publication. Pour aller plus loin, il faut autoriser `kb.cadwork.ch`, `cadwork.ca`, `04.cadwork.com`, `caddev.info` et `w4c.group` dans les paramètres réseau de la session.

## Q1 — Qui est Caddev (société, pays, produits, ancrage dans cadwork, prix, développement sur mesure) ?

### Takeaway
Caddev est la filiale de développement logiciel du groupe français **Work4Cad (W4C)**, qui possède aussi **Cadwork04**, le distributeur cadwork pour la France (site `04.cadwork.com`). Caddev développe pour Cadwork04 la famille des **« Tools Center »** : JTC (menuiserie), STC (tôlerie/acier), CTC (liaisons bois-métal) et OTC (ouvertures). Ces modules ajoutent des outils métier à cadwork sans modifier le cœur du logiciel. Je n'ai trouvé aucun tarif public. Aucune source ne confirme non plus le mécanisme technique de l'ancrage en panneau latéral.

### Cited Findings
- Le site du groupe Work4Cad liste ses entités : Cadwork04, Cadcom, Caddev, etc. Caddev y est décrite comme proposant des « solutions logicielles, web app, 3D et IA innovantes ». Cadwork04 y est présentée comme l'éditeur/distributeur de CAO 3D pour le bâtiment — [w4c.group – Nos entités](https://www.w4c.group/en/nos-entites)
- Le groupe Work4Cad s'est construit autour de l'acquisition de Cadwork04 — [w4c.group – Le groupe](https://www.w4c.group/en/le-groupe) ; [w4c.group (accueil)](https://www.w4c.group/en)
- Les Tool Centers ont été créés par Cadwork04 pour adapter cadwork à différents métiers et marchés. Ils sont **développés par Caddev**. Liste : **JTC** (Joinery / menuiserie), **STC** (Steel Tool Center, présenté pour la tôlerie, le pliage et la zinguerie), **CTC** (liaisons bois et métal), **OTC** (portes et fenêtres). Ils ajoutent des outils métier « sans changer le cœur du logiciel ». Source : extrait d'un profil/post LinkedIn d'un responsable Cadwork04 — [LinkedIn – Nicolas Quidet, Cadwork-04 / Work4Cad](https://www.linkedin.com/in/nicolas-quidet-cadwork04-work4cad/)
- Divergence sur STC : un extrait le décrit comme « sheet-metal bending and flashing » (tôlerie/zinguerie), un autre extrait du même auteur parle de « STC (steel) ». Les deux décrivent probablement le même module orienté métal/acier, mais ce n'est pas vérifié — [LinkedIn – Nicolas Quidet](https://www.linkedin.com/in/nicolas-quidet-cadwork04-work4cad/)
- Le site Cadwork04 a une page JTC qui décrit le module comme un outil pour poseurs et menuisiers, qui part de simples cubes pour définir les dimensions extérieures d'un agencement — [en.04.cadwork.com – JTC Joinery Tools Center](https://en.04.cadwork.com/?p=4878)
- La page produits de Caddev (`caddev.info/fr/products`) ressort avec le texte d'**Opticargo** (« simulez et optimisez vos chargements… zones de chargement par remorque/conteneur »). C'est le même argumentaire que celui de cadwork pour son module Opticargo — [caddev.info – produits](https://www.caddev.info/fr/products) ; [04.cadwork.com – Opticargo](https://04.cadwork.com/opticargo)
- Une vidéo YouTube propose un « crack » de « Caddev OptiCargo 2026 » et le présente comme un plugin CADWORK. C'est un signal indirect que le marché associe Opticargo à Caddev. Ce contenu est piraté et ne doit pas être recommandé — [YouTube (contenu piraté, ne pas utiliser)](https://www.youtube.com/watch?v=pxnkVC-cu2E)
- Les quatre Tool Centers devaient être montrés en démonstration live sur le stand Cadwork04 de **Batimat 2026 (28 sept. – 1er oct. 2026, Paris Expo Porte de Versailles, stand H1-C050)** — [LinkedIn – Nicolas Quidet](https://www.linkedin.com/in/nicolas-quidet-cadwork04-work4cad/) ; [04.cadwork.com – Batimat](https://www.04.cadwork.com/salons/batimat/)
- Article de presse métier sur Cadwork04 intitulé « L'avenir de la construction bois passe par des outils intelligents » (titre vu seulement, contenu non lu) — [artisansbois.com](https://www.artisansbois.com/articles/cadwork-04-l'avenir-de-la-construction-bois-passe-par-des-outils-intelligents)

### Inferences
- Caddev est **française** : c'est une entité du groupe Work4Cad avec Cadwork04 (le « 04 » renvoie sans doute aux Alpes-de-Haute-Provence) et le site est en français. C'est une inférence forte, mais je n'ai pas trouvé d'adresse ni de SIREN.
- Caddev semble aussi développer ou co-développer l'add-on Opticargo commercialisé par cadwork (le texte Opticargo est sur `caddev.info/fr/products`). Cela reste non confirmé.
- Le « Steel Tools Center v4.1.3 » installé chez l'utilisateur est presque certainement le STC de cette famille. Il a dû être acheté via Cadwork04, qui distribue les Tool Centers.
- Développement sur mesure : Caddev se présente comme une société de « logiciels, web app, 3D et IA » et a déjà livré 4 à 5 modules cadwork. On peut en déduire qu'elle accepte des développements spécifiques, mais je n'ai trouvé aucune offre explicite. Le plus simple est de demander à Cadwork04 un « Tool Center » de type Container/bibliothèque façon SEMA.
- Ancrage en panneau gauche : l'API C++ de cadwork (`cwapi3dcpp`, « CwAPI3D plugin architecture ») est la voie la plus probable pour des panneaux natifs ancrés. Les scripts Python apparaissent plutôt comme des boutons de la barre de plugins (voir Q3). C'est une inférence, sans confirmation par une source Caddev.

### Gaps
- Aucun tarif, modèle de licence (perpétuelle, abonnement, par poste) ni prix des Tool Centers n'a été trouvé publiquement.
- Le mécanisme technique de l'ancrage des panneaux Caddev dans cadwork n'est documenté nulle part dans les sources trouvées.
- Aucune liste complète des produits Caddev : la page `caddev.info/fr/products` n'a pas pu être lue en entier.
- Aucune indication qu'un Tool Center de type « bibliothèque d'assemblages / Container » existe ou soit prévu. À demander directement à Cadwork04/Caddev.

## Q2 — Qu'est-ce que le « BIM Management Tool » dans cadwork ?

### Takeaway
C'est un **outil natif de cadwork** (BMT), pas un add-on tiers. C'est l'interface centrale pour les fichiers IFC et le workflow BIM : import multi-IFC, conversion en éléments cadwork, gestion des bâtiments et niveaux, BCF. Ce n'est **pas** une bibliothèque de composants. Il ne répond donc pas au besoin « Container SEMA ».

### Cited Findings
- La KB cadwork a une page « BIM Holzbau – BIM Management Tool » dans le manuel 3D-BIM — [kb.cadwork.ch – BIM Management Tool](https://kb.cadwork.ch/en/3d-bim/manual/1036/bim-management-tool)
- Le BMT est « l'outil central pour travailler selon la méthode BIM ». Tous les dialogues associés s'y ouvrent et tous les réglages s'y font. On l'ouvre par le menu Fenêtre ou par le bouton « Floor/BMT » — [kb.cadwork.ch – BMT](https://kb.cadwork.ch/en/3d-bim/manual/1036/bim-management-tool)
- Import de fichiers IFC par « + » ou glisser-déposer. L'import de plusieurs fichiers à la fois est possible avec la licence BIM Manager. Les objets IFC arrivent comme éléments liés et peuvent être convertis en éléments natifs cadwork, sauf les éléments invalides — [docs.cadwork.com – IFC import](https://docs.cadwork.com/projects/cwbim/en/latest/en/1.Import/import/)
- Le BMT gère l'appartenance aux bâtiments et aux étages. Depuis la version 27, il remplace l'ancienne structure d'étages basée sur les assemblages — [docs.cadwork.com – Storey manager](https://docs.cadwork.com/projects/cwbim/en/latest/en/2.Modellierung/storeymanager/)
- Le module « cadwork IFC / BIM-Manager » met en avant la gestion multi-IFC, le BMT et le support BCF — [cadwork.de – IFC / BIM-Manager](https://cadwork.de/en/modul/cadwork-ifc-bim-manager/)

### Inferences
- Le BMT ancré à gauche chez l'utilisateur est un panneau natif cadwork. Il montre que cadwork 2026 sait ancrer des panneaux dans son interface Qt (voir le passage à Qt6 en Q5). Rien ne dit en revanche que ce mécanisme soit ouvert aux plugins tiers.

### Gaps
- Je n'ai pas vérifié si la licence « BIM Manager » est incluse dans la licence de l'utilisateur ou si c'est une option payante. La page cadwork.de suggère un module séparé.

## Q3 — Existe-t-il un store, une marketplace ou un gestionnaire de plugins cadwork ? Autres éditeurs, bibliothèques fabricants, open source ?

### Takeaway
Je n'ai trouvé **aucun store ni marketplace officiel cadwork**. Le mécanisme standard est la **barre de plugins** (Fenêtre → Plugins) : chaque dossier de script dans `userprofile\3d\API.x64` y devient un bouton. Les plugins se font en **Python** (CPython embarqué) ou en **C++**. **Lua n'est plus supporté depuis la version 2026.** Côté bibliothèques, **Rothoblaas** cite CADWORK parmi les logiciels de sa bibliothèque BIM/CAO et **Knapp** figure dans les catalogues 3D cadwork. Je n'ai trouvé aucun équivalent tiers du « Container » SEMA (panneau bibliothèque avec vignettes).

### Cited Findings
- **Barre de plugins** : affichée via Fenêtre → Plugins. Chaque script y obtient un bouton au nom de son dossier. Les scripts doivent être placés dans `..\userprofile_XX\3d\API.x64`, avec un dossier par script et un fichier Python du même nom que le dossier. Python est le langage principal des plugins — [docs.cadwork.com – Getting Started (cwapi3dpython)](https://docs.cadwork.com/projects/cwapi3dpython/en/latest/get_started/) ; [kb.cadwork.ch – News: Plugins](https://kb.cadwork.ch/en/news/manual/1877/plugins)
- **Fin de Lua** : le support de Lua est complètement abandonné. Les plugins Lua ne fonctionneront plus avec la version 2026 — [kb.cadwork.ch – News: Plugins](https://kb.cadwork.ch/en/news/manual/1877/plugins)
- La doc indique que cadwork embarque **CPython 3.9.10** (cette page n'est peut-être pas à jour pour la 2026) — [docs.cadwork.com – Getting Started](https://docs.cadwork.com/projects/cwapi3dpython/en/latest/get_started/)
- **SDK officiels open source** (organisation GitHub `cwapi3d`) :
  - `cwapi3dpython` : interface Python, licence MIT, publiée sur PyPI sous le nom `cwapi3d` — [GitHub cwapi3d/cwapi3dpython](https://github.com/cwapi3d/cwapi3dpython) ; [PyPI cwapi3d](https://pypi.org/project/cwapi3d/)
  - `cwapi3dcpp` : interface C++ pour l'architecture de plugins CwAPI3D — [GitHub cwapi3d/cwapi3dcpp](https://github.com/cwapi3d/cwapi3dcpp)
  - `cwmath` : utilitaires de géométrie — [GitHub cwapi3d/cwmath](https://github.com/cwapi3d/cwmath)
  - `PythonConsole` : plugin qui ouvre une console Python interactive dans cadwork, à cloner dans `API.x64` — [GitHub cwapi3d/PythonConsole](https://github.com/cwapi3d/PythonConsole)
- Dernière version PyPI repérée : `cwapi3d 33.343.2` — [libraries.io – cwapi3d](https://libraries.io/pypi/cwapi3d)
- **pycadwork** (Michael Brunner, GitHub Brunner246) : wrapper orienté objet tiers au-dessus de cwapi3d. L'extrait de recherche mentionne Python 3.14+, ce qui contredit le CPython 3.9.10 de la doc officielle. À vérifier — [GitHub Brunner246/pycadwork](https://github.com/Brunner246/pycadwork) ; [GitHub Brunner246](https://github.com/Brunner246)
- Une vidéo YouTube montre la construction d'un plugin « DualExport » avec CwAPI3D Python — [YouTube – Building DualExport](https://www.youtube.com/watch?v=hn3AtHPqEqE)
- **Rhino.Inside cadwork 3D** existe comme application sur food4rhino : un pont Rhino/Grasshopper vers cadwork — [food4rhino – Rhino.Inside cadwork 3D](https://www.food4rhino.com/en/app/rhinoinside-cadwork-3d)
- **Buildagil** distribue une « app cadwork » réservée à Windows, qui s'ouvre depuis la barre de plugins de cadwork. Elle ne fonctionne pas avec les licences démo ou viewer — [knowledge.buildagil.com – Apps](https://knowledge.buildagil.com/en/article/1gekd1e/)
- **CADSOMA** (MERViSOFT) est une marketplace indépendante de plug-ins CAO lancée en avril 2023, multi-plateformes. Aucune source ne confirme que cadwork y est supporté — [aecmag.com – CADSOMA](https://aecmag.com/cad/cadsoma-amazon-for-add-on-tools/) ; [develop3d.com – CADSOMA](https://develop3d.com/cad/cadsoma-the-amazon-for-add-on-tools/)
- **Rothoblaas** : sa page BIM/CAD indique que ses produits sont disponibles dans les bibliothèques à jour des principaux logiciels de conception, **CADWORK compris** — [rothoblaas.com – BIM/CAD libraries](https://www.rothoblaas.com/bimcad)
- **Knapp** figure parmi les catalogues 3D de cadwork (catalogue, pas plugin) — [cadwork.com – catalogues](https://www.cadwork.com/indexL1.jsp?neid=12262)
- **Blum** (ferrures de menuiserie) a une page « CAD/CAM interface – software partners – cadwork » — [blum.com – cadwork](https://www.blum.com/no/en/services/industrial-production/cad-cam-interface/software-partners/cadwork/)
- Cadwork04 a une page « Extension – la création d'extensions impose des exigences CAO » (titre vu seulement, contenu non lu) — [en.04.cadwork.com – Extension](https://en.04.cadwork.com/extension/)

### Inferences
- Il n'y a ni store ni gestionnaire de plugins officiel. La distribution passe par une copie de dossiers dans `API.x64` ou par un installeur éditeur (cas probable de Caddev et Buildagil). Un add-on maison peut donc être déployé sur les deux postes de l'utilisateur via Git ou un dossier synchronisé vers `API.x64`.
- Si la version de paquet PyPI `33.343.2` suit le schéma `<version>.<build>`, l'API publique serait à la build 343. L'utilisateur est en build 298. C'est **une hypothèse non vérifiée** : la correspondance entre « 33 » et « 2026 » n'est confirmée par aucune source.
- Les bibliothèques des fabricants de connecteurs semblent livrées en **catalogues ou fichiers 3D** (Rothoblaas, Knapp), pas en panneau interactif. Un panneau type « Container » avec vignettes reste un manque à combler par un add-on maison, par exemple un plugin C++/Qt ou un dialogue Python.

### Gaps
- Je n'ai trouvé aucune source sur des bibliothèques ou plugins cadwork de **Simpson Strong-Tie, SFS, Würth, Pitzl, Sherpa, GH**. Ni confirmé ni infirmé.
- Je n'ai trouvé aucun autre éditeur de plugins suisse, allemand ou autrichien identifiable (au-delà de Buildagil et Rhino.Inside) dans le temps imparti.
- Je n'ai pas pu vérifier si l'API 2026 permet officiellement de créer des **panneaux ancrés** (dock widgets) depuis Python ou C++. C'est le point technique clé pour reproduire le Container SEMA.
- Le contenu exact de la page KB « News: Plugins » de la version 2026 n'a pas pu être lu (domaine bloqué).

## Q4 — Intégrations ERP, chiffrage, listes, BTLx et liaisons machines (spécificités France)

### Takeaway
cadwork couvre bien l'export **machine** (BTL/BTLx, BTLx 2.3, machine controller dans l'API) et l'**optimisation** (Opticargo pour le chargement, OptiPanneaux pour le débit de panneaux, avec import et export CSV/PDF). Je n'ai trouvé **aucun connecteur ERP ni outil de chiffrage/achat** documenté et nommé, notamment pour le marché français. La voie standard reste « liste cadwork, puis export CSV/Excel, puis ERP », ou un plugin API maison.

### Cited Findings
- La page « Interfaces » de la KB liste BTLx en import et export. L'export BTLxml est payant et couvre les versions 1.0 à 2.3. BTLx 2.3 sert à l'échange avec OptiPanel — [kb.cadwork.ch – News: Interfaces](https://kb.cadwork.ch/en/news/manual/1872/interfaces)
- La sortie BTLx 2.3 a été ajoutée aux exports machine SCM et « Panel prefab » — [kb.cadwork.ch – News: Interfaces](https://kb.cadwork.ch/en/news/manual/1872/interfaces)
- L'API Python fournit `export_btl` (version BTL et chemin) et un module « Machine Controller » pour le calcul et l'export des données de fabrication — [docs.cadwork.com – Machine Controller](https://docs.cadwork.com/projects/cwapi3dpython/en/latest/documentation/machine_controller/)
- **SoftXpert** (Suisse) vend une liaison BTL/BTLx vers n'importe quelle CN, compatible cadwork, SEMA, Dietrich's et hsbcad. C'est une liaison machine, pas ERP — [softxpert.ch – BTLx CNC](https://www.softxpert.ch/en/btlx-cnc-anbindung.php)
- **Opticargo** : un plugin récupère directement dans cadwork 3D la liste des éléments à charger. On peut ajouter des pièces externes par CSV. Le résultat revient dans le modèle 3D pour produire les plans — [04.cadwork.com – Opticargo](https://04.cadwork.com/opticargo) ; [en.04.cadwork.com – Opticargo](https://en.04.cadwork.com/opticargo-module-cadwork/) ; [woodpartners.fr – Opticargo](https://woodpartners.fr/produits/logiciel-bois/logiciel-calcul/opticargo-by-cadwork/)
- **OptiPanneaux** : optimisation du débit de panneaux. On importe la liste des panneaux, on obtient des résultats graphiques et en liste avec le pourcentage de chute, exportables en PDF. La saisie par CSV est possible sans CAO — [Dépliant OptiPanneaux (04.cadwork.com)](https://www.04.cadwork.com/wp-content/uploads/2024/09/cadwork_depliant_OptiPanneaux_version-FR.pdf)
- Cadwork04 a une page « Liste + plan d'atelier » — [en.04.cadwork.com – List + Shop drawing](https://en.04.cadwork.com/?p=2234)
- Une brochure cadwork de 2019 mentionne le besoin de « communication directe, par exemple ERP ou programmes de calcul de structure » — [Brochure cadwork 2019 (EN)](https://cadwork-cms-prod.s3.amazonaws.com/documents/Brochure_2019-en.pdf)
- Un blog français titré « Logiciel charpente bois : relier cadwork et ERP » existe (titre vu seulement, auteur et contenu non vérifiés) — [jaikin.eu – blog](https://www.jaikin.eu/blog/logiciel-production-charpente-bois)
- Un comparatif ZWSOFT de 2026 classe cadwork parmi les logiciels de charpente, avec Dietrich's et SEMA — [zwsoft.com – 8 logiciels charpente 2026](https://www.zwsoft.com/fr/blog/timber-frame-design-software)
- Brochures Cadwork04 mises à jour en février 2026 (construction, conception, menuiserie) — [cadwork-construction.pdf (02/2026)](https://www.04.cadwork.com/wp-content/uploads/2026/02/cadwork-construction.pdf) ; [cadwork-conception.pdf (02/2026)](https://www.04.cadwork.com/wp-content/uploads/2026/02/cadwork-conception.pdf)

### Inferences
- Pour une entreprise de charpente française, la brique « liste, puis prix et commande » doit très probablement être développée sur mesure : un plugin API qui lit les attributs et les listes et exporte vers Excel ou ERP. Aucun produit tiers clé en main n'a été identifié.
- Le blog jaikin.eu suggère qu'un acteur français propose ou commente une liaison cadwork–ERP. C'est une piste à creuser, pas un fait établi.

### Gaps
- Aucune source sur les interfaces machines Hundegger, Weinmann ou Krüsi spécifiquement. On sait seulement que BTL/BTLx est le format pivot.
- Aucun ERP français nommé avec une intégration cadwork documentée.
- Je n'ai pas pu vérifier le contenu de jaikin.eu (titre seul).

## Q5 — Actualités cadwork : versions 2026 et builds, 2027, événements, API, IA (focus 11 oct. – 11 nov. 2026)

### Takeaway
**Je n'ai trouvé aucune actualité cadwork datée des 30 derniers jours (11 oct. – 11 nov. 2026).** Les éléments les plus récents sont plus anciens : la sortie de **cadwork 2026** (interface migrée vers Qt6, mises à jour hebdomadaires recommandées via Live Update, fin des plugins Lua) et **Batimat 2026 (28 sept. – 1er oct. 2026)**, où Cadwork04 présentait les Tool Centers Caddev. Je n'ai trouvé aucune information publique sur une préversion ou une feuille de route cadwork 2027, ni sur des fonctions IA dans cadwork.

### Cited Findings — 30 derniers jours (11 oct. – 11 nov. 2026)
- **Aucun élément trouvé.** Plusieurs requêtes ont été lancées (« cadwork news November 2026 », « cadwork 2027 nouveautés octobre 2026 », « cadwork LinkedIn news October 2026 forum event AI ») : aucun résultat cadwork daté de cette période. Les pages d'actualité cadwork (`kb.cadwork.ch/en/news`, `cadwork.ca`) étaient inaccessibles dans cet environnement. Une actualité récente peut donc exister sans avoir été trouvée — [recherche : cadwork news November 2026, sans résultat pertinent]

### Cited Findings — plus anciennes (avant le 11 oct. 2026)
- **Batimat 2026, du 28 sept. au 1er oct. 2026**, Paris Expo Porte de Versailles. Cadwork04/Work4Cad sur le stand **H1-C050**, avec démo live de JTC, STC, CTC et OTC — [04.cadwork.com – Batimat](https://www.04.cadwork.com/salons/batimat/) ; [LinkedIn – Nicolas Quidet](https://www.linkedin.com/in/nicolas-quidet-cadwork04-work4cad/)
- **cadwork version 2026** (date exacte de sortie non trouvée) : nouvelle version pour l'usage quotidien, après environ un an de développement. Les menus et dialogues sont passés à **Qt6** parce que Qt5 ne sera plus maintenu — [cadwork.de – cadwork Version 2026](https://cadwork.de/en/knowledgebase/cadwork-version-2026/)
- La version 2026 est optimisée en continu. cadwork.de recommande de télécharger la dernière build via **Live Update, idéalement une fois par semaine**. Le numéro et la date de build s'affichent à l'écran de démarrage de chaque module — [cadwork.de – cadwork Version 2026](https://cadwork.de/en/knowledgebase/cadwork-version-2026/)
- **Plugins Lua** : plus fonctionnels en version 2026, Python devient la voie principale — [kb.cadwork.ch – News: Plugins](https://kb.cadwork.ch/en/news/manual/1877/plugins)
- cadwork North America propose une page de téléchargement de la version 2026 et une page de **bêtas** séparée (contenu non lu, domaine bloqué) — [cadwork.ca – Downloads](https://cadwork.ca/en/support/downloads/) ; [cadwork.ca – Beta downloads](https://cadwork.ca/en/support/beta-downloads/)
- cadwork North America annonce une formation cadwork de 2 jours à UBC Vancouver en **février 2027**. C'est un calendrier de formation, pas une annonce de version — [cms.cadwork.ca – Training events](https://cms.cadwork.ca/en/education/training-events/)
- Package API Python `cwapi3d` en version **33.343.2** sur PyPI (date de publication non vérifiée) — [libraries.io – cwapi3d](https://libraries.io/pypi/cwapi3d)
- 25 août 2025 : une session de formation cadwork chez McGill/Carleton (contexte académique, pas une nouveauté produit) — [McGill AEE Chair – cadwork training module](https://aeechair.research.mcgill.ca/en/news/cadwork-training-module)

### Inferences
- Avec la cadence « Live Update hebdomadaire », la build 298 de l'utilisateur n'est peut-être pas la plus récente. Il faut vérifier dans l'écran de démarrage ou dans Live Update. La valeur « 343 » du paquet PyPI suggère une build plus récente, mais c'est **non confirmé**.
- Comme les années précédentes, la version suivante (2027) sera probablement d'abord diffusée en bêta via les pages « beta downloads ». Je n'ai trouvé aucune date publique.

### Gaps
- Je n'ai trouvé aucune date ni numéro de build précis pour les service packs ou mises à jour de cadwork 2026.
- Je n'ai trouvé aucune préversion ou feuille de route cadwork 2027, ni annonce de fonctions IA chez cadwork. Seule Caddev se présente comme faisant de l'« IA », sans produit IA cadwork identifié.
- Je n'ai trouvé aucune information sur Holzbau-Forum, Eurobois ou un « cadwork Forum » 2026.
- Les posts LinkedIn de cadwork, cadwork France et Caddev n'ont pas pu être consultés directement.
