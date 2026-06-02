import * as Blockly from 'blockly';
import 'blockly/blocks';
import * as En from 'blockly/msg/en';
import { pythonGenerator } from 'blockly/python';
import { toolbox } from '../config/toolbox.js';
import { defineCustomBlocks } from '../blocks/customBlocks.js';
import { definePythonGenerators } from '../generators/pythonGenerators.js';
import { runPythonCode } from '../pyodide/runner.js';
import { examples } from '../config/examples.js';

let workspace = null;

export function initWorkspace() {
  // Set language to English
  Blockly.setLocale(En);

  // Define our custom blocks & generators
  defineCustomBlocks();
  definePythonGenerators();

  // Inject Blockly Workspace
  workspace = Blockly.inject('blocklyDiv', {
    toolbox: toolbox,
    grid: { spacing: 20, length: 3, colour: '#ccc', snap: true }
  });

  // Ensure Blockly resizes correctly when the browser window is resized
  window.addEventListener('resize', () => {
    Blockly.svgResize(workspace);
  }, false);

  // Load from LocalStorage on initialize if available
  const savedState = localStorage.getItem('blocklyWorkspace');
  if (savedState) {
    try {
      Blockly.serialization.workspaces.load(JSON.parse(savedState), workspace);
    } catch (err) {}
  }

  const codeDiv = document.getElementById('codeDiv');

  // Live update generated Python code
  function updateCode() {
    const code = pythonGenerator.workspaceToCode(workspace);
    if(codeDiv) {
      codeDiv.textContent = code || '# Your Python code will appear here...';
      
      // Syntax Highlighting
      delete codeDiv.dataset.highlighted;
      if (window.hljs) hljs.highlightElement(codeDiv);
    }
  }

  workspace.addChangeListener(updateCode);
  workspace.addChangeListener((e) => {
    // Auto-save logic on every block change (ignore UI events like clicking)
    if (!e.isUiEvent) {
      const state = Blockly.serialization.workspaces.save(workspace);
      localStorage.setItem('blocklyWorkspace', JSON.stringify(state));
    }
  });

  return workspace;
}

export function exportPython() {
  if(!workspace) return;
  const code = pythonGenerator.workspaceToCode(workspace);
  const blob = new Blob([code], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'script.py';
  a.click();
  URL.revokeObjectURL(url);
}

export function saveBlocks() {
  if(!workspace) return;
  const state = Blockly.serialization.workspaces.save(workspace);
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'workspace.json';
  a.click();
  URL.revokeObjectURL(url);
}

export function loadBlocks(jsonString) {
  if(!workspace) return;
  try {
    const state = JSON.parse(jsonString);
    Blockly.serialization.workspaces.load(state, workspace);
  } catch (err) {
    alert("Failed to load blocks. Please ensure the file is a valid JSON workspace.");
  }
}

export function clearWorkspace() {
  if(!workspace) return;
  if (confirm('Are you sure you want to clear all blocks? This cannot be undone.')) {
    workspace.clear();
  }
}

export function loadExample(name) {
  if(!workspace || !examples[name]) return;
  if (confirm('Load this example? This will replace your current workspace blocks.')) {
    workspace.clear();
    Blockly.serialization.workspaces.load(examples[name], workspace);
  }
}

export function runCurrentWorkspace() {
  if(!workspace) return;
  const code = pythonGenerator.workspaceToCode(workspace);
  runPythonCode(code);
}
