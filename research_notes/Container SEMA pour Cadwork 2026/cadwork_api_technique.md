# cadwork 3D 2026 (v33): developer API and technical stack for a SEMA-style "Container" add-on

Research date: 2026-11-11. Method note: `docs.cadwork.com`, `kb.cadwork.ch`, `cadwork.ca`, `w4c.group` and `eurobois-events.com` could not be fetched from this research session (DNS blocked by the sandbox). To work around this, I read the Markdown **source** of the official Python docs in the GitHub repo `cwapi3d/cwapi3dpython` (cloned at commit of 2026-11-11, "Feature/docstring improvements (#450)"). That source is what docs.cadwork.com/projects/cwapi3dpython renders. I also read the official C++ repo `cwapi3d/cwapi3dcpp` (cloned 2026-11-11), the PyPI JSON metadata, and the latest wheel `cwapi3d-33.397.17` (all 1,108 stub functions). Claims marked "(search snippet)" come only from web search summaries of pages I could not open directly.

---

## 1. Python API (cwapi3d): version, embedded Python, docs, modules, key functions

### Takeaway
For cadwork 2026 the Python API is `cwapi3d` **33.x**, where major 33 means cadwork v2026. The latest release is **33.397.17**, published 2026-11-11. It ships typed `.pyi` stubs for 19 modules and requires **Python ≥ 3.14**, because cadwork 2026 embeds CPython 3.14. Everything a "Container" needs is present: inserting library items (3DC, standard elements, variants, connector axes), joints such as half-lap/tenon, materials, attributes and exports. Two pieces are missing: a docking/panel API and a way to bind a texture **image** to a material.

