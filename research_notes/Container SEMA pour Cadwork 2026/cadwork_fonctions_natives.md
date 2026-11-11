# What cadwork 3D 2026 offers natively that comes closest to SEMA's "Container" side bar

> Research date: 2026-11-11. Scope: cadwork 3D 2025/2026 (the user runs 2026, build 298, French UI).
> **Method caveat (important for the report writer):** in this session, direct page fetches of `docs.cadwork.com` and `en.04.cadwork.com` were blocked by the sandbox network allowlist (DNS failure), so I did not open any page in full. Every finding below comes from **web-search result extracts** of the cited pages (mostly the official cadwork Knowledgebase `kb.cadwork.ch`, `cadwork.de`, `docs.cadwork.com`, and cadwork marketing pages). Wording and menu paths should be checked against the live KB before being quoted verbatim to the user. "Confirmed" below means "stated in an official cadwork source, as returned by search". "Inferred" means my reasoning, with no direct source.
> Release timing: cadwork.de announced that delivery of version 2026 had started (news page dated 28 April 2026). Since 2025 the release notes ("News" / "Neuerungen" / "Nouveautés") are only published online in the KB and updated over time — [cadwork.de, News cadwork Version 2026](https://cadwork.de/en/news-cadwork-version-2026-alle-infos-jetzt-verfuegbar/); [cadwork KB, News – Introduction](https://kb.cadwork.ch/en/news/manual).

---

## Q1. Is there a native dockable library/catalog panel in cadwork 2025/2026 (thumbnails, tree, drag & drop of objects, connectors, textures)? Exact name in FR/DE/EN.

### Takeaway
I found **no evidence of a single native dockable "library/container" panel** in cadwork 2025/2026 that matches SEMA's Container (tree + thumbnail grid + parameter panel + drag & drop). The native equivalent is **split across several functions**: the **Catalog explorer** opened by *Add → Catalog* (FR *Ajouter → Catalogue*, shortcut **N**; parametric variants with **Shift+N**), the **connector-axis catalog/database** with favorites, the **Variant** module, material/texture settings, and the **plugin bar** (*Window → Plugins*) for company tools. Native docked panels do exist (BIM Management Tool, the new 2026 "Bridge"), and third-party "Tool Center" plugins (like the user's *Steel Tools Center by Caddev*) also dock there, but none of the official sources describes a native docked catalog browser.

