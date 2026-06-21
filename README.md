# Python Block Editor

## A Visual Programming Environment for Python — In the Browser

### Overview

The Python Block Editor is a browser-based visual programming environment that lets you build Python programs by dragging and connecting blocks. Powered by **Google Blockly v11** for the visual interface and **Pyodide** (Python-on-WebAssembly) for execution, it generates real, readable Python code in real time and runs it entirely in your browser — no server, no installation.

It supports **two workflows**:

1. **Single File** — A quick scratchpad for experimenting with blocks and running one-off scripts. Auto-saves to localStorage.
2. **Multi-file Project** — A full project manager with a VSCode-style file explorer, IndexedDB-backed virtual filesystem, and cross-file Python execution.

It's also a **PWA** (Progressive Web App) — you can install it to your desktop and use it offline once the initial assets are cached.

---

## Features at a Glance

| Category | What You Get |
|---|---|
| **Visual Editor** | Drag-and-drop block workspace (Blockly v11) with instant Python code preview |
| **Live Code Gen** | Real-time syntax-highlighted Python output (Highlight.js, atom-one-dark theme) |
| **Browser Python** | Pyodide v0.24.1 — CPython 3.11 running on WebAssembly in a Web Worker |
| **Turtle Graphics** | Full turtle module on an HTML canvas — movement, pen, color, fill, stamp, write |
| **Multi-file Projects** | IndexedDB-backed projects with folders, multiple .py/.json/.txt files |
| **File Explorer** | VSCode-style sidebar tree: new file/folder, rename, delete, duplicate, download |
| **Project I/O** | Export as .pyblocks-project.json or .zip; import .json projects; download individual files |
| **Examples** | Hello World, Count to 10, Guess Number Game, Turtle Square — load from toolbar |
| **PWA** | Install to desktop, service worker caching, works offline after first load |
| **Homepage** | Landing screen with Single File / Multi-file Project cards, recent projects, import |
| **Block Toolbox** | 13 categories covering logic, loops, math, text, lists, tuples, dicts, OOP, exceptions, turtle, raw code, external modules, type casting |

---

## Block Toolbox — Complete Category List

### 1. Logic
`if/elif/else`, comparison operators (`==`, `!=`, `<`, `>`, `<=`, `>=`), `and`/`or`, `True`/`False`, `not`

### 2. Loops
`for i in range(n)`, `for i from X to Y step Z`, `while`/`until`, `break`/`continue`

### 3. Math
Numbers, arithmetic (`+`, `-`, `*`, `/`, `**`), trig (`sin`, `cos`, `tan`), constants (`π`, `e`), rounding, modulo, random int/float, list math (sum, min, max, average, median, etc.)

### 4. Text
String literals, `print()`, string join, length, `input()` (browser prompt with type casting support)

### 5. Type Casting
`int()`, `float()`, `str()` — dropdown selector, useful for converting `input()` strings

### 6. Lists & Dicts (Arrays)
List create/repeat/append/length/isEmpty/indexOf/getIndex/setIndex, plus **Tuple blocks**: create, index, length, slice, count, index-find, unpack

### 7. Variables
Blockly's built-in variable management — create, rename, delete, getter and setter blocks

### 8. Functions
Blockly's built-in procedure system — define functions with parameters, return values; callable blocks auto-generated

### 9. Turtle Graphics (21 blocks)
`import turtle`, `forward`, `backward`, `right`, `left`, `penup`, `pendown`, `color`, `pensize`, `circle`, `goto(x,y)`, `speed`, `clear`, `xcor`, `ycor`, `begin_fill`, `end_fill`, `fillcolor`, `setheading`, `heading`, `write`, `stamp`

### 10. Dictionaries
Empty dict `{}`, get by key, set key-value, delete key, get all keys

### 11. OOP (Classes)
`class` definition (with statement body for methods), `new` instantiation, get attribute/method, set attribute

### 12. Exceptions
`try`/`except Exception as e` — named exception variable for inspection

### 13. Advanced / Raw Code
`raw code (value)` — inline any Python expression (dict literals, list comprehensions, lambdas)
`raw code (stmt)` — inline any Python statement block (context managers, decorators, custom constructs)

### 14. External Modules
`import X`, `from X import Y`, `import X as Y`, call function with args (value or statement), `time.sleep()`, `random.randint()`

