# Python Block Editor

A browser-based block editor for Python, built on Google Blockly and Pyodide. Drag blocks around, see the Python code update live, and run it — all in the browser.

## How it works

- **Blockly** provides the visual block workspace
- **Pyodide** (CPython on WebAssembly) runs the code in a Web Worker
- Turtle graphics are drawn on an HTML5 Canvas
- Blocks save to localStorage, so your work persists across reloads

## Running locally

```bash
npm install
npm run dev
```

Build for production:
```bash
npm run build
npm run preview
```

## Blocks

Supports the usual Blockly built-ins (logic, loops, math, text, lists, variables, functions) plus custom blocks for:

- **Turtle graphics** — forward, backward, right, left, penup/pendown, color, pensize, circle, goto, fill, stamp, write, speed, etc.
- **Dictionaries & tuples** — create, get/set, keys, slice, unpack
- **OOP** — class definitions, instantiation, attribute access
- **Exceptions** — try/except with named exception variable
- **External modules** — import, from-import, import-as, call functions with args
- **Type casting** — int, float, str
- **Raw Python** — inline any Python expression or statement
- **input()** — bridges to browser `prompt()`
- **time.sleep** and **random.randint** built in

## Turtle graphics

The turtle module runs asynchronously — commands from the Blockly workspace generate `await turtle.forward(...)` etc. The displayed/exported code strips the `await` so it's standard Python. The canvas auto-resizes and the turtle tab switches automatically when `import turtle` is detected.

## Tech stack

Blockly v11 · Pyodide v0.24.1 · Vite 5 · Highlight.js · PWA (service worker + manifest)

## License

See [LICENSE](LICENSE).
