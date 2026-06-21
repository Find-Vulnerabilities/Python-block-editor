import {
  initWorkspace, exportPython, saveBlocks, loadBlocks, clearWorkspace,
  loadExample, runCurrentWorkspace, getWorkspaceState, loadWorkspaceState,
  setSaveMode
} from './core/workspace.js';
import { initPyodideWorker, setConsoleOutput, setRunButton, runPythonCode } from './pyodide/runner.js';
import { turtleAPI } from './turtle/turtleGraphics.js';
import {
  createProject, getProject, readFile, writeFile, getAllFiles
} from './core/filesystem.js';
import { initHomepage } from './ui/homepage.js';
import { initFileExplorer, refresh as refreshExplorer, setActiveFile } from './ui/fileExplorer.js';

// ==================== State ====================
let currentMode = null;
let currentProjectId = null;
let currentFilePath = null;
let deferredPrompt = null;

// ==================== PWA Setup ====================
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

// ==================== Bootstrap ====================
window.addEventListener('DOMContentLoaded', () => {
  const consoleOutput = document.getElementById('console-output');
  const runBtn = document.getElementById('btn-run');
  if (consoleOutput) setConsoleOutput(consoleOutput);
  if (runBtn) setRunButton(runBtn);
  window.turtleAPI = turtleAPI;

  handleRoute();
  window.addEventListener('hashchange', handleRoute);
});

// ==================== Routing ====================
function handleRoute() {
  const hash = window.location.hash || '#home';
  if (hash === '#home') showHomepage();
  else if (hash === '#editor/single') showSingleFileEditor();
  else if (hash.startsWith('#editor/project/')) {
    showProjectEditor(hash.replace('#editor/project/', ''));
  }
}

function navigate(route) { window.location.hash = route; }

// ==================== Homepage ====================
function showHomepage() {
  currentMode = null;
  document.getElementById('homepage-view').style.display = '';
  document.getElementById('editor-view').style.display = 'none';
  initHomepage(document.getElementById('homepage-view'), navigate);
}

// ==================== Single-File Editor ====================
function showSingleFileEditor() {
  currentMode = 'single';
  currentProjectId = null;
  currentFilePath = null;

  document.getElementById('homepage-view').style.display = 'none';
  document.getElementById('editor-view').style.display = 'flex';
  document.getElementById('sidebar').style.display = 'none';
  document.getElementById('toolbar-title').textContent = 'Python Block Editor';
  document.getElementById('example-select').style.display = '';
  document.body.className = 'single-mode';

  setSaveMode('localStorage');
  initPyodideWorker();
  turtleAPI.reset();
  initWorkspace();
  setupSingleFileListeners();
}

function setupSingleFileListeners() {
  setupTabSwitcher();
  setupPWAInstall();

  // File input (for loading .json)
  const fileInput = document.getElementById('file-input');
  if (fileInput) {
    const ni = fileInput.cloneNode(true);
    fileInput.parentNode.replaceChild(ni, fileInput);
    ni.addEventListener('change', (e) => {
      const f = e.target.files[0];
      if (!f) return;
      const r = new FileReader();
      r.onload = (ev) => loadBlocks(ev.target.result);
      r.readAsText(f);
      ni.value = '';
    });
  }

  document.getElementById('btn-back-home')?.addEventListener('click', () => navigate('#home'));
  document.getElementById('btn-run')?.addEventListener('click', () => runCurrentWorkspace());
  document.getElementById('btn-clear-console')?.addEventListener('click', () => {
    const co = document.getElementById('console-output'); if (co) co.textContent = '';
  });
  document.getElementById('btn-clear-blocks')?.addEventListener('click', () => clearWorkspace());
  document.getElementById('btn-stop')?.addEventListener('click', () => {
    const co = document.getElementById('console-output');
    if (co) co.textContent += '\n[ 🛑 Execution force-stopped by user ]\n';
    initPyodideWorker();
  });

  // Example select
  const sel = document.getElementById('example-select');
  if (sel) {
    const ns = sel.cloneNode(true);
    sel.parentNode.replaceChild(ns, sel);
    ns.addEventListener('change', (e) => {
      if (!e.target.value) return;
      loadExample(e.target.value);
      e.target.value = '';
    });
  }
}

