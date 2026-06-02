import { initWorkspace, exportPython, saveBlocks, loadBlocks, clearWorkspace, loadExample, runCurrentWorkspace } from './core/workspace.js';
import { initPyodideWorker, setConsoleOutput, setRunButton } from './pyodide/runner.js';
import { turtleAPI } from './turtle/turtleGraphics.js';

// Setup DOM dependencies for Pyodide worker and start it
window.addEventListener('DOMContentLoaded', () => {
  const consoleOutput = document.getElementById('console-output');
  const runBtn = document.getElementById('btn-run');
  
  if (consoleOutput) setConsoleOutput(consoleOutput);
  if (runBtn) setRunButton(runBtn);
  
  // Attach turtleAPI to window to match expectations if any code tries to access it
  window.turtleAPI = turtleAPI;
  
  // Start python environment
  initPyodideWorker();
  turtleAPI.reset();
  
  // Initialize Blockly Workspace
  initWorkspace();
  
  // Attach Event Listeners
  setupEventListeners();
});

function setupEventListeners() {
  // Tab Switcher
  const tabConsole = document.getElementById('tab-console');
  const tabTurtle = document.getElementById('tab-turtle');
  const consoleContainer = document.getElementById('console-container');
  const canvasContainer = document.getElementById('canvas-container');

  if (tabConsole && tabTurtle) {
    tabConsole.addEventListener('click', () => {
      tabConsole.classList.add('active');
      tabTurtle.classList.remove('active');
      if(consoleContainer) consoleContainer.style.display = 'flex';
      if(canvasContainer) canvasContainer.style.display = 'none';
    });

    tabTurtle.addEventListener('click', () => {
      tabTurtle.classList.add('active');
      tabConsole.classList.remove('active');
      if(canvasContainer) canvasContainer.style.display = 'flex';
      if(consoleContainer) consoleContainer.style.display = 'none';
      
      const canvas = document.getElementById('turtle-canvas');
      if (canvas && window.turtleAPI) {
        if (canvas.width !== canvas.parentElement.clientWidth) {
          canvas.width = canvas.parentElement.clientWidth * 0.9;
          canvas.height = canvas.parentElement.clientHeight * 0.9;
          window.turtleAPI.reset();
        }
      }
    });
  }

  // File loading
  const fileInput = document.getElementById('file-input');
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(event) {
        loadBlocks(event.target.result);
      };
      reader.readAsText(file);
      fileInput.value = ''; // Reset input
    });
  }

  // UI action buttons
  document.getElementById('btn-run')?.addEventListener('click', () => {
    runCurrentWorkspace();
  });

  document.getElementById('btn-clear-console')?.addEventListener('click', () => {
    const consoleOutput = document.getElementById('console-output');
    if(consoleOutput) consoleOutput.textContent = '';
  });

  document.getElementById('btn-clear-blocks')?.addEventListener('click', () => {
    clearWorkspace();
  });

  document.getElementById('btn-stop')?.addEventListener('click', () => {
    const consoleOutput = document.getElementById('console-output');
    if(consoleOutput) consoleOutput.textContent += '\n[ 🛑 Execution force-stopped by user ]\n';
    initPyodideWorker();
  });

  document.getElementById('btn-export-py')?.addEventListener('click', () => {
    exportPython();
  });

  document.getElementById('btn-save-blocks')?.addEventListener('click', () => {
    saveBlocks();
  });

  document.getElementById('btn-load-blocks')?.addEventListener('click', () => {
    if (fileInput) fileInput.click();
  });

  // Example select
  const exampleSelect = document.getElementById('example-select');
  if (exampleSelect) {
    exampleSelect.addEventListener('change', (e) => {
      const val = e.target.value;
      if (!val) return;
      loadExample(val);
      e.target.value = ""; // Reset selector
    });
  }
}
