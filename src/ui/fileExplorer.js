/**
 * File Explorer — VSCode-style sidebar for multi-file project management.
 *
 * Download logic:
 *   Header ⬇ → entire project: .json or .zip
 *   File ⬇   → single file: .json (blocks) or .py (code), no compression
 *   Folder ⬇ → compressed .zip of folder contents
 *   Import    → .json only (Blockly workspace format)
 */

import {
  getProject, createFile, createFolder, deleteFile, deleteFolder,
  renameEntry, readFile, exportFileBlob, exportProjectJson,
  getAllFiles, importFiles, duplicateFile, setFolderExpanded, flattenTree
} from '../core/filesystem.js';

let container = null;
let projectId = null;
let onFileOpen = null;
let onTreeChange = null;
let activeFilePath = null;

export function initFileExplorer(el, projId, onOpen, onChange) {
  container = el;
  projectId = projId;
  onFileOpen = onOpen;
  onTreeChange = onChange;
}

export function setActiveFile(path) {
  activeFilePath = path;
  highlightActiveFile();
}

export async function refresh() {
  await renderTree();
  if (onTreeChange) onTreeChange();
}

// ==================== Render ====================

async function renderTree() {
  if (!container || !projectId) return;

  const project = await getProject(projectId).catch(() => null);
  if (!project) {
    container.innerHTML = `<div class="file-explorer-error">Project not found</div>`;
    return;
  }

  const flat = flattenTree(project.tree);
  const treeHtml = buildTreeHtml(flat);

  container.innerHTML = `
    <div class="file-explorer">
      <div class="file-explorer-header">
        <span class="file-explorer-title" title="${esc(project.name)}">${esc(project.name)}</span>
        <div class="file-explorer-header-actions">
          <div class="fe-dropdown" id="fe-project-dl">
            <button class="fe-btn fe-btn-icon" id="fe-project-dl-btn" title="Download project">⬇</button>
            <div class="fe-dropdown-menu" id="fe-project-dl-menu">
              <button class="fe-dropdown-item" data-dl="project-json">📋 Export Project .json (blocks)</button>
              <button class="fe-dropdown-item" data-dl="project-zip">📦 Export Project .zip</button>
            </div>
          </div>
        </div>
      </div>
      <div class="file-explorer-tree" id="fe-tree">
        ${treeHtml || '<div class="file-explorer-empty">No files yet. Create one below.</div>'}
      </div>
      <div class="file-explorer-actions">
        <button class="fe-btn" id="fe-new-file">+ File</button>
        <button class="fe-btn" id="fe-new-folder">📁 Folder</button>
        <button class="fe-btn" id="fe-import">⬆ Import</button>
      </div>
    </div>
  `;

  attachListeners();
  highlightActiveFile();
}

function buildTreeHtml(flat) {
  if (!flat || flat.length === 0) return '';

  const visible = [];
  const folderStack = [];
  for (const item of flat) {
    let hidden = false;
    for (const f of folderStack) {
      if (item.path.startsWith(f.path) && !f.expanded) { hidden = true; break; }
    }
    if (item.type === 'folder') folderStack.push(item);
    if (!hidden) visible.push(item);
    while (folderStack.length && !item.path.startsWith(folderStack[folderStack.length - 1].path)) {
      folderStack.pop();
    }
  }

  return visible.map(item => {
    const indent = item.depth * 16;
    const isFolder = item.type === 'folder';
    const isExpanded = item.expanded !== false;
    const icon = isFolder ? (isExpanded ? '📂' : '📁') : getFileIcon(item.name);

    return `
      <div class="fe-tree-item ${isFolder ? 'fe-folder' : 'fe-file'}"
           data-path="${esc(item.path)}" data-type="${item.type}" data-depth="${item.depth}"
           style="padding-left: ${indent + 8}px">
        <span class="fe-chevron ${isFolder ? (isExpanded ? 'fe-chevron-open' : '') : 'fe-chevron-hidden'}">▶</span>
        <span class="fe-icon">${icon}</span>
        <span class="fe-name">${esc(isFolder ? item.name : item.name)}</span>
        <span class="fe-actions">
          <button class="fe-action-btn" data-action="download" title="Download">⬇</button>
          <button class="fe-action-btn" data-action="duplicate" title="Duplicate">⧉</button>
          <button class="fe-action-btn" data-action="rename" title="Rename">✎</button>
          <button class="fe-action-btn fe-action-delete" data-action="delete" title="Delete">✕</button>
        </span>
      </div>
    `;
  }).join('');
}

