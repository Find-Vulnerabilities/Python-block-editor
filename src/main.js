import {
  initWorkspace, runCurrentWorkspace, loadBlocks, clearWorkspace,
  loadExample, exportPython, saveBlocks
} from './core/workspace.js';
import { initPyodideWorker, setConsoleOutput, setRunButton } from './pyodide/runner.js';
import { turtleAPI } from './turtle/turtleGraphics.js';

let deferredPrompt = null;

// PWA install prompt
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const btn = document.getElementById('btn-install-pwa');
  if (btn) { btn.style.display = ''; btn.classList.add('pulse'); }
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(reg =>
      console.log('[PWA] Service Worker registered:', reg.scope)
    ).catch(err =>
      console.warn('[PWA] Service Worker registration failed:', err)
    );
  });
}

window.addEventListener('DOMContentLoaded', () => {
  const consoleOutput = document.getElementById('console-output');
  const runBtn = document.getElementById('btn-run');
  if (consoleOutput) setConsoleOutput(consoleOutput);
  if (runBtn) setRunButton(runBtn);
  window.turtleAPI = turtleAPI;
  initEditor();
});

function initEditor() {
  initPyodideWorker();
  turtleAPI.reset();
  initWorkspace();

  // --- wire up all the UI buttons ---
  setupTabSwitcher();
  setupPWAInstall();
  setupDownloadDropdown();

  document.getElementById('btn-load')?.addEventListener('click', () => {
    document.getElementById('file-input')?.click();
  });

  document.getElementById('btn-run')?.addEventListener('click', () => runCurrentWorkspace());

  document.getElementById('btn-stop')?.addEventListener('click', () => {
    const co = document.getElementById('console-output');
    if (co) co.textContent += '\n[ 🛑 Execution force-stopped by user ]\n';
    initPyodideWorker();
  });

  document.getElementById('btn-clear-console')?.addEventListener('click', () => {
    const co = document.getElementById('console-output');
    if (co) co.textContent = '';
  });

  document.getElementById('btn-clear-blocks')?.addEventListener('click', () => clearWorkspace());

  const sel = document.getElementById('example-select');
  if (sel) {
    sel.addEventListener('change', (e) => {
      if (!e.target.value) return;
      loadExample(e.target.value);
      e.target.value = '';
    });
  }

  const fileInput = document.getElementById('file-input');
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const f = e.target.files[0];
      if (!f) return;
      const r = new FileReader();
      r.onload = (ev) => loadBlocks(ev.target.result);
      r.readAsText(f);
      fileInput.value = '';
    });
  }

  setupDragAndDrop();
}

function setupDownloadDropdown() {
  const btn = document.getElementById('btn-download');
  const menu = document.getElementById('dropdown-download-menu');
  if (!btn || !menu) return;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.classList.toggle('toolbar-dropdown-open');
  });

  menu.querySelectorAll('.toolbar-dropdown-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      menu.classList.remove('toolbar-dropdown-open');
      const fmt = item.dataset.fmt;
      if (fmt === 'py') exportPython('script.py');
      else if (fmt === 'json') saveBlocks();
    });
  });

  document.addEventListener('click', () => {
    menu.classList.remove('toolbar-dropdown-open');
  });
}

function setupTabSwitcher() {
  const tabConsole = document.getElementById('tab-console');
  const tabTurtle = document.getElementById('tab-turtle');
  const cc = document.getElementById('console-container');
  const cav = document.getElementById('canvas-container');
  if (!tabConsole || !tabTurtle) return;

  tabConsole.addEventListener('click', () => {
    tabConsole.classList.add('active');
    tabTurtle.classList.remove('active');
    if (cc) cc.style.display = 'flex';
    if (cav) cav.style.display = 'none';
  });

  tabTurtle.addEventListener('click', () => {
    tabTurtle.classList.add('active');
    tabConsole.classList.remove('active');
    if (cav) cav.style.display = 'flex';
    if (cc) cc.style.display = 'none';
    const canvas = document.getElementById('turtle-canvas');
    if (canvas && window.turtleAPI) {
      const tw = Math.floor(canvas.parentElement.clientWidth * 0.9);
      const th = Math.floor(canvas.parentElement.clientHeight * 0.9);
      if (canvas.width !== tw || canvas.height !== th) {
        canvas.width = tw;
        canvas.height = th;
        window.turtleAPI.reset();
      }
    }
  });
}

function setupDragAndDrop() {
  const dropTarget = document.body;

  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(evt => {
    dropTarget.addEventListener(evt, (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
  });

  ['dragenter', 'dragover'].forEach(evt => {
    dropTarget.addEventListener(evt, () => dropTarget.classList.add('drag-over'));
  });

  ['dragleave', 'drop'].forEach(evt => {
    dropTarget.addEventListener(evt, () => dropTarget.classList.remove('drag-over'));
  });

  dropTarget.addEventListener('drop', (e) => {
    const files = e.dataTransfer?.files;
    if (!files || files.length === 0) return;

    const jsonFiles = Array.from(files).filter(f => f.name.endsWith('.json'));
    if (jsonFiles.length === 0) {
      alert('Only .json files are supported. Please drop a Blockly workspace JSON file.');
      return;
    }

    const f = jsonFiles[0];
    const reader = new FileReader();
    reader.onload = (ev) => loadBlocks(ev.target.result);
    reader.readAsText(f);
  });
}

function setupPWAInstall() {
  const btn = document.getElementById('btn-install-pwa');
  if (!btn) return;
  if (window.matchMedia('(display-mode: standalone)').matches) btn.style.display = 'none';
  btn.addEventListener('click', async () => {
    if (!deferredPrompt) {
      alert('📲 Click the install icon in your browser address bar, or use "Add to Home Screen" in your browser menu.');
      return;
    }
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    btn.style.display = 'none';
    btn.classList.remove('pulse');
  });
}