// ==================== Project Editor ====================
async function showProjectEditor(projectId) {
  currentMode = 'project';

  if (projectId === 'new') {
    const name = prompt('Project name:', 'My Python Project');
    if (!name) { navigate('#home'); return; }
    try {
      const p = await createProject(name);
      window.location.hash = '#editor/project/' + p.id;
      return;
    } catch (err) {
      alert('Error creating project: ' + err.message);
      navigate('#home');
      return;
    }
  }

  currentProjectId = projectId;
  const project = await getProject(projectId).catch(() => null);
  if (!project) { alert('Project not found.'); navigate('#home'); return; }

  document.getElementById('homepage-view').style.display = 'none';
  document.getElementById('editor-view').style.display = 'flex';
  document.getElementById('sidebar').style.display = 'block';
  document.getElementById('toolbar-title').textContent = project.name;
  document.getElementById('example-select').style.display = 'none';
  document.body.className = 'project-mode';

  // Auto-save to current file in IndexedDB
  setSaveMode('filesystem', projectId, (_path, content) => {
    if (currentFilePath && currentProjectId) {
      writeFile(currentProjectId, currentFilePath, content).catch(console.error);
    }
  });

  initPyodideWorker();
  turtleAPI.reset();
  initWorkspace();

  // Init file explorer sidebar
  initFileExplorer(
    document.getElementById('sidebar'),
    projectId,
    // onFileOpen
    async (path, content) => {
      currentFilePath = path;
      setActiveFile(path);
      const ok = loadWorkspaceState(content);
      if (!ok) {
        const cd = document.getElementById('codeDiv');
        if (cd) cd.textContent = content;
      }
      document.getElementById('toolbar-title').textContent = project.name + ' — ' + path;
    },
    () => {}
  );

  await refreshExplorer();
  setupProjectListeners(projectId);

  // Auto-open first file
  const allFiles = await getAllFiles(projectId);
  const firstFile = allFiles.find(f => f.path === 'main.py')
    || allFiles.find(f => f.path.endsWith('.py'))
    || allFiles.find(f => f.path.endsWith('.json'))
    || allFiles[0];
  if (firstFile) {
    currentFilePath = firstFile.path;
    setActiveFile(firstFile.path);
    const ok = loadWorkspaceState(firstFile.content);
    if (!ok) {
      const cd = document.getElementById('codeDiv');
      if (cd) cd.textContent = firstFile.content;
    }
    document.getElementById('toolbar-title').textContent = project.name + ' — ' + firstFile.path;
  }
}

function setupProjectListeners(projectId) {
  setupTabSwitcher();
  setupPWAInstall();

  document.getElementById('btn-back-home')?.addEventListener('click', () => navigate('#home'));

  // Run
  document.getElementById('btn-run')?.addEventListener('click', async () => {
    const ws = window._blocklyWorkspace;
    const pg = window._blocklyPython;
    if (!ws || !pg) return;
    const code = pg.workspaceToCode(ws);
    const displayCode = code.replace(/^(\s*)await /gm, '$1');
    const allFiles = await getAllFiles(projectId);
    runProjectCode(displayCode, allFiles);
  });

  // Stop
  document.getElementById('btn-stop')?.addEventListener('click', () => {
    const co = document.getElementById('console-output');
    if (co) co.textContent += '\n[ 🛑 Execution force-stopped by user ]\n';
    initPyodideWorker();
  });

  // Clear blocks
  document.getElementById('btn-clear-blocks')?.addEventListener('click', () => clearWorkspace());

  // Clear console
  document.getElementById('btn-clear-console')?.addEventListener('click', () => {
    const co = document.getElementById('console-output'); if (co) co.textContent = '';
  });

  // Load .json into workspace
  const fileInput = document.getElementById('file-input');
  if (fileInput) {
    const ni = fileInput.cloneNode(true);
    fileInput.parentNode.replaceChild(ni, fileInput);
    ni.addEventListener('change', (e) => {
      const f = e.target.files[0];
      if (!f) return;
      const r = new FileReader();
      r.onload = (ev) => loadBlocks(ev.target.result);
      r.readAsText(f);
      ni.value = '';
    });
  }
}