// ==================== Listeners ====================

function attachListeners() {
  if (!container) return;

  // Folder toggle
  container.querySelectorAll('.fe-folder').forEach(el => {
    el.addEventListener('click', async (e) => {
      if (e.target.closest('.fe-action-btn')) return;
      const path = el.dataset.path;
      const p = await getProject(projectId);
      if (!p) return;
      const node = findNode(p.tree, path);
      if (node && node.type === 'folder') {
        await setFolderExpanded(projectId, path, node._expanded === false);
        await renderTree();
      }
    });
  });

  // File click → open
  container.querySelectorAll('.fe-file').forEach(el => {
    el.addEventListener('click', async (e) => {
      if (e.target.closest('.fe-action-btn')) return;
      try {
        const content = await readFile(projectId, el.dataset.path);
        if (onFileOpen) onFileOpen(el.dataset.path, content);
        setActiveFile(el.dataset.path);
      } catch (err) { alert('Error opening file: ' + err.message); }
    });
  });

  // Action buttons (download / duplicate / rename / delete)
  container.querySelectorAll('.fe-action-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const itemEl = btn.closest('.fe-tree-item');
      await handleAction(btn.dataset.action, itemEl.dataset.path, itemEl.dataset.type, btn);
    });
  });

  // Bottom bar
  document.getElementById('fe-new-file')?.addEventListener('click', () => handleNewFile());
  document.getElementById('fe-new-folder')?.addEventListener('click', () => handleNewFolder());
  document.getElementById('fe-import')?.addEventListener('click', () => handleImport());

  // Header project download dropdown
  setupDropdown('fe-project-dl-btn', 'fe-project-dl-menu', async (type) => {
    if (type === 'project-json') {
      const blob = await exportProjectJson(projectId);
      const p = await getProject(projectId);
      triggerDownload(blob, (p.name || 'project') + '.pyblocks-project.json');
    } else if (type === 'project-zip') {
      await downloadProjectZip();
    }
  });
}

function setupDropdown(btnId, menuId, onSelect) {
  const btn = document.getElementById(btnId);
  const menu = document.getElementById(menuId);
  if (!btn || !menu) return;
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    // Close all other dropdowns first
    document.querySelectorAll('.fe-dropdown-menu.fe-dropdown-open').forEach(m => {
      if (m !== menu) m.classList.remove('fe-dropdown-open');
    });
    menu.classList.toggle('fe-dropdown-open');
  });
  menu.querySelectorAll('.fe-dropdown-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      menu.classList.remove('fe-dropdown-open');
      onSelect(item.dataset.dl);
    });
  });
}

// ==================== Actions ====================

async function handleAction(action, path, type, btnElement) {
  try {
    switch (action) {
      case 'download': {
        if (type === 'file') {
          showFileDownloadPopup(btnElement, path, 'file');
        } else if (type === 'folder') {
          showFileDownloadPopup(btnElement, path, 'folder');
        }
        break;
      }
      case 'duplicate': {
        if (type !== 'file') { alert('Only files can be duplicated.'); return; }
        if (!confirm(`Duplicate "${path}"?`)) return;
        await duplicateFile(projectId, path);
        await renderTree();
        break;
      }
      case 'rename': {
        const newName = prompt('Enter new name:', path.split('/').pop());
        if (!newName || newName === path.split('/').pop()) return;
        const parts = path.split('/'); parts.pop();
        const newPath = parts.length ? parts.join('/') + '/' + newName : newName;
        await renameEntry(projectId, path, newPath);
        await renderTree();
        break;
      }
      case 'delete': {
        const label = type === 'folder' ? `folder "${path}" and all its contents` : `"${path}"`;
        if (!confirm(`Delete ${label}? This cannot be undone.`)) return;
        if (type === 'folder') await deleteFolder(projectId, path);
        else await deleteFile(projectId, path);
        if (activeFilePath === path) activeFilePath = null;
        await renderTree();
        break;
      }
    }
  } catch (err) {
    alert('Error: ' + err.message);
  }
}

