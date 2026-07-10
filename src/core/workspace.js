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

function stripAwait(code) {
  // generated code uses top-level await for turtle/input, but we want
  // the displayed/exported code to be standard Python
  return code.replace(/^(\s*)await /gm, '$1');
}

export function getWorkspaceState() {
  if (!workspace) return null;
  return Blockly.serialization.workspaces.save(workspace);
}

export function loadWorkspaceState(state) {
  if (!workspace) return false;
  workspace.clear();

  let parsed;
  try {
    parsed = typeof state === 'string' ? JSON.parse(state) : state;
  } catch (e) {
    return false;
  }

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
  Blockly.setLocale(En);
  defineCustomBlocks();
  definePythonGenerators();

  workspace = Blockly.inject('blocklyDiv', {
    toolbox: toolbox,
    grid: { spacing: 20, length: 3, colour: '#ccc', snap: true }
  });

  window._blocklyWorkspace = workspace;
  window._blocklyPython = pythonGenerator;

  window.addEventListener('resize', () => {
    Blockly.svgResize(workspace);
  }, false);

  // restore previous session from localStorage
  const savedState = localStorage.getItem('blocklyWorkspace');
  if (savedState) {
    try {
      Blockly.serialization.workspaces.load(JSON.parse(savedState), workspace);
    } catch (err) {}
  }

  function updateCode() {
    const codeDiv = document.getElementById('codeDiv');
    if (!codeDiv) return;
    try {
      const code = pythonGenerator.workspaceToCode(workspace);
      codeDiv.textContent = stripAwait(code) || '# Your Python code will appear here...';
      delete codeDiv.dataset.highlighted;
      if (window.hljs) hljs.highlightElement(codeDiv);
    } catch (err) {
      console.error('updateCode error:', err);
    }
  }

  workspace.addChangeListener(updateCode);

  workspace.addChangeListener((e) => {
    if (e.isUiEvent) return;
    const state = Blockly.serialization.workspaces.save(workspace);
    localStorage.setItem('blocklyWorkspace', JSON.stringify(state));
  });

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
  if (!confirm('Load this file? This will replace your current blocks.')) return;
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

function addAwait(code) {
  // Add await back for execution so async calls work correctly.
  // Negative lookbehind prevents double-await if user already wrote
  // await in a raw_python block.
  return code
    .replace(/(?<!\bawait )\b(input\()/g, 'await $1')
    .replace(/(?<!\bawait )\b(turtle\.)/g, 'await $1')
    .replace(/(?<!\bawait )\b(time\.sleep\()/g, 'await $1');
}

export function runCurrentWorkspace() {
  if (!workspace) return;
  const code = pythonGenerator.workspaceToCode(workspace);
  runPythonCode(addAwait(code));
}

export { pythonGenerator };