// ==================== Multi-file Python Execution ====================
async function runProjectCode(mainCode, allFiles) {
  const extraFiles = allFiles
    .filter(f => f.path.endsWith('.py'))
    .map(f => ({
      path: f.path,
      content: f.content.replace(/^(\s*)await /gm, '$1')
    }));

  let preamble = 'import sys, os\n';
  const addedPaths = new Set();

  for (const f of extraFiles) {
    if (currentFilePath && f.path === currentFilePath) continue;
    const safePath = '/' + f.path;
    const dir = f.path.includes('/') ? f.path.slice(0, f.path.lastIndexOf('/')) : '';
    if (dir && !addedPaths.has(dir)) {
      preamble += `os.makedirs('/${dir}', exist_ok=True)\n`;
      addedPaths.add(dir);
    }
    preamble += `with open('${safePath}', 'w') as _f:\n    _f.write(${JSON.stringify(f.content)})\n`;
    if (dir) preamble += `sys.path.insert(0, '/${dir}')\n`;
  }
  if (currentFilePath) {
    preamble += `with open('/${currentFilePath}', 'w') as _f:\n    _f.write(${JSON.stringify(mainCode)})\n`;
  }
  preamble += "sys.path.insert(0, '/')\n";

  runPythonCode(preamble + '\n' + mainCode);
}

// ==================== Shared Helpers ====================
function setupTabSwitcher() {
  const tabConsole = document.getElementById('tab-console');
  const tabTurtle = document.getElementById('tab-turtle');
  const cc = document.getElementById('console-container');
  const cav = document.getElementById('canvas-container');
  if (!tabConsole || !tabTurtle) return;

  const nc = tabConsole.cloneNode(true);
  const nt = tabTurtle.cloneNode(true);
  tabConsole.parentNode.replaceChild(nc, tabConsole);
  tabTurtle.parentNode.replaceChild(nt, tabTurtle);

  nc.addEventListener('click', () => {
    nc.classList.add('active'); nt.classList.remove('active');
    if (cc) cc.style.display = 'flex';
    if (cav) cav.style.display = 'none';
  });
  nt.addEventListener('click', () => {
    nt.classList.add('active'); nc.classList.remove('active');
    if (cav) cav.style.display = 'flex';
    if (cc) cc.style.display = 'none';
    const canvas = document.getElementById('turtle-canvas');
    if (canvas && window.turtleAPI) {
      const tw = Math.floor(canvas.parentElement.clientWidth * 0.9);
      const th = Math.floor(canvas.parentElement.clientHeight * 0.9);
      if (canvas.width !== tw || canvas.height !== th) {
        canvas.width = tw; canvas.height = th;
        window.turtleAPI.reset();
      }
    }
  });
}

function setupPWAInstall() {
  const btn = document.getElementById('btn-install-pwa');
  if (!btn) return;
  const nb = btn.cloneNode(true);
  btn.parentNode.replaceChild(nb, btn);
  if (window.matchMedia('(display-mode: standalone)').matches) nb.style.display = 'none';
  nb.addEventListener('click', async () => {
    if (!deferredPrompt) {
      alert('📲 Click the install icon in your browser address bar, or use "Add to Home Screen" in your browser menu.');
      return;
    }
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    nb.style.display = 'none';
    nb.classList.remove('pulse');
  });
}
