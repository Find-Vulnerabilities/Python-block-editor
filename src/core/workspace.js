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

// Save mode configuration
let saveMode = 'localStorage'; // 'localStorage' | 'filesystem'
let saveProjectId = null;
let saveCallback = null; // (path, content) => void

// Strip await for display/export (standard Python doesn't support top-level await)
function stripAwait(code) {
  return code.replace(/^(\s*)await /gm, '$1');
}

/** Set the save mode for auto-save behavior. */
export function setSaveMode(mode, projectId, callback) {
  saveMode = mode;
  saveProjectId = projectId || null;
  saveCallback = callback || null;
}

/** Get the current workspace state as a JSON object. */
export function getWorkspaceState() {
  if (!workspace) return null;
  return Blockly.serialization.workspaces.save(workspace);
}

/**
 * Load workspace from a JSON state object or JSON string.
 * Returns true if the state was valid Blockly JSON and loaded successfully.
 * Returns false if the content was not valid Blockly JSON (e.g. plain Python text).
 * In both cases, the workspace is cleared first.
 */
export function loadWorkspaceState(state) {
  if (!workspace) return false;

  // Always clear first so we don't leave stale blocks
  workspace.clear();

  // Try to parse as JSON (Blockly workspace format)
  let parsed;
  try {
    parsed = typeof state === 'string' ? JSON.parse(state) : state;
  } catch (e) {
    // Not valid JSON — probably plain Python text
    return false;
  }

  // Check if it looks like a Blockly workspace state
  if (parsed && (parsed.blocks || parsed.blockLanguageVersion !== undefined)) {
    try {
      Blockly.serialization.workspaces.load(parsed, workspace);
      return true;
    } catch (err) {
      console.error('Failed to load Blockly workspace:', err);
      return false;
    }
  }

  return false;
}

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

  // Expose workspace and generator globally for external access
  window._blocklyWorkspace = workspace;
  window._blocklyPython = pythonGenerator;

  // Ensure Blockly resizes correctly when the browser window is resized
  window.addEventListener('resize', () => {
    Blockly.svgResize(workspace);
  }, false);

  // Load from LocalStorage on initialize only in localStorage mode
  if (saveMode === 'localStorage') {
    const savedState = localStorage.getItem('blocklyWorkspace');
    if (savedState) {
      try {
        Blockly.serialization.workspaces.load(JSON.parse(savedState), workspace);
      } catch (err) {}
    }
  }

  // Live update generated Python code — re-query codeDiv each time for robustness
  function updateCode() {
    const codeDiv = document.getElementById('codeDiv');
    if (!codeDiv) return;
    try {
      const code = pythonGenerator.workspaceToCode(workspace);
      codeDiv.textContent = stripAwait(code) || '# Your Python code will appear here...';
      // Syntax highlighting
      delete codeDiv.dataset.highlighted;
      if (window.hljs) hljs.highlightElement(codeDiv);
    } catch (err) {
      console.error('updateCode error:', err);
    }
  }

  workspace.addChangeListener(updateCode);

  workspace.addChangeListener((e) => {
    // Auto-save logic on every block change (ignore UI events like clicking)
    if (e.isUiEvent) return;

    const state = Blockly.serialization.workspaces.save(workspace);
    const stateJson = JSON.stringify(state);

    if (saveMode === 'localStorage') {
      localStorage.setItem('blocklyWorkspace', stateJson);
    } else if (saveMode === 'filesystem' && saveCallback) {
      saveCallback(null, stateJson);
    }
  });

  // Trigger an initial code update so display is not blank
  setTimeout(() => updateCode(), 100);

  return workspace;
}

export function getWorkspace() {
  return workspace;
}

export function exportPython(filename) {
  if (!workspace) return;
  const code = stripAwait(pythonGenerator.workspaceToCode(workspace));
  const blob = new Blob([code], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'script.py';
  a.click();
  URL.revokeObjectURL(url);
}

export function saveBlocks() {
  if (!workspace) return;
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
  if (!workspace) return;
  try {
    const state = JSON.parse(jsonString);
    workspace.clear();
    Blockly.serialization.workspaces.load(state, workspace);
  } catch (err) {
    alert('Failed to load blocks. Please ensure the file is a valid JSON workspace.');
  }
}

export function clearWorkspace() {
  if (!workspace) return;
  if (confirm('Are you sure you want to clear all blocks? This cannot be undone.')) {
    workspace.clear();
  }
}

export function loadExample(name) {
  if (!workspace || !examples[name]) return;
  if (confirm('Load this example? This will replace your current workspace blocks.')) {
    workspace.clear();
    Blockly.serialization.workspaces.load(examples[name], workspace);
  }
}

export function runCurrentWorkspace() {
  if (!workspace) return;
  const code = pythonGenerator.workspaceToCode(workspace);
  runPythonCode(code);
}

export { pythonGenerator };