### Cited Findings
**Versions and runtime**
- PyPI `cwapi3d` latest = **33.397.17**, uploaded 2026-11-11 16:17 UTC, `Requires-Python >=3.14`, classifier "Programming Language :: Python :: 3.14", "Operating System :: Microsoft :: Windows", author "Cadwork <it@cadwork.ca>", homepage github.com/cwapi3d/cwapi3dpython. — [PyPI cwapi3d](https://pypi.org/project/cwapi3d/); [PyPI JSON](https://pypi.org/pypi/cwapi3d/json)
- The official release notes say: "The major version tracks the cadwork 3D release (`33` = cadwork v2026)." — [release_notes.md](https://github.com/cwapi3d/cwapi3dpython/blob/main/docs/release_notes.md)
- Version lineage from PyPI upload history:
  - 30.x ran 2023-09 → 2025-02, `>=3.10`.
  - **32.x** (cadwork 2025) ran 2025-04-25 (32.246.0) → 2026-05-01 (32.443.10), `>=3.12`.
  - **33.x** started 2026-05-07 (33.264.1), `>=3.14`.
  - Old semver releases 0.9 → 2.0.10 date from 2020-2023. — [PyPI JSON](https://pypi.org/pypi/cwapi3d/json)
- The repo's `pyproject.toml` has `version = "33.397.17"` and `requires-python = ">= 3.14"`, and `.python-version` = `3.14`. — [pyproject.toml](https://github.com/cwapi3d/cwapi3dpython/blob/main/pyproject.toml)
- cadwork's KB news for v2026 says: "The Python Interpreter supported in Version 2026 has been updated to Version 3.14". The PythonConsole moves to v7 (search snippet). — [cadwork KB News – Plugins](https://kb.cadwork.ch/en/news/manual/1877/plugins)
- A user report confirms the runtime: "cadwork 3d 2026, embedded Python 3.14, PyQt6 6.8.1 with PyQt6-Qt6 6.8.2 under `Pclib.x64\python314\site-packages`". — [Discussion #291 (2026-10-30 post)](https://github.com/cwapi3d/cwapi3dpython/discussions/291)
- **Stale official statement:** the Getting Started page still says "Cadwork uses CPython version 3.9.10", and it still uses `userprofil_27/28` paths. This conflicts with all the 2026 evidence above, so treat it as outdated. — [get_started.md](https://github.com/cwapi3d/cwapi3dpython/blob/main/docs/get_started.md)
- `utility_controller.get_3d_version()` returns the major number, "for example 33". `get_3d_build()`, `get_3d_build_date()` and `get_3d_version_name()` also exist. — [utility_controller stub](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/utility_controller/__init__.pyi)
- Docs URL: https://docs.cadwork.com/projects/cwapi3dpython/en/latest/ (ReadTheDocs/mkdocs, built from `docs/` in the repo). — [README](https://github.com/cwapi3d/cwapi3dpython/blob/main/README.md); [mkdocs.yml](https://github.com/cwapi3d/cwapi3dpython/blob/main/mkdocs.yml)
- Python has been available in cadwork "since version 27". — [docs/index.md](https://github.com/cwapi3d/cwapi3dpython/blob/main/docs/index.md)
- Lua plugins are dropped in v2026: "support for Lua is being completely discontinued" (search snippet). — [cadwork KB News – Plugins](https://kb.cadwork.ch/en/news/manual/1877/plugins)

**Module list in wheel 33.397.17** (function counts are mine, from the `.pyi` files):
- `attribute_controller` (190)
- `bim_controller` (42)
- `cadwork`: core types and enums, about 90 type files
- `connector_axis_controller` (52)
- `dimension_controller` (22)
- `element_controller` (207)
- `endtype_controller` (21)
- `file_controller` (43)
- `geometry_controller` (105)
- `list_controller` (16)
- `machine_controller` (20)
- `material_controller` (81)
- `menu_controller` (1)
- `multi_layer_cover_controller` (53)
- `roof_controller` (4)
- `scene_controller` (17)
- `shop_drawing_controller` (23)
- `utility_controller` (137)
- `visualization_controller` (72)

That makes about 1,108 functions in total. There is **no** separate `bim`/`grid`/"event" Python module. — [src/ in cwapi3dpython](https://github.com/cwapi3d/cwapi3dpython/tree/main/src)

**Functions relevant to the Container.** All of these were read in the 33.397.17 stubs, in the [src/ tree](https://github.com/cwapi3d/cwapi3dpython/tree/main/src).

*Inserting reusable items*
- `file_controller.import_3dc_file`, `import_3dc_file_with_options(file_path, import_3dc_options)` and `get_import_3dc_options()`.
  - The options are: import saved 2D planes, import saved scenes, import export solids, reset position numbers.
  - The docstring warns: "Saved scenes in the file are never imported… **No undo step is created**."
- `import_3dc_file_with_glide` and `import_3dz_file`.
- `file_controller.import_element_light(file_path, insert_position)`: a display-only "lightweight visualization element (for example from an OBJ file) that carries no cadwork geometry".
- `file_controller.import_variant_file(file_path, insert_position)`: imports a parametric variant `.val` file, "build it and return the new element IDs".
- Also `import_step_file`, `import_sat_file`, `import_rhino_file`, `import_btl_file`, `import_bxf_file`.
- Standard-element library (element_controller):
  - Creation: `create_standard_element_from_guid_points/vectors(guid, p1, p2, p3)`, `create_standard_beam/panel/steel_points|vectors`.
  - Lookup: `get_standard_beam_list` / `get_standard_panel_list` / `get_standard_container_list` / `get_standard_export_solid_list`, `get_standard_beam_guid_list` / `get_standard_panel_guid_list`, and **`get_standard_element_guid_from_name` / `get_standard_element_name_from_guid`** (new in 33.392.0).
  - Library management: `export_as_standard_element(element_id, name)`, `import_standard_beam_from_file` / `import_standard_panel_from_file`, and `remove_standard_*`.
  - Caveat from the docstring: "folders of the library are not handled by the API".

*Joints / processes* (element_controller, applied to a list of element IDs; "joint partners are detected automatically")
- `cut_half_lap` (≈ mi-bois)
- `cut_double_tenon`, `cut_corner_lap`, `cut_t_lap`, `cut_cross_lap`
- `cut_simple_scarf`, `cut_scarf_straight`, `cut_scarf_diagonal`, `cut_scarf_with_wedge`
- `cut_shoulder` / `cut_heel_shoulder` / `cut_double_shoulder`, configured with `set_*_shoulder_options`
- `cut_log_corner_joint`, `cut_beam_end_profile`, `cut_diagonal_cut`, `cut_element_with_processing_group`
- `endtype_controller` handles end types such as tenon/mortise: `create_new_endtype`, `set_endtype_id_start` / `…_end`, `start_endtype_dialog`.
- `cut_half_lap` "is added to undo and the view is redrawn".

*Connectors* (`connector_axis_controller`)
- Creation and catalog: `create_standard_connector(axis_name, point1, point2)`, `get_standard_connector_list()` (names in the current language), `import_from_file(file_path)` (adds catalog entries and never overwrites), `create_blank_connector`, `start_configuration_dialog`.
- Configuration: `set_bolt_item`, `set_diameter`, `set_bolt_length(_automatic)`, `set_counterbore_*`, `set_items_at_intersection`.
- Lookup: `get_connector_axis_guid_by_name` (new in 33.343.2, 2026-08-24).
- Related element_controller functions: `convert_bolt_to_standardconnector` and `remove_standard_connector_axis`.

*Materials and textures*
- `material_controller`:
  - Creation and properties: `create_material(name)` (idempotent; names are truncated to 29–30 chars), `set_price` + `set_price_type`, `set_weight` / `set_weight_type`, `set_grade` / `set_quality` / `set_code` / `set_group`.
  - Physical properties: `set_modulus_elasticity_*`, `set_thermal_conductivity`, `set_fire_resistance_class`, and more.
  - Texture: `get/set_texture_color`, `set_texture_transparency` (signature fixed in 33.382.0), `set_texture_rotation_angle`, `set_texture_zoom_x/y`, `set_texture_length_alignment`.
  - There is **no setter for the texture image file**.
- `visualization_controller`: `set_material(element_ids, material_id)`, `set_color`, `set_use_material_texture`, `set_texture_rotated`, `display_bitmaps_as_texture_representation_in_shaded1/2`.
- `element_controller.apply_image_to_surface(surface, image_path, align_start, align_end)` only works on **surface** elements.

*Attributes* (`attribute_controller`)
- `set_name`: assigning a name "applies the settings stored for that name (machine settings, cutting set, IFC type)".
- `set_user_attribute(ids, number 1–999, text)`.
- `set_additional_data(ids, data_id, text)`, `get_additional_data` and `get_additional_data_keys` (33.378.0) give a hidden key/value store per element. This is a natural place to keep CCM/Supabase IDs.

*Lists and exports*
- `list_controller.export_part_list(_with_settings)` and `export_production_list(_with_settings)`. If the path contains `.csv` or `.xlsx`, the list is converted. These "Do nothing without the cadwork 3D list license".
- `export_cover_list` and `export_container_list` (`.cwlm`).
- `machine_controller`:
  - `export_btl(btl_version, path)` and `export_btl_with_presetting` ("nothing is exported if … no licence exists for the version").
  - `export_hundegger*` and `export_weinmann_mfb`.
  - `get_element_btl_processings` and `get_processing_btl_parameter_set`.
- `bim_controller`: `export_ifc4` / `export_ifc2x3` (+ `_silently`, `_with_options`), `load_ifc_export_settings` (33.378.0), `import/export_bcf`, `import_ifc_as_graphical_object`.
- `file_controller`:
  - Formats: STEP/SAT/IGES via `export_file_with_options` (33.383.0), DXF, DSTV, OBJ, FBX, GLB, WebGL HTML, 3DC/3D export.
  - Also `upload_to_bim_team_and_create_share_link`.

*Shop drawings* (`shop_drawing_controller`)
- `export_2d_wireframe|hidden_lines_with_clipboard|_2dc`, `export_piece_by_piece_with_clipboard`, `export_wall_with_clipboard(_and_presetting)`, `export_container_with_clipboard`.
- `add_wall_section_*`, `add_export_solid_cut*`, `get_wall_sections`, `get_export_solid_cuts` (33.380/33.384).

*Undo and UI helpers*
- Undo: `element_controller.add_created_elements_to_undo` / `add_modified_elements_to_undo` / `make_undo`.
- Thumbnails: `utility_controller.export_screen_to_image(file_path, factor)`.
- Progress: `show/update/hide_progress_bar`.
- User input: `get_user_point(s)`, `get_user_edge` (33.397.0), `get_user_element_ids`.
- Dialogs: `get_user_file_from_dialog` (Qt filter syntax) and `menu_controller.display_simple_menu(items)` ("At most 50 entries… blocks until the user selects").

### Inferences
- A SEMA-style Container can be built entirely on documented Python calls. Each item type maps to one call:
  - Assemblies → `.3dc` + `import_3dc_file_with_options`, or standard elements via GUID.
  - Connectors (Simpson/Rothoblaas) → `connector_axis_controller.create_standard_connector`, or 3DC/standard-element "steel" items.
  - Parametric items → `.val` variants.
  - Joints → `cut_*` functions.
- Because 3DC import creates no undo step, the add-on should call `add_created_elements_to_undo(new_ids)` itself after each insertion.
- Material **texture images** must be set up once in cadwork's material catalog by hand. The add-on can then *assign* materials (`visualization_controller.set_material`) and tweak color/rotation/zoom only.
- `export_screen_to_image` combined with temporary isolation of an inserted item could auto-generate thumbnails for the library. I have not tested this.

### Gaps
- I could not open docs.cadwork.com directly, so I verified the rendered page only through its Markdown source.
- No official cadwork statement maps cadwork 2025 to 32.x. The mapping follows from the numbering and dates.
- No API function lists or manages **folders** of the standard-element library (stated limitation), and there is no function to set a material's texture bitmap. Discussion #416 "Change Texture Color via Python API?" (2026-10-08) is unanswered — [Discussions](https://github.com/cwapi3d/cwapi3dpython/discussions).

---

## 2. Plugin structure, plugin bar, shortcuts, startup scripts, events

### Takeaway
A Python plugin is a folder under the user profile's `API.x64` containing a same-named `.py` file, an optional `Icon.png/svg` (~30×30) and an optional `plugin_info.xml`. It appears as a button in the plugin bar (Window → Plugins). Autostart exists through `utility_controller.enable_autostart`. Command-line flags exist: `/PLUGIN=`, `/RUNPROGRAM=` and `/NO-GUI`. Three things are **not** available: binding a plugin to an arbitrary keyboard shortcut, Python event callbacks, and a selection-changed event.

### Cited Findings
- "To use Python scripts in cadwork, they must be located in the userprofile in the folder api.x64… A folder must be created in the api.x64 directory for each script. The Python script must have the same name as the folder." The folder is reached via Help → Info → Userprofile. — [get_started.md](https://github.com/cwapi3d/cwapi3dpython/blob/main/docs/get_started.md)
- Plugin bar: "show the plugin bar (Window -> Plugins)". The icon file is "**Icon.png or Icon.svg**… scaled down to 30x30 pixels". `plugin_info.xml` holds `<Version>`, `<Date>`, `<Author>`, and multilingual `<Name>` / `<Description>` with a `<Text language="French">` entry. It shows as a tooltip. — [get_started.md](https://github.com/cwapi3d/cwapi3dpython/blob/main/docs/get_started.md)
- `utility_controller.get_plugin_path()`, `get_3d_userprofil_path()` and `get_user_catalog_path()` locate these folders. — [utility_controller stub](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/utility_controller/__init__.pyi)
- **Known bug, open 2026-11-09:** when a plugin has several `.py` files, "Cadwork doesn't include the folder in path" if it is launched from the user plugins toolbar. The workaround is `sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))`. A collaborator replied on 2026-11-10 with only a docs link. — [Issue #432](https://github.com/cwapi3d/cwapi3dpython/issues/432)
- Autostart: `enable_autostart(api_name)` "Enable autostart of a Python API module for the current user. Writes the user-profile configuration files; takes effect at the next start of cadwork 3D." `disable_autostart` and `check_autostart` also exist. — [utility_controller stub](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/utility_controller/__init__.pyi)
- Command line (`ci_start.exe`):
  - `/EXE=…\exe_2026` selects the version.
  - `/PLUGIN=MyScript` runs a plugin from API.x64 after the file opens.
  - `/RUNPROGRAM="C:\my_plugins\export.py"` runs a `.py` **or a compiled `.dll`** plugin from any folder. It is "handy for testing a plugin during development".
  - `/NO-GUI` gives a headless run.
  - `/P` and `/L` batch-print 2D frames.
  - Source: [command_line.md](https://github.com/cwapi3d/cwapi3dpython/blob/main/docs/command_line.md)
- `run_external_program_from_custom_directory('C:/plugins/my_tool.py')` starts a plugin from another plugin. — [utility_controller stub](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/utility_controller/__init__.pyi)
- **Shortcuts:** "You can not bind a script to a shortcut." When the user asked to trigger a tenon/mortise script by key: "Unfortunately, this is not possible." (Brunner246, cadwork collaborator, 2026-01-14 and 2026-01-22). — [Discussion #306](https://github.com/cwapi3d/cwapi3dpython/discussions/306)
- Workarounds discussed in the community:
  - Assign "Category = Extra, Command = External Program" to a function key, then type the script's first letter and press Enter.
  - AutoHotkey.
  - A Qt `QShortcut` inside your own window, which "only works while the script window is active".
  - `menu_controller.display_simple_menu`.
  - Source: [Discussion #146](https://github.com/cwapi3d/cwapi3dpython/discussions/146)
- `utility_controller.execute_shortcut(modifier, key)` only *triggers* existing cadwork main-window actions bound to F1–F12 (+ shift/ctrl/alt). `shortcut_key_modifier.no_modifier` was added in 33.380.0. — [utility_controller stub](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/utility_controller/__init__.pyi); [release_notes.md](https://github.com/cwapi3d/cwapi3dpython/blob/main/docs/release_notes.md)
- **Events:** 33.378.0 (2026-10-07) added the enum `cadwork.event_type` with `on_activate`, `on_hide`, `on_show` ("elements became visible"), `on_close`, `on_geometry` ("an element's geometry changed") and `on_attribute`. — [event_type.pyi](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/cadwork/event_type.pyi); [release_notes.md](https://github.com/cwapi3d/cwapi3dpython/blob/main/docs/release_notes.md)
  - However, no Python function in 33.397.17 subscribes to these events. I grepped all stubs for event, callback and register.
  - In C++, `ControllerFactory::getEventSubscriptionController()` exists (added in a commit dated 2025-06-06), but the header `ICwAPI3DEventSubscriptionController.h` is **not published**; it is only forward-declared. — [ICwAPI3DControllerFactory.h](https://github.com/cwapi3d/cwapi3dcpp/blob/main/include/cwapi3d/ICwAPI3DControllerFactory.h)
- "Script-filled attributes" (auto-attributes, since v29): Python scripts that compute an attribute's value at runtime. This is a form of reactive hook. — [auto_attributes.md](https://github.com/cwapi3d/cwapi3dpython/blob/main/docs/auto_attributes.md)

### Inferences
- An event/subscription system is being built: there is a public enum in Python and a factory method in C++, but no usable subscription API yet. There is also no "selection changed" event type in the enum. A docked panel therefore cannot react live to selection. It needs a "refresh" button or polling of `get_active_identifiable_element_ids()` from a Qt timer, which only works if the panel's event loop runs inside cadwork (see section 3).
- For keyboard access, the realistic options are:
  - Put the Container's own `QShortcut`s on its panel window.
  - Use the function-key/"External Program" trick.
  - From a C++ plugin parented to cadwork's main window, add `QAction`s with shortcuts to that window. This is possible in principle but undocumented; not verified.

### Gaps
- I found no documentation on the plugin bar's ordering or grouping, or on creating custom cadwork toolbars or menus from a plugin.
- No official roadmap date exists for the Python event subscription API.

---

## 3. UI options: Qt in Python, tkinter, dockable panels, C++ API, .NET

### Takeaway
cadwork 2026 is a **Qt 6** application. Python plugins are expected to use **PyQt6**, which cadwork ships in its embedded site-packages; tkinter is officially documented too. The Python API has **no docking/panel API**; it only offers `get_3d_hwnd()` and `get_3d_main_window_geometry()`. The proven way to attach UI *inside* cadwork's Qt main window is a **C++ plugin DLL** built against Qt6: cadwork's official BorderLine plugin calls `QWidget::find(get3DHWND())` to get cadwork's main window and parents a Qt6 dialog to it. Caddev's docked "Steel Tools Center" very likely uses this route (inference). "BIM Management Tool" is a **built-in cadwork module**, not a third-party plugin.

### Cited Findings
**Qt in Python**
- "In cadwork 3d versions <2026 you have to use Qt5. Versions >= 2026 uses Qt6. We recommend using PyQt." (Brunner246, 2025-11-21, accepted answer). The original poster had crashes with PySide6. — [Discussion #291](https://github.com/cwapi3d/cwapi3dpython/discussions/291)
- KB v2026 (search snippet): "With the switch to QT6 in cadwork 3D, scripts that use QT must also be adapted accordingly. Uses of PyQt5 must be replaced with PyQt6." Most of the default-installed plugins are updated PyQt6 versions. — [cadwork KB News – Plugins](https://kb.cadwork.ch/en/news/manual/1877/plugins)
- Reported problem (2026-03-27, reproduced 2026-10-30): "QtFatal: Cannot mix incompatible Qt library (6.8.2) with this library (6.8.3)".
  - cadwork's own Qt6Core.dll is 6.8.3, while the bundled PyQt6-Qt6 is 6.8.2.
  - The reporter's diagnosis: PyQt6's `find_qt()` looks next to `sys.executable` (= `3d.exe`), so the wheel's QtCore loads first.
  - The reporter's expected behaviour: "plugins should use the Qt already loaded by cadwork".
  - It is still unresolved in the thread. — [Discussion #291](https://github.com/cwapi3d/cwapi3dpython/discussions/291)
- tkinter is documented with official examples ("tkinter - GUI toolkit", Hello-World `tk.Tk()` app). — [examples/tk_gui.md](https://github.com/cwapi3d/cwapi3dpython/blob/main/docs/examples/tk_gui.md)
- No function in the 1,108 Python stubs mentions dock, widget, panel or webview. The window-related functions are:
  - `get_3d_hwnd()`: "native window handle… useful when you embed your own windows or dialogs as children of cadwork".
  - `get_3d_main_window_geometry()`: "to place your own window relative to cadwork".
  - `get_3d_gui_upper_left_screen_coordinates()`.
  - Source: [utility_controller stub](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/utility_controller/__init__.pyi)

**C++ API (official)**
- Repo: `cwapi3d/cwapi3dcpp`, "Cadwork C++ Interface", MIT, last commit 2026-11-09. Docs: https://docs.cadwork.com/projects/cwapi3dcpp/en/latest/ (the index is still titled "CwAPI3D V32 Documentation"). — [cwapi3dcpp](https://github.com/cwapi3d/cwapi3dcpp); [docs/index.rst](https://github.com/cwapi3d/cwapi3dcpp/blob/main/docs/index.rst)
- Header-only interfaces (`include/cwapi3d/ICwAPI3D*Controller.h`).
  - `CwAPI3DVersion.h`: `versionMajor = 2026`, `versionMinor = 397`.
  - CMake ≥ 3.21.1 (`PROJECT(CwAPI3D VERSION 33.264.1)`) or Meson.
  - The upstream vcpkg port `cwapi3d` is at 32.219.1.
  - Sources: [CwAPI3DVersion.h](https://github.com/cwapi3d/cwapi3dcpp/blob/main/include/cwapi3d/CwAPI3DVersion.h); [CMakeLists.txt](https://github.com/cwapi3d/cwapi3dcpp/blob/main/CMakeLists.txt); [vcpkg port](https://github.com/microsoft/vcpkg/blob/master/ports/cwapi3d/vcpkg.json)
- Plugin = DLL. It exports `CWAPI3D_PLUGIN bool plugin_x64_init(CwAPI3D::ControllerFactory*)`, plus `get_min_version_major/minor`, `get_plugin_name`, `get_contact_name` and `get_contact_email`. These come from the `CWAPI3D_PLUGIN_NAME` / `CWAPI3D_AUTHOR_NAME` / `CWAPI3D_AUTHOR_EMAIL` macros. — [getting_started_cpp.rst](https://github.com/cwapi3d/cwapi3dcpp/blob/main/docs/getting_started_cpp.rst); [CwAPI3D.h](https://github.com/cwapi3d/cwapi3dcpp/blob/main/include/cwapi3d/CwAPI3D.h)
- C++ has controllers that Python lacks: `GridController` and `getEventSubscriptionController()`. — [CwAPI3D.h](https://github.com/cwapi3d/cwapi3dcpp/blob/main/include/cwapi3d/CwAPI3D.h); [ICwAPI3DControllerFactory.h](https://github.com/cwapi3d/cwapi3dcpp/blob/main/include/cwapi3d/ICwAPI3DControllerFactory.h)
- KB v2026 (search snippet): "A C++ API is still available." — [cadwork KB News – Plugins](https://kb.cadwork.ch/en/news/manual/1877/plugins)
- **Official Qt6 C++ plugin example:** `cwapi3d/BorderLine` (AGPL-3.0, "Extension for the JTC plugin", last commit 2026-03-16).
  - Build: C++23, `find_package(Qt6 COMPONENTS Core Gui Widgets REQUIRED)`, `find_package(CwAPI3D CONFIG REQUIRED)`, plus helper library `Brunner246/cwapi3dcpp-ex`.
  - In `plugin_x64_init` it does:
    - `auto *const hwndCadwork = factory->getUtilityController()->get3DHWND();`
    - `auto *const mainWindowCadwork3d = QWidget::find(reinterpret_cast<WId>(hwndCadwork));`
    - Then it constructs a dialog with `mainWindowCadwork3d` as parent and calls `dialog->show(); return false;`.
  - Sources: [bootstrap.cc](https://github.com/cwapi3d/BorderLine/blob/main/src/App/bootstrap.cc); [src/App/CMakeLists.txt](https://github.com/cwapi3d/BorderLine/blob/main/src/App/CMakeLists.txt); [CMakeLists.txt](https://github.com/cwapi3d/BorderLine/blob/main/CMakeLists.txt)

**.NET**
- `cwapi3d/Cadwork.Templates` (C#, single commit 2024-09-10) is a `dotnet new` template.
  - It targets `net8.0` with `PublishAot=true` (NativeAOT) and exports `plugin_x64_init` etc. via `[UnmanagedCallersOnly]`.
  - It references NuGet `Cadwork.Api` / `Cadwork.Api.Interop` **30.576.1**, minimum version 30.573. — [Cadwork.Templates](https://github.com/cwapi3d/Cadwork.Templates)
- NuGet versions: `Cadwork.Api` 30.573.1 / 30.573.2 / 30.576.1 and `Cadwork.Api.Interop` 30.573.1 → 30.576.1. There are no 32.x or 33.x builds. — [NuGet Cadwork.Api](https://www.nuget.org/packages/Cadwork.Api)

**Third-party docked panels seen in the screenshot**
- "BIM Management Tool (BMT)" is a cadwork module opened from Window → "BIM Management Tool" or the "Storey/BIM Manager" header button. The BIM Manager module must be part of the purchased package (search snippets). — [cadwork BMT page](https://04.cadwork.com/modules/bim-management-tool/?lang=en); [cadwork BIM docs](https://docs.cadwork.com/projects/cwbim/en/latest/en/)
- STC "Steel Tools Center" is described as a cadwork plugin "for modeling, developing and producing metal parts inside cadwork". The companion "C-CONNECT Plugin cadwork" (metal-to-metal assemblies, 2026) was listed at Eurobois (single third-party source, search snippet). — [Eurobois listing](https://www.eurobois-events.com/fr/offering/38926eae-fcfc-f011-832e-6045bd95454f/c-connect-plugin-cadwork)
- Caddev is an entity of the W4C group, alongside Cadwork04, the cadwork distributor for France. It describes itself as software / web-app / 3D / AI development. It is cadwork's partner for "Catalogue Bois Bâtiment" (search snippets). — [W4C group entities](https://www.w4c.group/en/nos-entites); [04.cadwork Element](https://04.cadwork.com/element)

### Inferences
- **Docking route (high confidence, not documented):** a C++ DLL plugin linked against the *same* Qt 6.8.x as cadwork 2026 runs in-process and shares cadwork's `QApplication`. It can therefore cast `QWidget::find(get3DHWND())` to `QMainWindow` and call `addDockWidget(Qt::LeftDockWidgetArea, dock)`, tabifying with the existing docks. This would give exactly the look of the screenshot (STC and BMT as left-dock tabs).
  - BorderLine proves the parenting step; the `addDockWidget` step is my extrapolation.
  - BorderLine's `return false` after `show()` suggests the DLL stays loaded with a live non-modal UI. Not verified.
- **Python docking is risky:** because of the PyQt6 Qt-DLL mismatch, a PyQt6 window may run on a *second* Qt copy rather than cadwork's `QApplication`. In that case `QWidget.find(hwnd)` / `addDockWidget` on cadwork's main window will not work.
  - Python options are then:
    - (a) A floating, always-on-top PyQt6 or tkinter tool window positioned with `get_3d_main_window_geometry()`.
    - (b) Win32 `SetParent()` re-parenting via `get_3d_hwnd()`, which is fragile.
    - (c) A hybrid: a thin C++ Qt6 dock host that embeds the UI (Qt widgets or `QWebEngineView`, *if* cadwork ships QtWebEngine; unknown) and invokes Python actions via `run_external_program_from_custom_directory`-style calls. The C++ API exposes `runExternalProgramFromCustomDirectory`-type functions; I did not check the exact C++ name.
- The C++ route needs a toolchain that matches cadwork's ABI. cadwork ships MSVC-built Qt 6.8.3, so in practice that means Visual Studio 2022 (MSVC v143) and Qt 6.8.x MSVC2022 x64 (inference). The official repos only state CMake ≥ 3.21.1, C++23 (BorderLine) and vcpkg/Meson support.
- The .NET route exists only as an experimental 2024 template stuck at API v30. Do not build a 2026 product on it.

### Gaps
- No public source documents a supported "docking" API. I also found no technical description of how Caddev implements STC docking: caddev's own site was not found, and Eurobois and W4C could not be fetched.
- I could not confirm whether cadwork 2026 ships QtWebEngine/QtWebView, which would allow a web-UI panel.
- Exact MSVC/Qt build requirements for C++ plugins are not stated in the repos.
- No answer yet on resolving the PyQt6 Qt-version conflict (#291).

---

## 4. Third-party pip packages in cadwork's Python (requests, supabase-py, openpyxl, pandas)

### Takeaway
cadwork 2026 embeds CPython 3.14 as a DLL. There is **no `python.exe` to run pip against**. Packages go into `…\cadwork.dir\exe_2026\pclib.x64\python314\site-packages` (installed with `pip install --target` from a separate CPython 3.14 x64), are vendored into the plugin folder, or are added via `sys.path`.

### Cited Findings
- "cadwork ships **no standalone `python.exe`** — its Python is an embedded interpreter (`python3xx.dll`) loaded inside the running cadwork process… never run `pip` against cadwork's Python; the only thing you act on is the interpreter's `site-packages` directory (e.g. `exe_2026\pclib.x64\python314\site-packages`)". — [pycadwork docs/installation.md](https://github.com/Brunner246/pycadwork/blob/main/docs/installation.md)
- Native deps: "install … from your dev Python — which shares cadwork's `cp314` / `win_amd64` wheel tag … `uv pip install --target "D:\cadwork.dir\exe_2026\pclib.x64\python314\site-packages" rtree`". Live-edit dev install uses a directory junction (`mklink /J`) or a `.pth` file in site-packages. — [pycadwork docs/installation.md](https://github.com/Brunner246/pycadwork/blob/main/docs/installation.md)
- Official docs method: `sys.path.append(USERPROFIL + '\\api.x64\\FolderName\\PackageFolder')` before importing external packages. — [modules.md](https://github.com/cwapi3d/cwapi3dpython/blob/main/docs/modules.md)
- The site-packages path `Pclib.x64\python314\site-packages` already contains PyQt6 6.8.1 / PyQt6-Qt6 6.8.2 in cadwork 2026. — [Discussion #291](https://github.com/cwapi3d/cwapi3dpython/discussions/291)
- Community advice (2026-02-18): importing Pandas/NumPy in cadwork "seems a bit tricky". To read `.xlsx`, copy the pure-Python Excel library's files (~4 MB) into the plugin folder: "If you don't want to install the module, you can copy all its files … into your .py folder." — [Discussion #325](https://github.com/cwapi3d/cwapi3dpython/discussions/325)

### Inferences
- Pure-Python packages (requests, openpyxl, `postgrest`/`supabase` client layers) can be vendored, or installed with `pip install --target <site-packages> --python-version 3.14 --platform win_amd64 --only-binary=:all:`.
- Packages with compiled parts (pandas, numpy, pydantic-core used by supabase-py, PyQt) need **cp314 win_amd64** wheels.
- Writing into `exe_2026\…\site-packages` is per cadwork version. It probably needs admin rights if cadwork is under Program Files, and it is lost or duplicated on each cadwork major upgrade. Vendoring into the plugin folder, or a `.pth` file pointing to a Git-synced folder, is more robust for 2 PCs.
- For CCM/Supabase, calling the PostgREST HTTP endpoints directly with `urllib`/`requests` avoids supabase-py's heavier dependency tree, including the native `pydantic-core`.

### Gaps
- No official cadwork documentation on pip for v2026. The sources above are a cadwork collaborator's personal repo plus community threads.
- I did not verify whether `ssl`/certificates work out of the box in the embedded interpreter, which matters for HTTPS to Supabase.

---

## 5. Development workflow: stubs, debugging, hot reload, testing, versioning, distribution, licensing

### Takeaway
- Develop in an IDE against the PyPI stubs (`pip install cwapi3d==33.397.x` in a Python 3.14 venv).
- Run inside cadwork via the plugin bar, `/RUNPROGRAM=`, or the IDLE-based PythonConsole.
- Debug with the cadwork console (print/tracebacks) or remote debuggers (the PyCharm `pydevd` route is documented).
- Distribute via Git into `API.x64`.
- Cadwork publishes an **official MCP server** for its Python API, which plugs directly into Claude Code.
- Licensing of the API itself is not clearly published. Individual API functions respect cadwork module licences (lists, BTL…).

### Cited Findings
- Stubs/IDE: "Install the CWAPI3D package into your environment via `pip install cwapi3d`… The script cannot be run from the IDE (PyCharm, VS Code, ...). The script call must be made in cadwork (Plugin Bar)." — [get_started.md](https://github.com/cwapi3d/cwapi3dpython/blob/main/docs/get_started.md)
- Each module ships `py.typed` + `__init__.pyi` with long docstrings and examples. Docstrings were heavily rewritten "from the C++ implementation" on 2026-11-10/11 (PRs #434, #435, #450). — [commits](https://github.com/cwapi3d/cwapi3dpython/commits/main)
- **Official MCP server:** "MCP URL: `https://pyapi.mcp.cadwork.dev/mcp`". For Claude Code: `claude mcp add --transport http cadwork-pyapi https://pyapi.mcp.cadwork.dev/mcp`. It is meant for contextual answers, code generation and discovery grounded in the API docs. — [docs/mcp.md](https://github.com/cwapi3d/cwapi3dpython/blob/main/docs/mcp.md)
- The repo is also indexed on Context7. — [Context7 cwapi3dpython](https://context7.com/cwapi3d/cwapi3dpython)
- Debugging:
  - Enable the console via "User Test -> Userprofile -> Test Options... -> Console". After a restart a console shows print output and tracebacks.
  - Alternatively, use the IDLE debugger.
  - PyCharm Professional remote debug: `pip install pydevd-pycharm~=<ver>`, then `pydevd_pycharm.settrace('<ip>', port=12345, stdoutToServer=True, stderrToServer=True)`.
  - Source: [debug.md](https://github.com/cwapi3d/cwapi3dpython/blob/main/docs/debug.md)
- IDLE console plugin: clone `PythonConsole` into `API.x64\PythonConsole` and press F5 to "Run Module" in cadwork. The repo was last updated 2024-02-20 and its README still uses `userprofil_27`. — [get_started.md](https://github.com/cwapi3d/cwapi3dpython/blob/main/docs/get_started.md); [cwapi3d/PythonConsole](https://github.com/cwapi3d/PythonConsole)
- Dev loop without copying into API.x64: `/RUNPROGRAM="D:\tools\my_plugin.py"` ("handy for testing a plugin during development"). — [command_line.md](https://github.com/cwapi3d/cwapi3dpython/blob/main/docs/command_line.md)
- Testing pattern: pycadwork routes "all cadwork calls … through one adapter, so the suite (630 tests) runs against an in-memory fake without a running cadwork process". It targets Python 3.14 + uv and includes a `templates/my-plugin` template. — [pycadwork](https://github.com/Brunner246/pycadwork)
- Versioning guards:
  - Python: `if uc.get_3d_version() < 33: uc.print_error(...)`.
  - C++: `get_min_version_major/minor` exports.
  - PyPI majors track cadwork releases: 32 = 2025, 33 = 2026.
  - Sources: [utility_controller stub](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/utility_controller/__init__.pyi); [CwAPI3D.h](https://github.com/cwapi3d/cwapi3dcpp/blob/main/include/cwapi3d/CwAPI3D.h); [release_notes.md](https://github.com/cwapi3d/cwapi3dpython/blob/main/docs/release_notes.md)
- Side-by-side versions: install folders are `cadwork.dir\exe_2026`, `exe_2027`, selectable with `/EXE=`. — [command_line.md](https://github.com/cwapi3d/cwapi3dpython/blob/main/docs/command_line.md)
- Licensing:
  - The Python bindings, C++ headers and examples are **MIT**. — [cwapi3dpython](https://github.com/cwapi3d/cwapi3dpython); [cwapi3dcpp](https://github.com/cwapi3d/cwapi3dcpp)
  - cadwork North America lists "API" as a module for automating the 3D module with Python or C++ (search snippet; no price found). — [cadwork.ca API module](https://cadwork.ca/en/modules/api/)
  - Function-level gating: list exports "Does nothing without the cadwork 3D list license"; BTL export: "Nothing is exported if … no licence exists for the version". — [list_controller stub](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/list_controller/__init__.pyi); [machine_controller stub](https://github.com/cwapi3d/cwapi3dpython/blob/main/src/machine_controller/__init__.pyi)

### Inferences
- **VS Code / debugpy** is not documented. Because the interpreter is embedded and `sys.executable` is `3d.exe`, `debugpy.listen()` will probably need `debugpy.configure(python=r"C:\path\to\python314\python.exe")`, as with other embedded hosts (Blender/Maya). The PyCharm `settrace` route is the documented fallback.
- **Hot reload:** I found no documentation on whether the interpreter (and `sys.modules`) persists between plugin-bar launches. Keep the plugin entry script thin: put the logic in a package loaded via a junction or `.pth`, plus `importlib.reload` during development. Re-clicking the plugin button then picks up edits.
- **2-PC distribution:** clone the Git repo into each PC's `…\userprofil_XX\3d\API.x64\<PluginName>` (or junction it there). Vendor pure-Python dependencies in the repo, and add a `sys.path.insert` of the plugin dir (issue #432). Pin `cwapi3d==33.<minor>.*` stubs in a dev `requirements.txt` that matches the installed build (`get_3d_build()`).

### Gaps
- No official statement on whether API/Python plugin execution requires a paid "API" licence in Europe (France/Cadwork04). This needs to be asked of the reseller.
- No hot-reload or persistent-interpreter documentation.
- No VS Code debug guide.
- The user-profile folder name for 2026 (`userprofil_33`?) is not stated in current docs; old docs show `userprofil_27/28`.

---

## 6. Official and community repos; changes in the last month (2026-10-11 → 2026-11-11)

### Takeaway
The cwapi3d GitHub org is very active. Python and C++ stubs are synced with internal bindings almost weekly, with **8 PyPI releases inside the window** (33.382.0 → 33.397.17). Changes in the last month are additive: export options with level of detail, standard-element name/GUID lookup, spline creation, shop-drawing cuts, background colours, `get_user_edge`, and massive docstring rewrites. **None** add docking, events subscription or shortcut binding.

### Cited Findings
- Org `github.com/cwapi3d` (27 repos):
  - `cwapi3dpython` (updated 2026-11-11)
  - `cwapi3dcpp` (2026-11-09)
  - `cwmath` (math utilities, 2026-08-14)
  - `BorderLine` (C++/Qt6 JTC extension, 2026-03-16)
  - `filter_elements`, `STEPExporter`, `TruncatedConicLog` (Python examples, 2024)
  - `Cadwork.Templates` (C#, 2024-09-10)
  - forks of `vcpkg` / `MINGW-packages`
  - Source: [github.com/cwapi3d](https://github.com/cwapi3d)
- Other official/community repos:
  - `cwapi3d/PythonConsole` / `CadworkMontreal/PythonConsole` (IDLE console). — [PythonConsole](https://github.com/cwapi3d/PythonConsole)
  - `Brunner246/pycadwork`, an OO wrapper with tests, a plugin template and SQL pull/push (v0.1.0). — [pycadwork](https://github.com/Brunner246/pycadwork)
  - `Brunner246/cwapi3dcpp-ex`, C++ helper library used by BorderLine. — [BorderLine CMakeLists.txt](https://github.com/cwapi3d/BorderLine/blob/main/CMakeLists.txt)
  - A 2D API org `cwapi2d/cwapi2dpython` also exists (search result only). — [cwapi2dpython](https://github.com/cwapi2d/cwapi2dpython)
- Official API videos: "Building DualExport", "Auto-Attributes", "Cadwork API Presentation" (German). — [videos.md](https://github.com/cwapi3d/cwapi3dpython/blob/main/docs/videos.md)
- **Releases in the window.** PyPI upload date first; release-notes dates sometimes differ by a day. Sources: [release_notes.md](https://github.com/cwapi3d/cwapi3dpython/blob/main/docs/release_notes.md) and [PyPI JSON](https://pypi.org/pypi/cwapi3d/json).
  - 33.382.0 (2026-10-13): fixed the `material_controller.set_texture_transparency(material_id, transparency 0–100)` signature.
  - 33.383.0 (2026-10-13): `file_controller.export_file_with_options` + `get_sat/step/iges_export_options`; new `cadwork.element_level_of_detail_options`, `file_export_format`, `sat/step/iges_export_options`.
  - 33.384.0 (2026-10-20): `element_controller.create_spline_from_surfaces`, `create_spline_from_surface_and_line`; `shop_drawing_controller.get_wall_sections`, `get_export_solid_cuts`; new classes `wall_section`, `export_solid_cut`.
  - 33.392.0 (2026-10-29; notes say 10-27): `element_controller.get_standard_element_guid_from_name`, `get_standard_element_name_from_guid`.
  - 33.394.0 (2026-10-29): docs only (name/folder limits of standard elements).
  - 33.394.1 (2026-11-03), PyPI only.
  - 33.396.0 (2026-11-04): `visualization_controller.get/set_background_color`, `get/set_background_type`; enums `render_view_type`, `background_type`.
  - 33.397.0 (2026-11-05): `utility_controller.get_user_edge`.
  - 33.397.2 (2026-11-10) and **33.397.17 (2026-11-11)**: docstring overhaul (PRs #434, #435, #450). The release notes page has no entries for these yet.
- Just before the window:
  - 33.378.0 (2026-10-07): `cadwork.event_type` enum, navigation-widget control, `get_additional_data_keys`, `bim_controller.load_ifc_export_settings`, prefab layer queries, multi-layer editing.
  - 33.380.0 (2026-10-09): shop-drawing export solid cuts / wall sections, many `element_type` tests, `shortcut_key_modifier.no_modifier`.
  - Source: [release_notes.md](https://github.com/cwapi3d/cwapi3dpython/blob/main/docs/release_notes.md)
- C++ repo commits in the window:
  - "[API-683] Added getStandardElementGuidFromName…" (2026-10-29)
  - "[API-685] … background color/type" (2026-11-04)
  - "[API-707] added utility_controller getUserEdge, API version 397" (2026-11-05)
  - OpenSSF Scorecard (2026-11-09)
  - Source: [cwapi3dcpp commits](https://github.com/cwapi3d/cwapi3dcpp/commits/main)
- Community activity in the window:
  - Discussion #420 "How can I submit multiple jobs to the same running Cadwork 3D instance?" (2026-10-13, unanswered).
  - #422 "Cadwork GUID stability" (2026-10-20, unanswered).
  - #291 Qt conflict reproduction (2026-10-30).
  - Issue #432 plugin folder not on sys.path (2026-11-09).
  - Sources: [Discussions](https://github.com/cwapi3d/cwapi3dpython/discussions); [Issue #432](https://github.com/cwapi3d/cwapi3dpython/issues/432)

### Inferences
- The API minor number (397) tracks the internal cadwork build ("matching the build number +1 manually for now", comment in [CwAPI3DVersion.h](https://github.com/cwapi3d/cwapi3dcpp/blob/main/include/cwapi3d/CwAPI3DVersion.h)). A function that appears in stubs 33.39x may therefore **not exist** in an older cadwork 2026 service pack installed on the PCs. Guard with `get_3d_build()` / `hasattr`.
- Unanswered #420 suggests there is no official IPC for an external process to drive a running cadwork. An external CCM desktop/web app cannot push commands into cadwork; the add-on must pull from CCM.

### Gaps
- I could not read cadwork's own KB changelog pages for 2026 service packs (kb.cadwork.ch blocked). Nothing official was found on LinkedIn or YouTube for Oct–Nov 2026.
- I found no public information on Caddev's development stack, no Caddev website, and no official cadwork "partner plugin SDK" programme.
