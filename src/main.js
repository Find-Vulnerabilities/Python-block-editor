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
  const btnMobile = document.getElementById('btn-install-pwa-mobile');
  if (btn) { btn.style.display = ''; btn.classList.add('pulse'); }
  if (btnMobile) { btnMobile.style.display = ''; }
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

  detectPhoneMode();
  initEditor();
});

/* ── Phone / Tablet detection ── */
const PHONE_BREAKPOINT = 768;
let isPhone = false;

function detectPhoneMode() {
  isPhone = window.innerWidth < PHONE_BREAKPOINT;
  document.body.classList.toggle('is-phone', isPhone);
  document.body.classList.toggle('is-desktop', !isPhone);
  if (isPhone) {
    document.body.classList.add('phone-view-blocks');
    document.body.classList.remove('phone-view-code', 'phone-view-turtle');
  } else {
    document.body.classList.remove('phone-view-blocks', 'phone-view-code', 'phone-view-turtle');
  }
}

window.addEventListener('resize', () => {
  const wasPhone = isPhone;
  detectPhoneMode();
  if (wasPhone !== isPhone) {
    // Refresh Blockly size when switching modes
    if (window._blocklyWorkspace) {
      setTimeout(() => {
        if (window.Blockly) window.Blockly.svgResize(window._blocklyWorkspace);
      }, 200);
    }
  }
});

function initEditor() {
  initPyodideWorker();
  turtleAPI.reset();
  initWorkspace();

  // --- wire up all the UI buttons ---
  setupTabSwitcher();
  setupPWAInstall();
  setupDownloadDropdown();
  setupMobileNav();
  setupMobileMenu();
  setupMobileBackButton();
  setupMobileExampleSync();

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
  const btnMobile = document.getElementById('btn-install-pwa-mobile');
  if (!btn) return;
  if (window.matchMedia('(display-mode: standalone)').matches) {
    if (btn) btn.style.display = 'none';
    if (btnMobile) btnMobile.style.display = 'none';
  }
  btn.addEventListener('click', async () => {
    if (!deferredPrompt) {
      alert('📲 Click the install icon in your browser address bar, or use "Add to Home Screen" in your browser menu.');
      return;
    }
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    btn.style.display = 'none';
    if (btnMobile) btnMobile.style.display = 'none';
    btn.classList.remove('pulse');
  });
  if (btnMobile) {
    btnMobile.addEventListener('click', () => btn.click());
    if (deferredPrompt) btnMobile.style.display = '';
  }
}

/* ═══════════════════════════════════════════════
   📱 Mobile mode helpers
   ═══════════════════════════════════════════════ */

function setupMobileNav() {
  const navBlocks = document.getElementById('mobile-nav-blocks');
  const navCode   = document.getElementById('mobile-nav-code');
  const navTurtle = document.getElementById('mobile-nav-turtle');
  const navRun    = document.getElementById('mobile-nav-run');

  if (!navBlocks || !navCode || !navTurtle || !navRun) return;

  /** switch to a view on phone */
  function switchView(view) {
    if (!isPhone) return;
    document.body.classList.remove('phone-view-blocks', 'phone-view-code', 'phone-view-turtle');
    document.body.classList.add(`phone-view-${view}`);

    [navBlocks, navCode, navTurtle].forEach(b => b?.classList.remove('active'));
    if (view === 'blocks') navBlocks.classList.add('active');
    else if (view === 'code') navCode.classList.add('active');
    else if (view === 'turtle') navTurtle.classList.add('active');

    // Refresh Blockly if switching back to blocks view
    if (view === 'blocks' && window._blocklyWorkspace) {
      setTimeout(() => {
        if (window.Blockly) window.Blockly.svgResize(window._blocklyWorkspace);
      }, 150);
    }

    // When switching to turtle view, auto-select turtle tab and resize canvas
    if (view === 'turtle') {
      const tabTurtle = document.getElementById('tab-turtle');
      const tabConsole = document.getElementById('tab-console');
      const cc = document.getElementById('console-container');
      const cav = document.getElementById('canvas-container');
      if (tabTurtle) { tabTurtle.classList.add('active'); tabConsole?.classList.remove('active'); }
      if (cc) cc.style.display = 'none';
      if (cav) cav.style.display = 'flex';
      const canvas = document.getElementById('turtle-canvas');
      if (canvas && window.turtleAPI) {
        setTimeout(() => {
          const tw = Math.floor(canvas.parentElement.clientWidth * 0.9);
          const th = Math.floor(canvas.parentElement.clientHeight * 0.9);
          if (tw > 0 && th > 0 && (canvas.width !== tw || canvas.height !== th)) {
            canvas.width = tw;
            canvas.height = th;
            window.turtleAPI.reset();
          }
        }, 200);
      }
    }
  }

  navBlocks.addEventListener('click', () => switchView('blocks'));
  navCode.addEventListener('click',   () => switchView('code'));
  navTurtle.addEventListener('click', () => switchView('turtle'));

  // Run button in bottom nav
  navRun.addEventListener('click', () => {
    document.getElementById('btn-run')?.click();
  });
}

function setupMobileMenu() {
  const menuBtn = document.getElementById('btn-mobile-menu');
  const menu    = document.getElementById('mobile-toolbar-dropdown');
  if (!menuBtn || !menu) return;

  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.classList.toggle('open');
  });

  // close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && e.target !== menuBtn) {
      menu.classList.remove('open');
    }
  });

  // wire up mobile menu buttons
  document.getElementById('btn-download-mobile')?.addEventListener('click', () => {
    import('./core/workspace.js').then(m => m.exportPython('script.py'));
    menu.classList.remove('open');
  });
  document.getElementById('btn-load-mobile')?.addEventListener('click', () => {
    document.getElementById('file-input')?.click();
    menu.classList.remove('open');
  });
  document.getElementById('btn-clear-blocks-mobile')?.addEventListener('click', () => {
    import('./core/workspace.js').then(m => m.clearWorkspace());
    menu.classList.remove('open');
  });
}

function setupMobileBackButton() {
  // Insert a back button at the top of the right panel (only visible on phone)
  const rightPanel = document.getElementById('right-panel');
  if (!rightPanel) return;

  const backBtn = document.createElement('button');
  backBtn.id = 'mobile-back-btn';
  backBtn.innerHTML = '← Back to Blocks';
  backBtn.addEventListener('click', () => {
    document.body.classList.remove('phone-view-code', 'phone-view-turtle');
    document.body.classList.add('phone-view-blocks');
    // update nav active state
    document.querySelectorAll('.mobile-nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('mobile-nav-blocks')?.classList.add('active');
    // Refresh Blockly
    if (window._blocklyWorkspace) {
      setTimeout(() => {
        if (window.Blockly) window.Blockly.svgResize(window._blocklyWorkspace);
      }, 150);
    }
  });
  rightPanel.insertBefore(backBtn, rightPanel.firstChild);
}

function setupMobileExampleSync() {
  const desktopSel = document.getElementById('example-select');
  const mobileSel  = document.getElementById('example-select-mobile');
  if (!desktopSel || !mobileSel) return;

  // Keep both selects in sync
  mobileSel.addEventListener('change', (e) => {
    if (!e.target.value) return;
    desktopSel.value = e.target.value;
    desktopSel.dispatchEvent(new Event('change'));
    mobileSel.value = '';
    // close menu
    document.getElementById('mobile-toolbar-dropdown')?.classList.remove('open');
  });

  desktopSel.addEventListener('change', () => {
    mobileSel.value = desktopSel.value;
  });
}