// ==================== File Download Popup ====================

function showFileDownloadPopup(anchorBtn, itemPath, itemType) {
  // Remove any existing popup
  document.querySelectorAll('.fe-file-dl-popup').forEach(p => p.remove());

  const popup = document.createElement('div');
  popup.className = 'fe-file-dl-popup';

  if (itemType === 'folder') {
    popup.innerHTML = `
      <button data-fmt="folder-json">📋 .json (blocks)</button>
      <button data-fmt="folder-zip">📦 .zip</button>
    `;
    popup.querySelector('[data-fmt="folder-json"]').addEventListener('click', async (e) => {
      e.stopPropagation(); popup.remove();
      await downloadFolderAs(itemPath, 'json');
    });
    popup.querySelector('[data-fmt="folder-zip"]').addEventListener('click', async (e) => {
      e.stopPropagation(); popup.remove();
      await downloadFolderAs(itemPath, 'zip');
    });
  } else {
    popup.innerHTML = `
      <button data-fmt="file-json">📋 .json (blocks)</button>
      <button data-fmt="file-raw">📄 Download file</button>
    `;
    popup.querySelector('[data-fmt="file-json"]').addEventListener('click', async (e) => {
      e.stopPropagation(); popup.remove();
      await downloadFileAs(itemPath, 'json');
    });
    popup.querySelector('[data-fmt="file-raw"]').addEventListener('click', async (e) => {
      e.stopPropagation(); popup.remove();
      await downloadFileAs(itemPath, 'raw');
    });
  }

  // Position near the button
  const rect = anchorBtn.getBoundingClientRect();
  popup.style.position = 'fixed';
  popup.style.left = (rect.right + 4) + 'px';
  popup.style.top = rect.top + 'px';
  popup.style.zIndex = '200';

  document.body.appendChild(popup);

  // Close on outside click
  const closeHandler = (e) => {
    if (!popup.contains(e.target) && e.target !== anchorBtn) {
      popup.remove();
      document.removeEventListener('click', closeHandler);
    }
  };
  setTimeout(() => document.addEventListener('click', closeHandler), 0);
}

async function downloadFileAs(filePath, format) {
  try {
    if (format === 'json') {
      // Export current workspace state as Blockly JSON
      const ws = window._blocklyWorkspace;
      if (!ws) { alert('No workspace available.'); return; }
      const { default: Blockly } = await import('blockly');
      const state = Blockly.serialization.workspaces.save(ws);
      const filename = filePath.split('/').pop().replace(/\.\w+$/, '.json');
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
      triggerDownload(blob, filename);
    } else if (format === 'raw') {
      // Download the raw stored content (works for .py / .json / .txt / any file)
      const content = await readFile(projectId, filePath);
      const filename = filePath.split('/').pop();
      const mime = filename.endsWith('.json') ? 'application/json' : 'text/plain';
      const blob = new Blob([content], { type: mime });
      triggerDownload(blob, filename);
    }
  } catch (err) { alert('Error: ' + err.message); }
}

// ==================== Folder / Project Download ====================

