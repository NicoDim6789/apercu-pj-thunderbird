# Automating data outputs in cadwork 3D 2026: lists, cutting sheets, quantities, pricing, purchase orders, CCM (Supabase) sync

> Research date: 2026-11-11. Target: cadwork 3D 2026 (v33), user on build 298.
> **Source access note:** docs.cadwork.com, kb.cadwork.ch, cadwork.de, fr.04.cadwork.com and supabase.com could not be fetched from this session (DNS blocked). Those hosts would have to be allowed in the session's network settings to read them in full. To work around this, the **official cwapi3d Python repo was cloned from GitHub** (`cwapi3d/cwapi3dpython`, HEAD `37565d1`, committed 2026-11-11, package `cwapi3d 33.397.17`). Its `.pyi` stubs and `docs/` folder are the primary source of the published docs.cadwork.com pages, so API claims below are **confirmed from first-party source**. Claims about native GUI features (List module, shop drawings) rely on **search-engine snippets** of cadwork pages and are marked as such.
> GitHub file links below use the `main` branch of https://github.com/cwapi3d/cwapi3dpython. The docs.cadwork.com page for each controller follows the pattern `https://docs.cadwork.com/projects/cwapi3dpython/en/latest/documentation/<controller>/`.

---

## Q1. Native cadwork capabilities (2025/2026): production lists, list templates, attributes, export formats, shop drawings, BTL/BTLx, prices/costing, quantities

### Takeaway
Natively, cadwork covers the core of the chain. The List module produces part, production and assembly lists, numbers positions, optimises bars and exports CSV/TXT/XLSX. The Shop Drawing / DPP modules generate shop drawings automatically, including piece-by-piece drawings, and the machine exports produce BTL/BTLx/Hundegger/Weinmann files. Materials carry a price and a price unit. I found **no evidence of a native costing (devis/Kalkulation) module or a purchase-order/supplier module**, so pricing and purchase orders must be built outside cadwork (scripts + CCM).