Blocks ship with pre-filled module names: `math`, `random`, `time`, `datetime`, `json` — all editable via text fields.

---

## Supported Python Features

Everything the blocks can express, plus:

- **All standard library modules available in Pyodide** (`math`, `random`, `time`, `datetime`, `json`, `os`, `sys`, `re`, `itertools`, `collections`, and many more)
- **`await` bridging** — blocking calls like `time.sleep()` and turtle commands use `await` under the hood (auto-stripped in displayed/exported code so it's standard Python)
- **`input()` as browser `prompt()`** — captured via async bridge
- **Error output** — stderr appears in console with full Python traceback formatting

---

## Project Mode — Multi-file Workflow

The **Project** system is a full virtual filesystem stored in IndexedDB:

### File Management
- **Create** `.py`, `.json`, or `.txt` files and nested folders
- **Rename**, **delete**, **duplicate** files
- **Download** individual files as raw content or as Blockly workspace JSON
- **Import** `.json` files from disk
- **Export** entire project as `.pyblocks-project.json` (re-importable) or `.zip`

### Multi-file Python Execution
When you click **Run** in project mode, all `.py` files in the project are written into the Pyodide virtual filesystem before execution. This means files can `import` each other — build real multi-module Python projects.

### File Explorer (Sidebar)
- VSCode-style tree view with indentation
- Folder expand/collapse with chevrons
- Active file highlighting
- Path breadcrumb bar
- Selected folder tracking (new files/folders created inside the selected folder)
- Action buttons appear on hover (download, duplicate, rename, delete)

---

## Single-File Mode

Quick-start mode for one-off scripts:
- No project management overhead
- Auto-saves workspace to `localStorage` on every block change
- Load/save workspace as `.json` files
- Export generated Python as `.py`
- Example loader in the toolbar

---

## Interface Layout

### Homepage (`#home`)
- Two large cards: **Create Single File** and **Create Multi-file Project**
- **Import Project** button to load a `.pyblocks-project.json`
- **Recent Projects** list with quick-open and delete (from IndexedDB)

### Editor View
```
┌─ Toolbar ──────────────────────────────────────────────────┐
│ 🏠  [Title]  [Examples▼]  [▶Run] [🛑Stop] [🗑️Clear]      │
├──────────┬──────────────────────┬───────────────────────────┤
│ File     │  Blockly Workspace   │  Right Panel              │
│ Explorer │  (drag blocks here)  │  ┌─ Python Code (hljs) ─┐ │
│ (project │                      │  │                      │ │
│  mode    │                      │  └──────────────────────┘ │
│  only)   │                      │  ┌ Console │ Turtle ────┐ │
│          │                      │  │ stdout / stderr      │ │
│          │                      │  │ or turtle canvas     │ │
│          │                      │  └──────────────────────┘ │
└──────────┴──────────────────────┴───────────────────────────┘
```

---

## How to Run

### Prerequisites
- A modern browser (Chrome, Firefox, Edge, Safari) with WebAssembly support
- Internet connection for the first load (Pyodide ~6-8 MB, Blockly library from CDN)
- After first load, the PWA service worker caches assets for offline use

### Local Development
```bash
npm install
npm run dev      # starts Vite dev server
```

### Production Build
```bash
npm run build    # outputs to dist/
npm run preview  # preview the production build locally
```

### Deploy
Serve the `dist/` directory (after `npm run build`) or the project root through any static file server. The `netlify.toml` config is included for one-click Netlify deployment.

---

## Technical Architecture

| Component | Technology |
|---|---|
| Block Workspace | Google Blockly v11.1.1 |
| Code Generation | Blockly Python Generator |
| Python Runtime | Pyodide v0.24.1 (CPython on WebAssembly) |
| Execution Isolation | Web Worker (sandboxed, non-blocking) |
| Turtle Graphics | HTML5 Canvas 2D + JavaScript bridge |
| Syntax Highlighting | Highlight.js 11.9 (atom-one-dark theme) |
| Project Storage | IndexedDB (`pyblocks-fs` database) |
| Single-file Storage | Browser localStorage |
| ZIP Export | JSZip 3.10.1 |
| Build Tool | Vite 5 |
| PWA | Service Worker + Web App Manifest |

### How Execution Works
1. Blockly generates Python code from the workspace
2. Code is posted to a **Web Worker** running Pyodide
3. The Worker runs the Python code with monkey-patched `input()` (→ browser prompt) and a virtual `turtle` module (→ canvas drawing via message passing)
4. `stdout` and `stderr` are streamed back and displayed in the Console Output panel
5. Turtle commands are bridged as async calls to the main thread's Canvas 2D API

### Turtle Graphics System
The turtle module is implemented as:
- A JavaScript API object (`turtleAPI`) on the main thread that draws on an HTML5 Canvas
- A Python module shim injected into Pyodide that translates turtle calls into async messages
- Speed control: `turtle.speed(0)` disables animation delay; speeds 1-10 map to decreasing delays

---

## File Structure

```
├── index.html                  # Entry point — imports Blockly, Pyodide, JSZip, Highlight.js
├── package.json                # Vite + Blockly dependency
├── vite.config.js              # Vite config
├── netlify.toml                # Netlify deploy config
├── public/                     # Static assets
│   ├── icon-192.png / 512.png  # PWA icons
│   ├── icon.svg
│   ├── manifest.json           # PWA manifest
│   ├── sw.js                   # Service Worker
│   ├── robots.txt / sitemap.xml
├── src/
│   ├── main.js                 # App entry — routing, PWA, mode setup, event wiring
│   ├── blocks/
│   │   └── customBlocks.js     # All custom Blockly block definitions
│   ├── config/
│   │   ├── toolbox.js          # Toolbox category + block layout
│   │   └── examples.js         # Built-in example workspaces (JSON)
│   ├── core/
│   │   ├── workspace.js        # Blockly init, code gen, save/load, auto-save
│   │   └── filesystem.js       # IndexedDB-backed virtual filesystem (CRUD, import/export)
│   ├── generators/
│   │   └── pythonGenerators.js # Custom Blockly → Python code generators
│   ├── pyodide/
│   │   ├── runner.js           # Worker lifecycle, message dispatch, tab switching
│   │   └── workerScript.js     # Web Worker inline script — Pyodide init, Python shims
│   ├── turtle/
│   │   └── turtleGraphics.js   # Canvas 2D turtle drawing implementation
│   ├── ui/
│   │   ├── homepage.js         # Landing page with cards, recent projects, import
│   │   └── fileExplorer.js     # VSCode-style sidebar tree view
│   └── styles/
│       ├── main.css            # Editor layout, toolbar, right panel, responsive
│       ├── homepage.css        # Homepage styling
│       └── fileExplorer.css    # File explorer tree styling
```

---

## Examples Included

| Example | What It Shows |
|---|---|
| 👋 Hello World | Basic `print()` block |
| 🔢 Count to 10 | `for` loop with variable printing |
| 🎲 Guess Number Game | Random int, while loop, if/elif/else, `input()`, type casting |
| 🐢 Turtle Square | Turtle import, `for` loop, forward + right to draw a square |

---

## Browser Support

| Browser | Status |
|---|---|
| Chrome 90+ | ✅ Full support |
| Firefox 90+ | ✅ Full support |
| Edge 90+ | ✅ Full support |
| Safari 15+ | ✅ Full support (WebAssembly required) |

---

## Extending the Editor

1. **Add new blocks** — Define in `src/blocks/customBlocks.js` following Blockly's JSON API
2. **Add code generators** — Register in `src/generators/pythonGenerators.js` via `pythonGenerator.forBlock`
3. **Add toolbox categories** — Edit `src/config/toolbox.js`
4. **Add turtle commands** — Extend `src/turtle/turtleGraphics.js` and the Python shim in `src/pyodide/workerScript.js`
5. **Add examples** — Add entries to `src/config/examples.js` in Blockly workspace JSON format

---

## Limitations

- **Network required for first load** — Pyodide loads from CDN (~6-8 MB). Subsequent loads use browser cache / PWA service worker.
- **Standard library only** — Modules available are those in Pyodide's build. Binary extensions (C-extensions) are not supported.
- **Single-threaded execution** — Code runs in one Web Worker; no true parallelism.
- **No persistent filesystem I/O** — Files exist in IndexedDB (projects) or localStorage (single-file); no access to the host filesystem beyond explicit import/export.
- **`await` in generated code** — The editor uses top-level `await` internally for async turtle/input/sleep. Displayed and exported code strips these so it's standard Python, but if you copy code from the console mid-execution you may see `await` prefixes.

---

## License

See [LICENSE](LICENSE) for details.