### Cited Findings
**Catalog explorer (*Add → Catalog* / *Ajouter → Catalogue*), the closest native "library"**
- 2025 news: "It is now possible to search for file names in the **Add → Catalog** menu. A filter field has been added above the explorer for this purpose." Matching files in the current directory **and its subdirectories** are listed, and a tooltip shows the full catalog file path. This confirms the catalog is a file **explorer** (folder tree of catalog files) opened from the *Add* menu, not a docked panel — [cadwork KB, News – Add and Delete](https://kb.cadwork.ch/en/news/manual/1780/add-and-delete)
- 2025 news: catalog elements can be inserted **mirrored** around the insertion point: the preview shows the mirrored element after pressing **S** then **X** (symmetry about the X axis), so it does not have to be moved after insertion — [cadwork KB, News – Add and Delete](https://kb.cadwork.ch/en/news/manual/1780) (index 3-12/3-14 per search extract)
- When a catalog file is added, its handle/insertion definition can be chosen with **"Configure catalog" (Ctrl + Alt + A)** — [cadwork KB, News – Tools](https://kb.cadwork.ch/en/news/manual/1826) (per search extract; page title as returned)
- **Supplied catalogs vs user catalogs:** supplied catalogs are no longer installed in the user-modifiable location but in a fixed, write-protected location; user catalogs are kept separate so supplied catalogs can be updated without overwriting company ones — [cadwork KB, News – Tools](https://kb.cadwork.ch/en/news/manual/1826). *Conflict on the version:* one search extract dated this to the 2026 news, another to "Version 26"; treat the exact version as unverified.
- Catalog folders for the explorer are set via default folder settings; the catalog **converter** picks up all `*.3dc` and `*.3d` files in a folder and its subfolders — [cadwork KB, Installation – Catalog conversion](https://kb.cadwork.ch/3d_cadwork_installation/manual/1755)
- Older French training booklet (cadwork **V25**, ~2020, *older than target*): lists **Élément standard / Catalogue / Variante** as distinct functions, with shortcut **N** = add a catalog element and **Shift+N** = add a catalog variant — [Cecobois, Livret Formation Cadwork (V25)](https://cecobois.com/wp-content/uploads/2020/10/Livret-Formation-Cadwork-Cecobois.pdf)
- Older French 3D manual: a catalog element can be placed in 3D or in the 2D elevation view — [Manuel 3D cadwork (FR, yumpu copy, old version)](https://www.yumpu.com/fr/document/view/17577608/manuel-3d-16-05-09-fr2d-cadwork-2d/33)
- 2020 (V27, *older*): "Katalogverwaltung" (catalog management) is under **Userprofil**; favorites are set by clicking a star and favorites appear at the top of the list — [cadwork.de, Kompendium Version 27 (2020)](https://cadwork.de/wp-content/uploads/2021/08/Kompendium-cadwork-Version-27.pdf)

**Native docked panels that do exist (show cadwork has a dock area)**
- **BIM Management Tool (BMT)** — native, opened via **Window → BIM Management Tool** (FR presumably *Fenêtre → BIM Management Tool*) or the "Storey/BIM Manager" button; shows a tree (IFC hierarchy or by IFC type), storeys/buildings; used as floor manager since V27. The BIM Manager module must be in the purchased package — [cadwork KB, holzbau 1036](https://kb.cadwork.ch/holzbau/manual/1036); [cadwork-bim docs, Storey manager](https://cadwork-bim.readthedocs.io/de/latest/en/2.Modellierung/storeymanager/); [cadwork 04, BIM Management Tool](https://04.cadwork.com/modules/bim-management-tool/?lang=en)
- **"Bridge" (new in 2026)** — a new shop-drawing tool **docked to the left of the graphics area**; it checks whether exported drawings still match the 3D model and highlights outdated drawings — [cadwork KB, News 2026 – General](https://kb.cadwork.ch/en/news/manual/1840/general) (per search extract)
- 2026: the whole framework (menus and dialogs) moved from **Qt5 to Qt6** — [cadwork KB, News – Introduction](https://kb.cadwork.ch/en/news/manual)

**What sits in the user's left dock**
- **Steel Tools Center (STC)**: a cadwork-04 (French-speaking cadwork) brochure presents STC as a modeling tool "integrated into cadwork as a TOOL CENTER", follow-on to ATAC, aimed at sheet metal (flashings, roof coverings) — [cadwork 04, cadwork-stc.pdf (Feb 2026)](https://www.04.cadwork.com/wp-content/uploads/2026/02/cadwork-stc.pdf). The user's screenshot shows "Steel Tools Center by Caddev v4.1.3". **Caddev** is a plugin vendor whose product page lists cadwork plugins such as C-CONNECT — [Caddev, produits](https://www.caddev.info/fr/products). So STC is a **partner/third-party plugin**, not core cadwork.
- Sister product **JTC – Joinery Tools Center** (*"le centre d'outils de l'agenceur et du menuisier"*): free 3D plugin for cadwork V28+, a carcass/furniture generator with modules including "07 – Générateur d'assemblages", and catalogues of Lamello P-System, dowels (tourillons), screws, eccentrics, Cabineo, Domino — [cadwork 04, JTC](https://www.04.cadwork.com/jtc-module-cadwork/); [cadwork.de, Korpusgenerator JTC](https://cadwork.de/en/joinery-tools-center/); [Vimeo, JTC 07 Générateur d'assemblages](https://vimeopro.com/cadwork/joinery-tools-center/video/439231985)

### Inferences
- **No 1:1 native equivalent.** The nearest native equivalent of SEMA's *Container* is **Ajouter → Catalogue (N)**: a folder tree of `.3dc` catalog files with a filter field (2025) and insertion preview, launched as a modal explorer and **not a permanently docked panel**. Insertion is done by choosing a file then picking a point in the model (with preview/mirroring), **not drag & drop** from a grid.
- **Mapping of SEMA Container tabs → cadwork 2026 (inferred):**
  | SEMA Container tab | Closest cadwork 2026 native function |
  |---|---|
  | Données souches Conteneur (library tree of objects: Objets 3D, connecteurs métalliques Simpson/Rothoblaas/Knapp/Hilti…) | *Ajouter → Catalogue* (N) on the supplied and company `.3dc` catalogs, plus manufacturer catalogs (Simpson, Rothoblaas, Hilti HCW…) and the connector-axis catalog (VBA) for fasteners |
  | Raccord > Type d'extrémité (mi-bois, tenon, queue d'aronde…) | Native joint/processing commands (usinages/assemblages) with saved parameters, the "pre-parameterised joint library" mentioned in the brochure (Q2), and variants. Not a thumbnail library |
  | Mes assemblages | Company `.3dc` catalog files in the user-catalog folder, plus **Variantes** (parametric, Shift+N), plus connector-axis favorites |
  | Textures bois | Materials (with textures) + *Modifier → Texture/Transparence* (Q3) |
  | Centre de contrôle / Gestionnaire de chargement | No direct equivalent found. BMT (dock) is the nearest "tree of the model" panel |
- The left dock in the user's screenshot (BMT + Steel Tools Center) shows that cadwork 2026 **does support dockable side panels** and that partner plugins (Caddev "Tool Centers") can dock there. A dockable, thumbnail-based company library is therefore technically achievable **as a plugin** (Caddev-type Tool Center, or an in-house Python/PyQt6 plugin; see Q4), not as a stock feature.

### Gaps
- I could not confirm (page fetch blocked) whether the *Ajouter → Catalogue* explorer shows **thumbnails/previews of `.3dc` files** in the file list, or only file names plus a 3D insertion preview. Check the KB page "Add → Catalog" in the FR KB or in the software.
- Exact **French menu labels** in 2026 (*Ajouter → Catalogue*, *Fenêtre → Plugins*) are translations inferred from the EN KB and the older FR booklet, not read from the FR 2026 KB.
- No source found on **drag & drop** from any native cadwork panel into the 3D model.
- No official source describes a native "Shop of components", "3D-Bibliothek" panel or "Bauteilkatalog" dock in 2025/2026; the terms returned nothing cadwork-specific.

---

## Q2. How are reusable assemblies/connectors (sabots, équerres, boulons, tenon-mortaise, mi-bois) stored and reused natively?

### Takeaway
Natively there are three mechanisms: (1) **catalog files `.3dc`** (static 3D objects/sub-assemblies such as sabots and équerres, including manufacturer libraries) inserted with *Ajouter → Catalogue*; (2) **connector axes** (*Verbindungsmittelachse*, VBA; EN "connector axis") with a connector/item catalog and database, where 2025 added **favorites (star)**; (3) the **Variante** module for parametric reusable objects (license needed to create, not to use). Carpentry joints (tenon-mortaise, mi-bois, queue d'aronde) are **processing operations** (usinages) applied by commands, not library items. Caddev's **C-CONNECT** plugin extends connector-axis management.

### Cited Findings
**Manufacturer hardware catalogs**
- cadwork object libraries include a wide range of hardware from Rothoblaas, Soltech, Simpson and others, and a hardware list can be generated from them. *Old page (~15 years)* — [cadwork.com, Ampio catalogo di ferramenta (IT)](https://cadwork.com/indexL1.jsp?did=4443); see also [cadwork, Catalogues 3D cadwork](https://www.cadwork.com/indexL1.jsp?neid=12262)
- Simpson Strong-Tie France offers technical drawings / a 3D catalogue compatible with cadwork (in the "Ressources" tab), alongside catalogues for other software — [Simpson.fr, Du nouveau côté logiciels de dessin](https://www.simpson.fr/fr-FR/actualites/du-nouveau-cote-logiciels-de-dessin)
- French tutorial "Insertion d'éléments Simpson directement depuis le web" (cadwork SA tips & tricks; title only seen) — [toutlebim.fr](https://www.toutlebim.fr/livres-blancs-tutoriels-video/articles-techniques/fiche/trucs-et-astuces-cadwork-insertion-delements-simpson-directement-depuis-le-web.html); video "Utilisation de plans Simpson sur Cadwork" — [YouTube](https://www.youtube.com/watch?v=B71ETo_7fwM)
- 2025 "Neuerungen" videos list "Katalogelemente für **Hilti HCW** und **P2P**" as a topic — [cadwork.swiss, Neuerungen Version 2025](https://cadwork.swiss/docs/neuerungen-version-2025/); [cadwork.swiss, cadworkipedia](https://cadwork.swiss/support/cadworkipedia/)

**Connector axes (VBA), the native "connecteurs" system**
- 2025: connector-axis dialogs renamed; **connectors and connector items can be saved as favorites with the star symbol** — [cadwork KB, News – Connector axis](https://kb.cadwork.ch/en/news/manual/1788/vba)
- Favorites exist for the **connector catalog, connector items, drilling definition and the connector-axis database**; in the **Favorites tab** the whole folder structure opens so favorites are visible in their subfolders — [cadwork KB, News – Connector axis](https://kb.cadwork.ch/cadwork_news_documentation/manual/1788)
- 2025: connector axes are shown with all their connectors/items as a **transparent preview** with *Copy → Divide*; a negative remaining length (connector shorter than clamping length) is shown in red; connector-axis user data **Info 1–10** is available in all shop-drawing exports; LOD "Performance" for files with many axes — [cadwork KB, News – Connector axis](https://kb.cadwork.ch/en/news/manual/1788/vba)
- SP2024 (V30): connector items in the 3D file can be updated with a button; VBA drilling display reworked for speed — [cadwork.de, News Version 30 SP2024 (PDF)](https://cadwork.de/wp-content/uploads/2024/02/News-Version-30-SP2024.pdf) (via search extract)
- 2026: video "V2026 VBA" — automatic screw selection using the next shorter standard length (title/description only) — [YouTube, V2026 VBA](https://www.youtube.com/watch?v=_dltq4QeQIE)
- 2026 connector axis news page exists — [cadwork KB, News – Connector axis (2026)](https://kb.cadwork.ch/en/news/manual/1838/connector-axis) (content not read)

**C-CONNECT (Caddev plugin, distributed by cadwork 04)**
- "La nouvelle référence cadwork pour créer, gérer et automatiser les **axes de connexion** bois-bois et bois-métal"; **métal-métal new in 2026** — [Eurobois listing, C-CONNECT Plugin cadwork](https://www.eurobois-events.com/fr/offering/38926eae-fcfc-f011-832e-6045bd95454f/c-connect-plugin-cadwork)
- Settable: number, diameter, colour of connectors, spacings (entraxes), edge distances (pinces) — [cadwork 04, cadwork-c-connect.pdf (Feb 2026)](https://www.04.cadwork.com/wp-content/uploads/2026/02/cadwork-c-connect.pdf)
- Caddev product page: helps position dowel-type (*à tige*) fasteners quickly while respecting Eurocodes — [Caddev, produits](https://www.caddev.info/fr/products)

**Variants (*Variantes*), parametric reusable objects**
- The **Variante** module defines an element once with geometric parameters (user-editable variables such as roof pitch or post section, linked by formulas); it can produce a complete frame with all joint details; a catalog of truss variants is supplied as an example; **a license is only needed to create variants, not to use them** — [cadwork.ca, Module Variante (FR)](https://cadwork.ca/fr/modules/variante/); [cadwork.ca, Variant (EN)](https://cadwork.ca/en/modules/variant/); [cadwork.com, Variante](https://en.cadwork.com/cwen/Solutions_csJRjSDw_TTLT3GAN)
- Variants are used for door/window openings, and the stair module relies on variant files (V25 booklet, older) — [Cecobois booklet](https://cecobois.com/wp-content/uploads/2020/10/Livret-Formation-Cadwork-Cecobois.pdf)

**Joint library (tenons, mi-bois…)**
- cadwork France brochure: a **pre-parameterised joint library** ensures production details are passed correctly to machining centres — [cadwork 04, Brochure 2023](https://www.04.cadwork.com/wp-content/uploads/2024/09/Brochure-2023-B-light.pdf) (via search extract)
- Batiproduits product sheet: cadwork has a "**bibliothèque d'assemblages personnalisable**" — [Batiproduits, cadwork](https://www.batiproduits.com/fiche/produits/logiciel-global-cfao-pour-construction-bois-cad-p181263690.html) (aggregator / marketing)

**Plugins as automation for connectors**
- KB plugins page example: a plugin that automatically places the right type and number of connectors/brackets when bottom plates exceed a given length — [cadwork KB, News – Plugins](https://kb.cadwork.ch/en/news/manual/1825/plugins)

### Inferences
- For CCM's **sabots / équerres / boulons**: the native path is to store them as company `.3dc` **catalog** files (or use manufacturer catalogs) and insert with **N**, or to model them as **connector axes** with the connector catalog plus **favorites** (closest to SEMA "Mes assemblages" for fasteners).
- For **mi-bois / tenon-mortaise / queue d'aronde**: in cadwork these are joint/processing commands with saved parameter sets, not a browsable thumbnail library like SEMA's *Raccord > Type d'extrémité*. Reusable "joint + parts" combinations are best stored as `.3dc` catalog pieces or as **Variantes**.
- C-CONNECT (Caddev) is the most "container-like" add-on for fasteners, but it is a partner plugin (check license / availability in France with cadwork 04).

### Gaps
- No official 2026 source found describing the exact French names (*Axe de connecteur*? *Axe d'assemblage*? C-CONNECT uses "axes de connexion") or the menu path of the connector-axis catalog in the FR UI.
- I could not find whether cadwork offers a **native thumbnail browser of joints** (tenon, mi-bois…). Not found in 2025/2026 news extracts.
- I could not confirm whether **Knapp / Rothoblaas / Simpson catalogs are supplied with the 2026 install** (only the old IT page and the Simpson.fr page say so).

---

## Q3. How are materials/textures managed (material manager / texture database)?

### Takeaway
Textures in cadwork hang off **materials** (each material can carry a texture) and can be overridden per element via **Modifier → Texture/Transparence** (FR naming confirmed in the FR KB). There is no evidence of a thumbnail "Textures bois" panel like SEMA's. External texture libraries (mtextur) integrate with cadwork.

### Cited Findings
- FR KB (news): the dialog **Modifier → Texture/Transparence** was reworked with new **"Supprimer"** buttons for texture and colour; "Supprimer texture" restores **the texture defined by the material**, while colour, X/Y zoom and transparency values are kept — [cadwork KB (FR), Nouveautés – Modifier](https://kb.cadwork.ch/fr/news/manual/1783/modifier)
- cadwork (agencement intérieur page): realistic textures and finishes, including wood; each material can be incorporated and configured as needed — [cadwork 04, Agencement intérieur](https://www.04.cadwork.com/agencement-interieur/)
- The layers of **multilayer shells** now display their material textures as volumes in every view (2025/2026 news, per search extract) — [cadwork KB, News – Introduction](https://kb.cadwork.ch/en/news/manual)
- cadwork exports geometry, **textures** and axis directions directly to **Artlantis** for rendering without redefining materials — [cadwork.com, Architecture](https://www.cadwork.com/cwen/Solutions/Architecture); demo video (FR) — [YouTube, Rendu réaliste avec cadwork et Artlantis](https://www.youtube.com/watch?v=au0UgXjxpio)
- **mtextur** (Swiss CAD/BIM texture database) states that manufacturers' textures plus material properties can be integrated directly into cadwork (marketing, third party) — [mtextur](https://www.mtextur.com/posts?locale=en); Innovus CAD data lists cadwork with a direct mtextur interface and manual texture import — [Sonae Arauco, CAD data](https://www.sonaearauco.com/services/cad-data/)

### Inferences
- The SEMA "Textures bois" tab maps to the cadwork **materials list (with texture per material)** plus *Modifier → Texture/Transparence* for overrides. The companion tool is probably the material/attribute catalog in the **userprofile catalog management** (*Katalogverwaltung*, V27), not a visual docked gallery.

### Gaps
- I did not find an official 2025/2026 page naming a "**Gestionnaire de matériaux**" / "Materialverwaltung" dialog, its menu path, or whether it shows texture thumbnails. Needs checking in the FR KB or the software (likely under the material attribute dialog / userprofile catalog management).
- Where the texture image files live in the 2026 userprofile was not found.

---

## Q4. What is the native "plugin bar" and docking capability for user tools; can users customize toolbars and shortcuts?

### Takeaway
Yes: cadwork has a native **plugin bar** shown via **Window → Plugins** (FR presumably *Fenêtre → Plugins*). Each Python plugin folder in `userprofile\3d\API.x64` appears as a button (custom 30×30 icon, hover description). 2025 moved to Python 3.12 and 2026 to **Python 3.14 + Qt6/PyQt6** (Lua dropped). Shortcuts: function keys (F-keys) are user-assignable and kept across upgrades. 3Dconnexion buttons can be mapped to cadwork functions (2025). This is the realistic native route to a CCM "container".

### Cited Findings
- **Plugin bar**: scripts to be callable from the plugin bar go in `..\userprofile_XX\3d\API.x64`; show it via **Window → Plugins**; each plugin appears as a button named after its folder — [cadwork Python docs, Getting Started](https://docs.cadwork.com/projects/cwapi3dpython/en/latest/get_started/)
- Icon: file `Icon.png` or `Icon.svg`, scaled to ~30×30 px, in the plugin folder; a `plugin_info.xml` adds a hover description — [cadwork Python docs, Getting Started](https://docs.cadwork.com/projects/cwapi3dpython/en/latest/get_started/)
- Debugging: a console can be enabled in user settings ("User Test") — [cadwork Python docs, Debugging](https://docs.cadwork.com/projects/cwapi3dpython/en/latest/debug/)
- Command line: `/PLUGIN=` runs a registered plugin right after a file opens; `/RUNPROGRAM` runs a plugin from any directory — [cadwork Python docs, Command line](https://docs.cadwork.com/projects/cwapi3dpython/en/latest/command_line/)
- Utility API offers e.g. `get_plugin_path()` — [cadwork Python docs, Utility Controller](https://docs.cadwork.com/projects/cwapi3dpython/en/latest/documentation/utility_controller/)
- **2025**: Python **3.12** supported — [cadwork KB, News – Plugins (2025)](https://kb.cadwork.ch/en/news/manual/1825/plugins)
- **2026**: Python is the main plugin language; interpreter updated to **3.14**; **Lua support discontinued** (Lua plugins no longer work in 2026); scripts using Qt/PyQt5 must be updated to **Qt6/PyQt6**; several bundled plugins rebuilt for PyQt6 — [cadwork KB, News – Plugins (2026)](https://kb.cadwork.ch/en/news/manual/1877/plugins)
- Example community plugin: PythonConsole (interactive REPL), installed by cloning into `API.x64`, launched from the plugin bar — [GitHub, cwapi3d/PythonConsole](https://github.com/cwapi3d/PythonConsole)
- **Shortcuts**: in 2026 the perspective view can be toggled with a **configurable F-key** — [cadwork KB, News – Introduction](https://kb.cadwork.ch/en/news/manual); upgrading to 2026 copies the existing *userprofil* folder, so settings and **function-key assignments** carry over — [cadwork KB, Installation procedure V2026](https://kb.cadwork.ch/en/installation/manual/1786/installation-procedure-v2026)
- 2025: cadwork functions can be assigned directly to any button on **3Dconnexion** devices — [cadwork KB, News – Installation, Setup, Hardware](https://kb.cadwork.ch/en/news/manual/1828)
- Native default shortcuts (N = catalog element, Shift+N = catalog variant; older booklet) — [Cecobois booklet](https://cecobois.com/wp-content/uploads/2020/10/Livret-Formation-Cadwork-Cecobois.pdf)
- Native dock windows confirmed: BIM Management Tool (Window menu) and 2026 "Bridge" docked left of the graphics area — see Q1 sources ([KB holzbau 1036](https://kb.cadwork.ch/holzbau/manual/1036); [KB News 2026 – General](https://kb.cadwork.ch/en/news/manual/1840/general))

### Inferences
- The user's custom **"_CCM_data"** button in the top bar is most likely a **plugin-bar entry** (a Python plugin folder in `API.x64`) or an F-key/toolbar assignment. That is the same mechanism that could host a home-made "CCM library" (tree + thumbnails of the company `.3dc` catalog + insertion via the cadwork Python API). With Qt6/PyQt6 in 2026, a plugin can display a rich window. The user's screenshot (STC by Caddev docked as a tab beside BMT) suggests plugins can also **dock** in the left area, but I found no official API documentation of docking for user plugins.
- CCM should check that any existing plugins (e.g. "_CCM_data") were migrated to Python 3.14 / PyQt6 (Lua and PyQt5 plugins break in 2026).

### Gaps
- No official source found on **customizing toolbars/ribbons** (adding or removing buttons, custom toolbars) in cadwork 3D 2025/2026, nor the exact FR name of the shortcut/F-key configuration dialog.
- No official API doc found on whether a Python plugin can create a **docked** panel (vs a floating Qt window), or on drag & drop from a plugin window into the 3D view.

---

## Q5. What did the cadwork 2025 and 2026 release notes add in this area (catalogs, connectors, UI docking)?

### Takeaway
2025 brought incremental catalog/connector improvements (catalog **filename filter**, mirrored insertion, connector-axis **favorites**, VBA previews and data); 2026 brought the **Qt6** UI migration, **Python 3.14** plugins (Lua dropped), a docked **"Bridge"** shop-drawing panel, separation of supplied/user catalogs, and VBA screw automation. **No release note found introduces a docked catalog/library browser** comparable to SEMA's container.

### Cited Findings
**2025**
- *Add → Catalog*: filter field above the explorer, recursive filename search, full-path tooltip; mirrored insertion of catalog elements (S, X) — [KB News – Add and Delete](https://kb.cadwork.ch/en/news/manual/1780/add-and-delete)
- Connector axis: renamed dialogs, **favorites (star)** for connectors/items/drilling definition/connector-axis DB, Favorites tab with folder structure, transparent preview on Copy → Divide, negative remaining length in red, Info 1–10 in shop drawings, LOD Performance — [KB News – Connector axis](https://kb.cadwork.ch/en/news/manual/1788/vba)
- Catalog elements for Hilti HCW and P2P (video topic) — [cadwork.swiss, Neuerungen 2025](https://cadwork.swiss/docs/neuerungen-version-2025/)
- Python 3.12; 3Dconnexion button mapping — [KB News – Plugins](https://kb.cadwork.ch/en/news/manual/1825/plugins); [KB News – Installation, Setup, Hardware](https://kb.cadwork.ch/en/news/manual/1828)
- BIMteam viewer: attributes and attribute groups can be starred as favorites — [KB News – BIMteam](https://kb.cadwork.ch/en/news/manual/1823)

**2026**
- Framework (menus and dialogs) on **Qt6**; optional Sentry crash reporting — [KB News – Introduction](https://kb.cadwork.ch/en/news/manual)
- **Bridge**: new shop-drawing tool **docked left of the graphics area** — [KB News 2026 – General](https://kb.cadwork.ch/en/news/manual/1840/general)
- Supplied catalogs in a fixed, write-protected location, user catalogs separate (version attribution conflicting, see Q1) — [KB News – Tools](https://kb.cadwork.ch/en/news/manual/1826)
- Plugins: Python 3.14, Lua dropped, PyQt6 — [KB News – Plugins (2026)](https://kb.cadwork.ch/en/news/manual/1877/plugins)
- PDF objects usable as 3D modelling references; perspective toggle on a configurable F-key — [KB News – Introduction](https://kb.cadwork.ch/en/news/manual)
- VBA: automatic screw selection (next shorter standard length) — [YouTube, V2026 VBA](https://www.youtube.com/watch?v=_dltq4QeQIE); other 2026 videos: 2D scenes, point clouds — [YouTube, V2026 2d Szene](https://www.youtube.com/watch?v=sQcxOHJgPEQ); [YouTube, V2026 Pointcloud](https://www.youtube.com/watch?v=VxZLobmfiM4)
- Windows 11 (Pro/Home/Enterprise) supported; Windows 10 support dropped as planned — [KB Installation procedure V2026](https://kb.cadwork.ch/en/installation/manual/1786/installation-procedure-v2026); [cadwork.de, cadwork Version 2026](https://cadwork.de/en/knowledgebase/cadwork-version-2026/)
- C-CONNECT (Caddev): metal-to-metal connections new in 2026 — [Eurobois, C-CONNECT](https://www.eurobois-events.com/fr/offering/38926eae-fcfc-f011-832e-6045bd95454f/c-connect-plugin-cadwork)
- MyCadwork platform got a fully new version (reworked UI, skills self-assessment, user forum, video tutorials); undated in the extract, seen on the cadwork 04 EN site — [cadwork 04, MyCadwork (p=14948)](https://en.04.cadwork.com/?p=14948)

### Inferences
- The 2026 dock "Bridge" plus the Qt6 move suggest cadwork is moving toward docked panels, but a docked catalog browser has **not** been announced (as far as search extracts show). This is worth asking cadwork France/04 support directly.

### Gaps
- I could not read the full 2026 KB news pages (fetch blocked); the full list of 2026 "Add/Catalog" and "Connector axis" changes may contain more relevant items.
- The exact cadwork 2026 build history (build 298) and any service-pack additions after April 2026 were not found.

---

## Q6. How do French-speaking SEMA→cadwork migrants handle this (forums, YouTube, cadwork France trainings)?

### Takeaway
I found **no public forum thread, video or article specifically about replacing SEMA's Container in cadwork**. Available French sources are general comparisons and trainings. The practical patterns that show up are company catalogs and plugins (cadwork 04 / Caddev "Tool Centers", C-CONNECT, manufacturer catalogs) and formal training.

### Cited Findings
- French 2026 comparison: Dietrich's, SEMA and cadwork all serve traditional carpentry and workshop production — [ZWSoft, 8 logiciels pour charpente à comparer en 2026](https://www.zwsoft.com/fr/blog/timber-frame-design-software) (vendor blog, competitor)
- Forum: one company uses SEMA for frame calculation and cadwork for modelling (mixed use, not migration) — [forumconstruire.com, Logiciel pour plan charpente](https://www.forumconstruire.com/construire/topic-160022.php)
- Migration risk: projects fail when carpenters must change CAD or keep a temporary double entry — [Jaikin, Logiciel charpente bois : relier cadwork et ERP](https://www.jaikin.eu/blog/logiciel-production-charpente-bois) (vendor blog)
- Training: Compagnons du Tour de France "CADWORK – Niveau 1 : initiation" (35 h over 5 days) and a level 2 — [Compagnons du Tour de France](https://compagnonsdutourdefrance.org/formations/fiche/186/)
- cadwork 04 (French-speaking cadwork) offers carpentry-specific modules/plugins: Charpente, C-CONNECT, ATAC (links to the *catalogue bois construction*), STC, JTC, C-Faster — [cadwork 04, Charpente](https://www.04.cadwork.com/charpente-module-cadwork/); [cadwork-atac.pdf](https://www.04.cadwork.com/wp-content/uploads/2026/02/cadwork-atac.pdf); [C-Faster](https://www.04.cadwork.com/c-faster-module-cadwork/)
- Simpson provides plans for both SEMA and cadwork, which eases moving a hardware library — [Simpson.fr](https://www.simpson.fr/fr-FR/actualites/du-nouveau-cote-logiciels-de-dessin)
- Older French tips page with cadwork shortcuts (e.g. C = cut, W = rotate around the longitudinal axis); older, unofficial — [Astuces Cadwork (philippe.berger2.free.fr)](http://philippe.berger2.free.fr/Bois/Ressource/Cadwork/Astuces%20Cadwork.htm)

### Inferences
- The likely recommendation from cadwork France/04 for a SEMA migrant who wants a "container" is: (1) build a **company catalog folder tree** of `.3dc` files (sabots, équerres, assemblages types) used through *Ajouter → Catalogue* + filter; (2) use **connector axes + favorites** (or **C-CONNECT**) for fasteners; (3) **Variantes** for parametric pieces; (4) **F-keys and plugin-bar buttons** for quick access; (5) possibly a Caddev "Tool Center"-style docked plugin for a visual library. This is inferred and should be confirmed with cadwork 04 support or MyCadwork forum.

### Gaps
- No French YouTube video or forum thread specifically on "équivalent du conteneur SEMA dans cadwork" was found.
- The MyCadwork user forum (login likely required) was not searchable from here.
- No cadwork France training syllabus detailing the catalog/library module was found.