async function downloadFolderAs(folderPath, format) {
  try {
    const allFiles = await getAllFiles(projectId);
    const folderKey = folderPath.endsWith('/') ? folderPath : folderPath + '/';
    const folderFiles = allFiles.filter(f => f.path.startsWith(folderKey));
    const folderName = folderPath.replace(/\/$/, '').split('/').pop() || 'folder';

    if (format === 'json') {
      // Build a project-JSON-style tree for the folder subtree
      const subtree = {};
      for (const { path, content } of folderFiles) {
        const relPath = path.slice(folderKey.length);
        const parts = relPath.split('/');
        let current = subtree;
        for (let i = 0; i < parts.length - 1; i++) {
          const key = parts[i] + '/';
          if (!current[key]) current[key] = { type: 'folder', children: {} };
          current = current[key].children;
        }
        current[parts[parts.length - 1]] = { type: 'file', content };
      }
      const bundle = { format: 'pyblocks-project', version: 1, name: folderName, exportedAt: Date.now(), tree: subtree };
      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
      triggerDownload(blob, folderName + '.pyblocks-project.json');
    } else if (format === 'zip') {
      const JSZip = window.JSZip;
      if (!JSZip) { alert('JSZip not loaded.'); return; }
      const zip = new JSZip();
      for (const { path, content } of folderFiles) {
        zip.file(path.slice(folderKey.length), content);
      }
      const blob = await zip.generateAsync({ type: 'blob' });
      triggerDownload(blob, folderName + '.zip');
    }
  } catch (err) { alert('Error: ' + err.message); }
}

async function downloadProjectZip() {
  try {
    const JSZip = window.JSZip;
    if (!JSZip) { alert('JSZip not loaded.'); return; }

    const allFiles = await getAllFiles(projectId);
    const project = await getProject(projectId);
    const zip = new JSZip();

    for (const { path, content } of allFiles) {
      zip.file(path, content);
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    triggerDownload(blob, (project.name || 'project') + '.zip');
  } catch (err) { alert('Error: ' + err.message); }
}

// ==================== New File / Folder / Import ====================

async function handleNewFile() {
  const name = prompt('File name (e.g. script.py or blocks.json):', 'main.py');
  if (!name) return;
  if (!name.includes('.')) { alert('Please include a file extension (.py, .json, .txt)'); return; }
  try {
    const defaultContent = name.endsWith('.json')
      ? JSON.stringify({ blocks: { languageVersion: 0, blocks: [] } })
      : '# ' + name + '\n';
    await createFile(projectId, name, defaultContent);
    await renderTree();
    const content = await readFile(projectId, name);
    if (onFileOpen) onFileOpen(name, content);
    setActiveFile(name);
  } catch (err) { alert('Error creating file: ' + err.message); }
}

async function handleNewFolder() {
  const name = prompt('Folder name:');
  if (!name) return;
  try {
    await createFolder(projectId, name);
    await renderTree();
  } catch (err) { alert('Error creating folder: ' + err.message); }
}

async function handleImport() {
  const input = document.createElement('input');
  input.type = 'file';
  input.multiple = true;
  input.accept = '.json';  // Only JSON — must be Blockly workspace format
  input.onchange = async () => {
    if (!input.files || input.files.length === 0) return;
    try {
      // Validate all files are .json
      for (const f of input.files) {
        if (!f.name.endsWith('.json')) {
          alert(`"${f.name}" is not a .json file. Import only supports .json (Blockly workspace format).`);
          return;
        }
      }
      await importFiles(projectId, input.files);
      await renderTree();
    } catch (err) { alert('Error importing files: ' + err.message); }
  };
  input.click();
}

// ==================== Helpers ====================

function highlightActiveFile() {
  if (!container) return;
  container.querySelectorAll('.fe-tree-item.fe-file').forEach(el => {
    el.classList.toggle('fe-active', el.dataset.path === activeFilePath);
  });
}

function findNode(tree, path) {
  const parts = path.split('/').filter(Boolean);
  if (parts.length === 0) return tree;
  let current = tree;
  for (const part of parts) {
    if (current[part]) current = current[part];
    else if (current[part + '/']) current = current[part + '/'].children || {};
    else return null;
  }
  return current;
}

function getFileIcon(name) {
  if (name.endsWith('.py')) return '🐍';
  if (name.endsWith('.json')) return '📋';
  return '📄';
}

function esc(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