### Cited Findings
**List module (Liste de production / Liste de pièces / Stückliste)**
- The cadwork List module "makes a distinction between 3 different lists: parts, production and assembly", and all list data "are available in other formats like Excel" (search snippet) — [en.cadwork.com List module](https://en.cadwork.com/indexL1.jsp?did=433)
- The List module "enables to assign/calculate element type specific position numbers in cadwork 3d and to generate/export various lists from there". Lists can be exported "as *.csv, *.txt or *.xlsx file type". The manual covers header settings, page layout and "saving and loading format pattern settings", i.e. reusable list templates (search snippets) — [kb.cadwork.ch List module manual 1745](https://kb.cadwork.ch/list_module/manual/1745)
- Lists are generated from the right-hand "Export Lists" menu and include production, item, optimisation and assembly lists (search snippet) — [kb.cadwork.ch List module manual 1757](https://kb.cadwork.ch/list_module/manual/1757)
- A "linear optimization engine" groups bars into long lengths (bar optimisation / optimisation de débit) (search snippet; exact source page among the cadwork.com List/DPP pages) — [04.cadwork.com List-DPP](https://04.cadwork.com/modules/list-dpp/?lang=en); [en.04.cadwork.com List + Shop drawing](https://en.04.cadwork.com/?p=2234)
- The API exposes the same list families, which confirms the native list types: production list, part list, cover list ("wall, roof or floor list") and container list. All of them require the "cadwork 3D list license" — [list_controller stub](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/list_controller/__init__.pyi)
- List numbering uses "calculation settings" (comparison criteria for production/part numbers) saved in the document and loadable from an XML file — [list_controller stub](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/list_controller/__init__.pyi)
- The FR cadwork brochure (Feb 2026) describes the chain "Concevoir, Listes de débitages, Optimisation, Plans de fabrication et plan de pose, Pilotage machine" — [cadwork menuiserie PDF (2026-02)](https://www.04.cadwork.com/wp-content/uploads/2026/02/cadwork-menuiserie.pdf)
- A French training booklet (Cecobois, 2020, **older**) covers "Vérification du modèle, Export 2D basique, Liste d'éléments et optimisation" — [Livret Formation Cadwork Cecobois](https://cecobois.com/wp-content/uploads/2020/10/Livret-Formation-Cadwork-Cecobois.pdf)

**Attributes that feed lists**
- Standard element attributes readable/writable through the API: name, group, subgroup, comment, SKU (article code), user attributes 1–999 with document-wide titles, production number, part number, assembly number, list quantity, material, building/storey, container number, plus free key/value "additional data" — [attribute_controller stub](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/attribute_controller/__init__.pyi)
- The SKU is "the article number attribute used for ordering and lists" (`set_sku`, `get_sku`, `add_item_to_sku_list`) — [attribute_controller stub](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/attribute_controller/__init__.pyi)
- **Script-filled attributes (attributs remplis par script / auto attributes), available since cadwork v29.** These are attributes whose content is computed by a Python script at runtime. They show in Modify, the info window and plan outputs, "can be used as a comparison and sorting criterion for the list calculation and is exported to the different lists". They are configured in User profile → Wood… → Attributes → "Script Filled → Configuration". API: `cadwork.get_auto_attribute_elements()` and `cadwork.set_auto_attribute(ids, value)` — [docs/auto_attributes.md](https://github.com/cwapi3d/cwapi3dpython/blob/main/docs/auto_attributes.md); [cadwork module stub](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/cadwork/__init__.pyi)
- The auto-attributes doc states that attributes are used "for the transfer of specific information to downstream systems such as an ERP system" — [docs/auto_attributes.md](https://github.com/cwapi3d/cwapi3dpython/blob/main/docs/auto_attributes.md)

**Shop drawings (plans d'atelier / Werkstattplan / plans de taille)**
- "Shop Drawing lets you automatically output various plans, ready for import into 2D". The "DPP part of the module or piece-by-piece drawing allows you to automatically generate predimensioned plans" (search snippets) — [04.cadwork.com List-DPP](https://04.cadwork.com/modules/list-dpp/?lang=en); [en.04.cadwork.com List + Shop drawing](https://en.04.cadwork.com/?p=2234)
- **New in cadwork 2026:** "Bridge – Shop drawing manager", described as "a new feature for generating and managing shop drawings". 2026 also moved the UI framework to Qt6 and allows vector PDFs as a modelling reference (search snippets) — [cadwork.de "cadwork Version 2026"](https://cadwork.de/en/knowledgebase/cadwork-version-2026/); [kb.cadwork.ch News](https://kb.cadwork.ch/en/news/manual)
- The API has export types for walls (element/wall drawings with wall sections), export solids, containers and piece-by-piece drawings. All of them output to a numbered 2D clipboard (presse-papiers 2D) — [shop_drawing_controller stub](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/shop_drawing_controller/__init__.pyi)
- 2D files can be printed to PDF from the command line with `ci_start.exe "plan.2d" /L PDF`, which prints "all laser frames to the default PDF driver". `/P A` sends all plotter frames to the plotter — [docs/command_line.md](https://github.com/cwapi3d/cwapi3dpython/blob/main/docs/command_line.md)

**CNC / BTL**
- Supported BTL versions (enum `cadwork.btl_version`): `btl_10_0…btl_10_6`, `btl_1_2…btl_1_6`, `btlx_1_0`, `btlx_1_1`, `btlx_2_0`, `btlx_2_1`, `btlx_2_2`. Hundegger machine types include `p8_10`, `k1`, `k2`, among others. There is also a Weinmann MFB export — [btl_version.pyi](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/cadwork/btl_version.pyi); [machine_controller stub](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/machine_controller/__init__.pyi)
- A third-party portal claims that cadwork automatically produces lists, piece counts and Abbund (cutting) data that can be used directly on Hundegger machines (low-authority source) — [campixx.de cadwork](https://www.campixx.de/tool/3d-cad/cadwork/)

**Prices / costing**
- Materials carry a price and a price unit: `material_controller.set_price(material_id, price)` and `set_price_type(material_id, price_type)`, where price_type is one of "m3, m2, m, Piece, kg, bdft, ft2, ft, ft3 or lb". **"No currency is stored with it."** The material also has `set_weight` + `set_weight_type`, plus grade, quality, code and group — [material_controller stub](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/material_controller/__init__.pyi)

**Quantities (métrés)**
- These geometry getters exist: `get_list_volume` (mm³, "volume as used in element lists"), `get_volume` (rough modelled volume, negative geometry not subtracted), `get_actual_physical_volume` (net), `get_list_length/width/height`, `get_length_including_end_types`, `get_list_weight`, `get_weight`, `get_weight_real`, `get_actual_physical_weight`, `get_total_area_of_all_faces`, `get_area_of_front_face`, `get_element_reference_face_area`, `get_door_surface`, `get_window_surface` — [geometry_controller stub](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/geometry_controller/__init__.pyi)

### Inferences
- The SEMA "fiche de taille" most likely corresponds in cadwork to **piece-by-piece drawings (DPP / pièce par pièce)** for beams, plus **wall/element drawings** for timber-frame panels. Combined with the **production list** (one line per production number), these replace SEMA's cutting sheets. The BTLx export feeds the CNC.
- Because script-filled attributes are exported to lists, a **computed "prix unitaire" or "prix ligne" attribute** (e.g. list_volume × material price) can appear directly in native production lists. This gives price columns without any external tool. The price itself would live in the material DB (`set_price`) or be pulled from CCM.
- The 2026 "Bridge – Shop drawing manager" may overlap with what scripts used to automate for shop-drawing batches. It should be evaluated before writing custom shop-drawing scripts.

### Gaps
- Could not read the kb.cadwork.ch List manual or the cadwork 2026 news PDF in full (host blocked), so the exact FR menu labels ("Listes de production", "Pré-réglages de liste", column/attribute configuration) and whether native lists can show the material price column directly are **unverified**.
- **No source found** for a native cadwork costing module ("Calcul des coûts" / "Kalkulation") or a native supplier purchase-order function. This is treated as absent until shown otherwise.
- I did not confirm whether the "Bridge – Shop drawing manager" is scriptable from the API. No `bridge` controller exists in the Python stubs.
- I did not confirm which cadwork licence modules (List, Shop drawing, BTL, IFC) the user's company owns. API list exports silently do nothing without the List licence.

---

## Q2. What the Python API (cwapi3d) can read/write for these workflows (exact function names)

### Takeaway
The cwapi3d API (package `33.x` = cadwork 2026) can **read everything needed for lists and quantities**. It can **write all attributes** (including private key/value data), **renumber and export production/part lists to CSV/XLSX unattended**, **trigger shop drawings, BTL/BTLx/Hundegger, IFC, DSTV and STEP exports**, and **set material prices**. Many functions were added during 2026, so the user's build (298) may lack the newest ones.

### Cited Findings
**Versioning**
- "The major version tracks the cadwork 3D release (`33` = cadwork v2026)". The latest release is 33.397.0 (2026-11-04). Recent additions include `utility_controller.get_user_edge` (33.397), `shop_drawing_controller.get_wall_sections` / `get_export_solid_cuts` (33.384, 2026-10-20), `file_controller.export_file_with_options` (33.383, 2026-10-13) and `element_controller.get_standard_element_guid_from_name` (33.392) — [docs/release_notes.md](https://github.com/cwapi3d/cwapi3dpython/blob/main/docs/release_notes.md)
- `pyproject.toml`: `name = "cwapi3d"`, `version = "33.397.17"`, `requires-python = ">= 3.14"` — [pyproject.toml](https://github.com/cwapi3d/cwapi3dpython/blob/main/pyproject.toml)
- `utility_controller.get_3d_version()`, `get_3d_build()` ("build number of the running cadwork 3D") and `get_3d_version_name()` are available for version guards — [utility_controller stub](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/utility_controller/__init__.pyi)

**list_controller** (module docstring: "Tabular list exports for production and quantity takeoff") — [stub](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/list_controller/__init__.pyi); [examples](https://github.com/cwapi3d/cwapi3dpython/blob/main/docs/examples/list_example.md)
- `export_production_list(element_id_list, file_path)` and `export_part_list(...)`. If the path contains `.csv` or `.xlsx`, a temporary `.cwlm` is built and "the cadwork list module is then started with this path to produce the final file". "Nothing is returned and failures are not reported, so check that the file exists afterwards."
- `export_production_list_with_settings(ids, file_path, settings_file_path)` and `export_part_list_with_settings(...)` take a settings file whose UTF-8 text "controls" the export (the example uses an `.xml` chosen by the user). If the settings file is missing, the export runs with empty settings.
- `export_cover_list[_with_settings]` (wall/roof/floor lists) and `export_container_list(ids, path)` (writes `.cwlm` directly, no CSV/XLSX conversion).
- Numbering: `generate_new_production_list_silently(ids, starting_number, keep_existing_numbers, with_containers)`, `generate_new_part_list_silently(...)`, the dialog-based `generate_new_production_list_numbers` / `generate_new_part_list_numbers`, `load_production_list_calculation_settings(xml)` / `load_part_list_calculation_settings(xml)`, and the checks `check_position_numbers_production_list()` / `check_position_numbers_part_list()`, which return the elements with discrepancies.

**attribute_controller** (selection) — [stub](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/attribute_controller/__init__.pyi)
- Setters: `set_name`, `set_group`, `set_subgroup`, `set_comment`, `set_user_attribute`, `set_user_attribute_name(number 1–999, title)`, `set_sku`, `set_production_number`, `set_part_number`, `set_assembly_number`, `set_list_quantity`, `set_element_material`, `set_container_number`, `set_output_type`, `set_process_type_and_extended_settings_from_name`, `set_standard_part`, `set_fastening_attribute`, `set_cutting_set`, `set_machine_calculation_set`.
- Getters: the matching `get_*`, plus `get_element_material_name`, `get_auto_attribute`, `get_machine_calculation_state`, `get_associated_nesting_name/number`, and type tests (`is_beam`, `is_panel`, `is_wall`, `is_framed_wall`, `is_container`, `is_export_solid`, `is_metal`, …).
- **Private sync storage:** `set_additional_data(ids, data_id, data_text)`, `get_additional_data`, `get_additional_data_keys`, `delete_additional_data`. The docs say "Additional data lets scripts attach their own key/value text to elements, independent of the numbered user attributes … written directly to the document database. Use a prefix that is unique to your script." `set_additional_guid(ids, data_id, guid)` / `get_additional_guid` store a GUID, "for example to link an element to an external system".
- Picklists (preset values in Modify): `add_item_to_name_list`, `add_item_to_group_list`, `add_item_to_subgroup_list`, `add_item_to_comment_list`, `add_item_to_sku_list`, `add_item_to_user_attribute_list` (+ `delete_item_from_*`, `get_*_list_items`).

**element_controller** — [stub](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/element_controller/__init__.pyi)
- Selection: `get_all_identifiable_element_ids`, `get_active_identifiable_element_ids`, `get_visible_identifiable_element_ids`, `get_user_element_ids` (used in the examples).
- Querying: `filter_elements(ids, element_filter)` (exact-match filters on name/group/subgroup/comment/user attribute/SKU/part/production number) and `map_elements(ids, element_map_query) -> dict[str, list]`, which groups by "name, group, subgroup, comment, user attribute, SKU, production number, part number, building or storey".
- IDs: `get_element_cadwork_guid`, `get_element_from_cadwork_guid`, `reset_element_cadwork_guid` (see Q4).
- Creation (for generators): `create_rectangular_beam_points/vectors`, `create_rectangular_panel_points/vectors`, `create_standard_beam_points/vectors`, `create_standard_panel_*`, `create_standard_steel_*`, `create_standard_element_from_guid_points/vectors`, `create_auto_export_solid_from_standard[_with_reference]`, `create_auto_container_from_standard[_with_reference]`, `set_container_contents`, `copy_elements`, `move_element`, `mirror_copy_elements`, `join_elements`, `delete_elements[_with_undo]`.

**geometry_controller**: quantity getters listed in Q1 — [stub](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/geometry_controller/__init__.pyi)

**material_controller**: `get_all_materials`, `get_material_id(name)`, `create_material`, `get/set_price`, `get/set_price_type`, `get/set_weight[_type]`, `get/set_code`, `get/set_group`, `get/set_grade`, `get/set_quality`, `get_all_material_groups` — [stub](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/material_controller/__init__.pyi)

**shop_drawing_controller** — [stub](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/shop_drawing_controller/__init__.pyi); [examples](https://github.com/cwapi3d/cwapi3dpython/blob/main/docs/examples/shop_drawing_example.md)
- `export_piece_by_piece_with_clipboard(clipboard_number, ids)`, `load_export_piece_by_piece_settings(path)`, `save_export_piece_by_piece_settings(path)`
- `export_wall_with_clipboard(clipboard_number, ids)`, `export_wall_with_clipboard_and_presetting(...)`, `load_export_wall_settings(path)`, `add_wall_section_horizontal/vertical`, `add_wall_section_horizontal_at_relative_position`, `get_wall_sections`
- `export_export_solid_with_clipboard`, `assign_export_solid`, `add_export_solid_cut[_at_relative_position]`, `load_export_solid_settings`, `export_container_with_clipboard`, `load_export_container_settings`
- `export_2d_wireframe_with_clipboard` / `_with_2dc(file_path, with_layout)`, `export_2d_hidden_lines_with_clipboard` / `_with_2dc`

**machine_controller** — [stub](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/machine_controller/__init__.pyi)
- `export_btl(btl_version, file_path)`, `export_btl_with_presetting(btl_version, file_path, presetting)`, `calculate_btl_machine_data(ids, btl_version)`, `load_btl_calculation_set(btl_type, path)`
- `export_hundegger_with_file_path_silent(type, path)`, `export_hundegger_with_file_path_and_presetting_silent(...)`, `calculate_hundegger_machine_data`, `load_hundegger_calculation_set`
- `export_weinmann_mfb(mfb_version)`
- Processing introspection: `get_element_btl_processings`, `get_element_hundegger_processings`, `get_processing_name`, `get_processing_code`, `get_processing_points`, `get_processing_btl_parameter_set`
- `get/set_panel_prefab_element_data`

**file_controller / bim_controller** — [file_controller stub](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/file_controller/__init__.pyi); [bim_controller stub](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/bim_controller/__init__.pyi)
- file_controller: `export_dstv_file`, `export_btl_file_for_nesting`, `import_btl_file`, `export_step_file[_ex|_cut_drillings|_extrude_drillings]`, `export_sat_file`, `export_dxf_file`, `export_3dc_file`, `export_webgl`, `export_glb_file`, `export_obj_file`, `export_fbx_file`, `export_file_with_options` (2026-10), `upload_to_bim_team_and_create_share_link(ids)` (returns a BIMteam share link)
- bim_controller: `export_ifc4_silently[_with_options]`, `export_ifc2x3_silently[_with_options]`, `get_ifc_options`, `load_ifc_export_settings`, `get_ifc_guid`, `get_ifc_base64_guid`, `get_element_id_from_base64_ifc_guid`, `set_building_and_storey`, `get_all_buildings`, `get_all_storeys`, `get_elements_for_storey`, `set_active_storey`, `rename_storey`, `export_bcf` / `import_bcf`

**utility_controller (UI + project data)** — [stub](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/utility_controller/__init__.pyi)
- Project data: `get_project_guid` ("Use it as a stable key when you store or exchange data about the project outside cadwork"), `get/set_project_number`, `get/set_project_name`, `get/set_project_customer`, `get/set_project_user_attribute`, `get_project_data_keys`, `get_3d_file_path`, `get_3d_file_name`
- UI: `get_user_string/int/double/bool[_with_default_value]`, `get_user_point(s)`, `get_user_edge` (33.397), `get_user_file_from_dialog`, `get_new_user_file_from_dialog`, `get_user_path_from_dialog`, `show_progress_bar`, `update_progress_bar`, `hide_progress_bar`, `print_message`, `print_error`, `menu_controller.display_simple_menu(items)` (max 50 entries, not shown in `/PLUGIN=` or `/RUNPROGRAM=` runs)
- Misc: `save_3d_file_silently`, `run_external_program(name)` (API folder only), `run_external_program_from_custom_directory`, `get_plugin_path`, `get_3d_userprofil_path`, `api_autostart` / `enable_autostart` / `disable_autostart`, `disable_auto_display_refresh` / `enable_auto_display_refresh`, `create_new_guid`, `export_screen_to_image`, `create_snapshot`

### Inferences
- A **"one-click fiche de taille + liste" plugin** is feasible with existing calls: select elements → `generate_new_production_list_silently` → `check_position_numbers_production_list` → `export_production_list_with_settings(ids, "...xlsx", preset.xml)` → `export_piece_by_piece_with_clipboard` → `machine_controller.export_btl(btl_version.btlx_2_2, ...)`. Printing the 2D clipboard to PDF probably needs a separate `ci_start.exe ... /L PDF` step (Q3). This is untested.
- **Build compatibility (inference):** the PyPI middle number (33.**397**) appears to track the cadwork build number. Earlier versions were 30.317.x, 30.443.x, 32.274.0 and 32.443.0 ([PyPI cwapi3d](https://pypi.org/project/cwapi3d/)). If so, a cadwork 2026 build 298 would lack functions added in 33.3xx releases (e.g. `get_wall_sections`, `export_file_with_options`, `get_user_edge`). Scripts should guard with `utility_controller.get_3d_build()` / `hasattr(module, "fn")`, and dev stubs should be pinned near the installed build. This mapping is **not confirmed** by cadwork.

### Gaps
- Not verified: the format and content of the list "settings file" (XML) passed to `export_*_list_with_settings`, and whether it equals the "format pattern" saved from the List module GUI. It most likely does, but this is unconfirmed.
- No API to read list rows directly into Python (e.g. as a table). Exports go to file (`.cwlm` / CSV / XLSX), so a script must re-read the CSV/XLSX or compute rows itself from element getters.
- No API function to send the 2D clipboard to PDF from inside 3D was found in the Python stubs. Only the command-line `/L PDF` on `.2d` files is documented.
- `cadwork.event_type` (on_activate, on_hide, on_show, on_close, `on_geometry`, `on_attribute`) exists in the Python stubs, but **no Python function to register an event callback was found**. Change tracking via events seems to be C++-only or undocumented. Unconfirmed.

---

## Q3. Can scripts generate Excel/PDF (openpyxl, reportlab) and call REST APIs (requests/httpx, supabase-py) from inside cadwork?

### Takeaway
Yes, in principle. cadwork embeds **CPython**, standard-library modules import normally, and external packages load by appending their folder to `sys.path`. cadwork 2026 plugins run on **Python 3.14** (2025: 3.12), so third-party wheels (openpyxl, reportlab, requests/httpx, supabase) must be built for CPython 3.14 x64 and vendored into the plugin folder. No official cadwork example of HTTP/Supabase calls was found.

### Cited Findings
- "As CPython is used in cadwork, it is possible to work with external modules … For external modules, their path variable must be added to the system". The official example is `sys.path.append(USERPROFIL + '\\api.x64\\FolderName\\PackageFolder')` with `USERPROFIL = utility_controller.get_3d_userprofil_path()` — [docs/modules.md](https://github.com/cwapi3d/cwapi3dpython/blob/main/docs/modules.md)
- Python version: "plugins run with Python 3.14 and PyQt6 in 2026, with Python 3.12 and PyQt5 in 2025" (third-party but recent and tested on both versions) — [open-mcp-cad README.en.md](https://github.com/sebastiankoukoui/open-mcp-cad/blob/main/README.en.md). This is consistent with the stub package's `requires-python = ">= 3.14"` — [pyproject.toml](https://github.com/cwapi3d/cwapi3dpython/blob/main/pyproject.toml). The cadwork KB says "With version 2025 we support Python version 3.12" (search snippet) — [kb.cadwork.ch news PDF 1825](https://kb.cadwork.ch/cadwork_news_documentation/pdf/de/1825). **Conflict:** the official get_started page still says "Cadwork uses CPython version 3.9.10", which is **outdated** — [docs/get_started.md](https://github.com/cwapi3d/cwapi3dpython/blob/main/docs/get_started.md)
- Plugin location / toolbar: scripts callable from the plugin bar live in `...\userprofil_XX\3d\API.x64\<FolderName>\<FolderName>.py`. The plugin bar is shown via Window → Plugins. An optional `Icon.png`/`Icon.svg` (~30×30) and a `plugin_info.xml` (version, author, multilingual name/description including French) provide the tooltip — [docs/get_started.md](https://github.com/cwapi3d/cwapi3dpython/blob/main/docs/get_started.md)
- Headless/batch: `ci_start.exe "file.3d" /PLUGIN=MyScript` runs a registered plugin after opening a file. `/RUNPROGRAM="C:\...\export.py"` runs a plugin from any directory (`.py` or `.dll`). Adding `/NO-GUI` runs it "without the graphical user interface … ideal for fully unattended and server-side automation" (avoid dialogs). PowerShell loops over folders are documented — [docs/command_line.md](https://github.com/cwapi3d/cwapi3dpython/blob/main/docs/command_line.md)
- The cadwork Python API documentation is available as an MCP server at `https://pyapi.mcp.cadwork.dev/mcp`, with a documented setup for Claude Code: `claude mcp add --transport http cadwork-pyapi https://pyapi.mcp.cadwork.dev/mcp` — [docs/mcp.md](https://github.com/cwapi3d/cwapi3dpython/blob/main/docs/mcp.md)
- Developer tooling: a community plugin reloads imported Python modules without restarting cadwork ("changes to imported Python modules only take effect after restarting cadwork") — [design-to-production/D2P-ReloadCadworkPythonModules](https://github.com/design-to-production/D2P-ReloadCadworkPythonModules). Another community C++/Qt plugin accepts Python scripts over local TCP (127.0.0.1:9999) from VS Code or PowerShell and runs them in the open cadwork session, one job at a time — [Brunner246/cadwork_listener](https://github.com/Brunner246/cadwork_listener)
- Supabase Python client: the official reference documents `.table(...).upsert(...).execute()` with single-row and list inputs — [Supabase Python upsert reference](https://supabase.com/docs/reference/python/upsert)

### Inferences
- Recommended packaging: in a CPython 3.14 x64 env on Windows, run `pip install --target <API.x64>\_CCM_data\_vendor openpyxl requests` (or `supabase`, `httpx`, `reportlab`), then `sys.path.insert(0, <plugin>\_vendor)` at the top of the plugin. Pure-Python packages (openpyxl, requests) carry little risk. Packages with C extensions (reportlab, pydantic-core and other supabase deps) need cp314 Windows wheels, so availability must be checked.
- A lighter alternative to the full `supabase` SDK is plain HTTPS to **PostgREST** (`requests`/`urllib` + `apikey` header) or to a **Supabase Edge Function / RPC**. This reduces vendored dependencies inside cadwork's interpreter. It is also safer: the plugin should use a user JWT or anon key with RLS, or call an edge function, never a service-role key stored on disk.
- Excel output: openpyxl can build branded "bon de commande" / "fiche de taille" workbooks from element getters. Alternatively, the native `export_production_list_with_settings(..., ".xlsx", preset.xml)` can be post-processed with openpyxl (add prices, supplier columns, logo).
- Network calls from inside the GUI thread block cadwork. Long uploads should show `show_progress_bar` or be offloaded, e.g. write a JSON payload and launch a separate process via `run_external_program_from_custom_directory`.

### Gaps
- No official cadwork statement on bundling pip packages (e.g. whether cadwork ships `pip` inside its Python, or the exact folder of the embedded interpreter) was found.
- Not verified whether `requests`/`httpx` behave correctly behind corporate proxies or with Windows certificate stores inside cadwork's embedded Python (certifi bundling).
- The exact supabase-py `upsert` parameter names (`on_conflict`, `ignore_duplicates`) could not be confirmed: the supabase.com page was blocked and search snippets were inconclusive.

---

## Q4. Patterns to sync a cadwork project with an external DB (CCM / Supabase): stable IDs, write-back, model changes, offline/online

### Takeaway
cadwork provides a **persistent per-element cadwork GUID** that survives save/reopen and merges, an **IFC GUID** (two formats), a **project GUID**, and a **private key/value store per element** (`additional_data` / `additional_guid`). Together these allow a clean upsert-by-GUID sync with CCM, with prices, order status and supplier written back into cadwork attributes. No change-event API is exposed in Python, so change detection must be done by snapshot/hash comparison at sync time.

### Cited Findings
- `element_controller.get_element_cadwork_guid(id)`: "Get the persistent cadwork GUID of an element. The GUID stays with the element when the document is saved and reopened, unlike the element ID. If the element has no GUID yet, a new one is created and stored on the element, so the first call can change the element." — [element_controller stub](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/element_controller/__init__.pyi)
- `get_element_from_cadwork_guid(guid)`: "Every element has a cadwork GUID that stays the same when its ID changes, for example after the document is merged into another one. Searches visible and hidden elements." It returns 0 if not found — [element_controller stub](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/element_controller/__init__.pyi)
- `reset_element_cadwork_guid(id)` "Clear[s] the cadwork GUID and IFC GUID of an element" — [element_controller stub](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/element_controller/__init__.pyi)
- `bim_controller.get_ifc_guid(id)` returns the 36-char GUID, "Requires an IFC license". `get_ifc_base64_guid(id)` returns the 22-char IFC form, "No license is required". Lookup is via `get_element_id_from_base64_ifc_guid` — [bim_controller stub](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/bim_controller/__init__.pyi)
- `utility_controller.get_project_guid()`: "The GUID identifies the project in the cadwork project database. Use it as a stable key when you store or exchange data about the project outside cadwork." — [utility_controller stub](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/utility_controller/__init__.pyi)
- `attribute_controller.set_additional_data(ids, data_id, text)` / `set_additional_guid(ids, data_id, guid)`: script-owned key/value data "written directly to the document database", e.g. `'my_script.external_id'` — [attribute_controller stub](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/attribute_controller/__init__.pyi)
- Material prices can be written back from an external DB with `material_controller.set_price` + `set_price_type` (no currency stored) — [material_controller stub](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/material_controller/__init__.pyi)
- Attribute write calls exist for every list-relevant field (see Q2), and `set_user_attribute_name(n, title)` lets the plugin create titled user attributes such as "Fournisseur" or "Statut commande" programmatically — [attribute_controller stub](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/attribute_controller/__init__.pyi)
- Supabase upsert API: `.table(...).upsert(rows).execute()` — [Supabase Python upsert reference](https://supabase.com/docs/reference/python/upsert). A third-party guide notes that upsert issues `INSERT … ON CONFLICT` and needs a UNIQUE constraint on the conflict column — [rapidevelopers guide](https://rapidevelopers.com/supabase-tutorial/how-to-avoid-duplicated-entries-in-supabase)

### Inferences
- **Proposed key model:** `projects(cadwork_project_guid UNIQUE, project_number, ...)` and `elements(project_id, cadwork_guid UNIQUE per project, ifc_guid_b64, production_number, part_number, name, group, subgroup, material, sku, list_length/width/height, list_volume, list_weight, list_quantity, hash, deleted_at, synced_at)`, with upsert on `(project_id, cadwork_guid)`. Store the CCM row UUID on the element via `set_additional_guid(ids, 'ccm.element_id', uuid)`, and store sync bookkeeping via `set_additional_data(ids, 'ccm.hash' / 'ccm.synced_at' / 'ccm.order_status', ...)`.
- **Change detection without events:** at each sync, compute a hash of the list-relevant fields per element. If it differs from `ccm.hash`, the element changed. GUIDs present in CCM but absent from cadwork are deleted elements (soft-delete). New GUIDs are inserts.
- **Copy caveat (unverified):** it is unknown whether `copy_elements`/copy-paste creates a new cadwork GUID or duplicates it. The plugin should detect duplicate GUIDs and call `reset_element_cadwork_guid` + `get_element_cadwork_guid` to re-mint them.
- **Write-back direction (CCM → cadwork):** prices go into `material_controller.set_price` (per material) or into a user attribute (per element/SKU). Supplier, order number and order status go into user attributes or additional_data. These then appear in native lists and on drawings, especially when exposed as script-filled attributes.
- **Offline/online:** queue payloads as JSON files in the project folder (or local SQLite) when the API is unreachable, and replay them at the next click. Use `utility_controller.get_project_guid()` + file path as the idempotency scope. For aggregation and price resolution, a Supabase **RPC / edge function** ("sync_cadwork_snapshot(payload jsonb)") keeps business logic server-side rather than in the cadwork plugin.
- **Server-side regeneration:** a Windows machine with a cadwork licence could run `ci_start.exe file.3d /RUNPROGRAM=export.py /NO-GUI` on demand, triggered by CCM through a small local agent, to regenerate lists or BTL without user interaction. The feasibility depends on licensing and is untested.

### Gaps
- No documentation found on cadwork GUID behaviour on copy/mirror-copy, on "Import 3d file", or on variant elements.
- No Python event registration API found, so live push sync on attribute or geometry change is not confirmed possible from Python.
- The cadwork licence terms for headless (`/NO-GUI`) server use were not researched.

---

## Q5. Community / vendor examples of cadwork → ERP / Excel / pricing automation

### Takeaway
**No public open-source cadwork-to-ERP, cadwork-to-pricing or cadwork-to-purchase-order project was found.** The public ecosystem is mostly API infrastructure (official stubs/docs, C++/C# bridges, dev tooling, MCP/AI bridges, COMPAS geometry). Commercial timber ERPs exist, but none was confirmed to have a documented cadwork interface in this research.

### Cited Findings
- Official repos: [cwapi3d/cwapi3dpython](https://github.com/cwapi3d/cwapi3dpython) (Python stubs and docs, updated 2026-11-11), [cwapi3d/cwapi3dcpp](https://github.com/cwapi3d/cwapi3dcpp) (C++ API, which includes a List Controller section per the search index of [CwAPI3D C++ docs](https://docs.cadwork.com/projects/cwapi3dcpp/en/latest/)), [cwapi3d/cwmath](https://github.com/cwapi3d/cwmath) (community math package referenced in [docs/community.md](https://github.com/cwapi3d/cwapi3dpython/blob/main/docs/community.md)), [cwapi3d/Cadwork3DPluginTemplate](https://github.com/cwapi3d/Cadwork3DPluginTemplate) (C++/C# plugin template whose headers include `ICwAPI3DListController.h` and `ICwAPI3DShopDrawingController.h`; last commit 2023, **older**)
- [gramaziokohler/compas_cadwork](https://github.com/gramaziokohler/compas_cadwork) (ETH Gramazio Kohler Research): an open-source package that brings the COMPAS geometry framework into cadwork 3d, with element wrappers for beam/panel/wall/floor/roof/opening (active, updated 2026-10-22)
- [sebastiankoukoui/open-mcp-cad](https://github.com/sebastiankoukoui/open-mcp-cad): an MCP server + cadwork plugin ("AI assistants read and draw in a running Cadwork 3D") with a job queue, approval cards and undo. The plugin listens on 127.0.0.1 ports 53127–53199. It explicitly contains "no construction logic … no component generators". Tested on cadwork 2025 and 2026 (updated 2026-11-05). Also [reKrueger/cadworkMCP](https://github.com/reKrueger/cadworkMCP) (contents not inspected)
- [Brunner246/cadwork_listener](https://github.com/Brunner246/cadwork_listener) (local TCP script runner). [Brunner246/cwapi3d_rest_api_server](https://github.com/Brunner246/cwapi3d_rest_api_server) is a C++ HTTP server project for CwAPI3D (only the file tree was inspected: `app.HttpServer`, `adapters.HttpHandlers`). [Brunner246/CwAPI3D.Net.Bridge](https://github.com/Brunner246/CwAPI3D.Net.Bridge) is a C# wrapper. The author is listed as a cwapi3dpython maintainer in the [README](https://github.com/cwapi3d/cwapi3dpython/blob/main/README.md)
- GitHub code search for `import list_controller`, `element_controller openpyxl` and `attribute_controller supabase` returned **only the official repo** (no third-party list/Excel/Supabase scripts) — GitHub code search, 2026-11-11 (gh CLI; no stable URL)
- ERP side (German search): a generic "CADLink" product creates ERP item masters and BOMs from CAD data with one click, but no cadwork support is stated — [Haufe X360 CADLink fact sheet](https://www.haufe-x360.de/fileadmin/user_upload/schnittstellen/cadlink/Generic_CADLink_German_Fact_Sheet.pdf). OSD-ERP describes a CAD → costing → BOM chain without naming cadwork — [OSD prospect](https://osd.de/wp-content/uploads/Prospekte/osd-erp/Prospekt_Classic_Prospekt_online.pdf). Blum lists cadwork as a CAD/CAM interface partner (furniture hardware) — [Blum cadwork partner page](https://www.blum.com/at/de/services/produktion-fertigung/cad-cam-schnittstelle/schnittstellenpartner/cadwork/)

### Inferences
- The user's CCM integration will be **custom**: there is no off-the-shelf cadwork ↔ Supabase connector. The most reusable public building blocks are the official stubs (for IDE autocompletion), the cadwork MCP docs server (for AI-assisted script writing), D2P reload (dev loop), and possibly cadwork_listener (to drive cadwork from VS Code/CCM-side tooling).
- open-mcp-cad's architecture (in-cadwork plugin listening on localhost + external Python process) is a proven pattern for the "strong interaction with CCM" requirement. A local CCM agent could talk to a cadwork plugin the same way.

### Gaps
- The cadwork forum, YouTube (FR/DE list tutorials) and French ERP vendors for charpente/ossature bois (e.g. those competing with SEMA's integrated costing) were not researched in depth because of time and host restrictions. No confirmed cadwork-ERP connectors were identified.
- The contents of `reKrueger/cadworkMCP` and `cwapi3d/Cadwork.Api` were not inspected (GitHub API access was restricted for these repos).
- The existing "_CCM_data" plugin's code was not available. Its behaviour is unknown.

---

## Q6. Drawing-productivity ideas via API: parametric generators, batch attributes, renaming/numbering, auto-grouping by building/storey, attribute presets

### Takeaway
The API has every primitive needed for **generators** (create beams/panels/standard elements from points, standard connectors, end types, export solids/containers), **batch attribute tools** (set/get every list attribute, picklists, filter/map by attribute), **numbering** (silent production/part numbering), and **structure** (buildings/storeys). Script-filled attributes add live computed fields such as cross-section checks or price.

### Cited Findings
- Element creation: `create_rectangular_beam_points(width, height, p1, p2, p3)`-style functions, standard elements by name (`create_standard_beam_points(standard_element_name, p1, p2, p3)`, `create_standard_panel_*`, `create_standard_steel_*`) or by GUID (`create_standard_element_from_guid_points`), `get_standard_beam_list` / `get_standard_beam_guid_list`. Standard-element name/folder limits were documented in 2026-10 — [element_controller stub](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/element_controller/__init__.pyi); [release notes 33.392/33.394](https://github.com/cwapi3d/cwapi3dpython/blob/main/docs/release_notes.md)
- Connectors / hardware (relevant for sabots/étriers, screws, bolts): `connector_axis_controller.create_standard_connector`, `create_blank_connector`, `get_standard_connector_list`, `get_connector_axis_guid_by_name`, `get_item_guid_by_name`, `set_bolt_item`, `set_items_at_intersection`, and for purchasing **`get_axis_item_order_number`, `get_bolt_order_number`**, `get_axis_item_material`, `get_axis_item_norm`, `get_axis_item_user_field` — [connector_axis_controller stub](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/connector_axis_controller/__init__.pyi). Also `element_controller.convert_bolt_to_standardconnector` / `remove_standard_connector_axis`. End types: `endtype_controller`. Roofs: `roof_controller`. Multi-layer covers: `multi_layer_cover_controller` — [src/ directory](https://github.com/cwapi3d/cwapi3dpython/tree/main/src)
- Geometry anchors for placing items on beam ends: `geometry_controller.get_p1`, `get_p2`, `get_xl` (the official shop-drawing example computes `gc.get_p1(id) + gc.get_xl(id) * 500.0`). The beam creation signature is `create_rectangular_beam_points(width, height, first_point, second_point, third_point)` — [geometry_controller stub](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/geometry_controller/__init__.pyi); [shop_drawing_example.md](https://github.com/cwapi3d/cwapi3dpython/blob/main/docs/examples/shop_drawing_example.md); [element_controller stub](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/element_controller/__init__.pyi)
- User input for generators: `utility_controller.get_user_point(s)`, `get_user_points_with_count`, `get_user_edge` (new in 33.397, 2026-11-04: "asks the user to pick an edge in the 3D view … returns its two end points"), `get_user_double/int/string`, `menu_controller.display_simple_menu` — [utility_controller stub](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/utility_controller/__init__.pyi); [release notes](https://github.com/cwapi3d/cwapi3dpython/blob/main/docs/release_notes.md)
- Grouping and selection by attribute: `element_controller.map_elements(ids, element_map_query)` groups by name/group/subgroup/comment/user attribute/SKU/production/part number/**building or storey**. `filter_elements(ids, element_filter)` filters by exact value — [element_controller stub](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/element_controller/__init__.pyi)
- Building/storey structure: `bim_controller.set_building_and_storey(ids, building, storey)`, `get_all_buildings`, `get_all_storeys`, `get_elements_for_storey`, `set_storey_height`, `set_active_storey`, `rename_storey`, `rename_building` — [bim_controller stub](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/bim_controller/__init__.pyi)
- Picklist presets for Modify (standardised values): `add_item_to_name_list`, `add_item_to_group_list`, `add_item_to_subgroup_list`, `add_item_to_comment_list`, `add_item_to_sku_list`, `add_item_to_user_attribute_list`, and `get_name_list_items_by_element_type` — [attribute_controller stub](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/attribute_controller/__init__.pyi)
- Process type / extended settings presets: `set_process_type_and_extended_settings_from_name`, `set_name_process_type`, `set_name_extended_settings`, `set_output_type` — [attribute_controller stub](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/attribute_controller/__init__.pyi)
- Script-filled attribute examples in the official docs: concatenating group + length, a "Standard cross-section" / "Special cross-section" check (`height % 20 == 0 and width % 20 == 0`), and name + material + rounded dimensions — [docs/auto_attributes.md](https://github.com/cwapi3d/cwapi3dpython/blob/main/docs/auto_attributes.md)
- Performance helpers for batch operations: `utility_controller.disable_auto_display_refresh` / `enable_auto_display_refresh`, progress bar functions, `element_controller.delete_elements_with_undo` / `move_element_with_undo` — [utility_controller stub](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/utility_controller/__init__.pyi); [element_controller stub](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/element_controller/__init__.pyi)

### Inferences
- **Generator ideas built on these primitives (not found as existing public code):**
  - *Solivage*: the user picks a contour edge or two points with `get_user_edge`/`get_user_points` and enters spacing (entraxe) and section. The script creates joists with `create_standard_beam_points` and tags name/group/subgroup/SKU.
  - *Sabots on joist ends*: iterate joists, compute end points with `geometry_controller.get_p1/get_p2` + `get_xl`, and place a standard connector via `connector_axis_controller.create_standard_connector` (signature not read), with the SKU or order number set to the supplier article for automatic purchase quantities (`get_axis_item_order_number`).
  - *Chevronnage* on roof surfaces: use `roof_controller` plus beam creation at a fixed spacing.
  - *Ossature*: wall framing is likely better handled by cadwork's native wall/element module + `export_wall_with_clipboard_and_presetting` for wall drawings.
- **Batch "Pré-réglages" tool:** a CCM-maintained JSON catalogue (e.g. "Solive 75×225 C24" → name, group, subgroup, material, SKU, process type, user attributes) applied to the selection in one click. Picklists are refreshed from CCM through the `add_item_to_*_list` functions, so users only see CCM-approved values.
- **Auto-numbering/grouping:** `map_elements` by storey → `set_group(storey)` → `generate_new_production_list_silently(...)` per building with distinct start numbers (e.g. building 1 = 1000+, building 2 = 2000+). This mirrors SEMA-style lot numbering.
- **Purchase orders (bons de commande):** aggregate by SKU (`map_elements` with SKU) and by material + section with `get_list_volume/length` × `get_list_quantity`. Push to CCM as order lines, where CCM resolves supplier, price and PO PDF/email. Order status is written back with `set_additional_data(..., 'ccm.po', 'PO-2026-0123')`.

### Gaps
- Exact `endtype_controller` and `roof_controller` function names were not extracted. The docstrings of the connector functions (e.g. whether "order number" is the supplier article number) were not read.
- No public examples of solivage/chevronnage/sabot generators for cadwork were found.
- The `element_map_query` / `element_filter` class APIs (how to select "storey" as the grouping key) were not read in detail.
