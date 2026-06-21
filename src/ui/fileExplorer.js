/**
 * File Explorer — VSCode-style tree view.
 *   Click folder: expand/collapse + select as target for new items
 *   Click file: open in editor
 *   New file/folder: creates inside selected folder (or root if none)
 */

import {
  getProject, createFile, createFolder, deleteFile, deleteFolder,
  renameEntry, readFile, exportProjectJson, getAllFiles,
  importFiles, duplicateFile, setFolderExpanded, flattenTree
} from '../core/filesystem.js';

let container = null;
let projectId = null;
let onFileOpen = null;
let onTreeChange = null;
let activeFilePath = null;
let selectedFolder = ''; // path of selected folder, '' = root

export function initFileExplorer(el, projId, onOpen, onChange) {
  container = el;
  projectId = projId;
  onFileOpen = onOpen;
  onTreeChange = onChange;
  selectedFolder = '';
}

export function setActiveFile(path) {
  activeFilePath = path;
  highlightActiveFile();
}

export async function refresh() {
  await renderTree();
  if (onTreeChange) onTreeChange();
}

async function renderTree() {
  if (!container || !projectId) return;

  const project = await getProject(projectId).catch(() => null);
  if (!project) {
    container.innerHTML = `<div class="file-explorer-error">Project not found</div>`;
    return;
  }

  const flat = flattenTree(project.tree);
  const treeHtml = buildTreeRows(flat);

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
      <div class="fe-path-bar" id="fe-path-bar">📁 ${esc(project.name)}/${selectedFolder ? esc(selectedFolder) : ''}</div>
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

  attachListeners(project.tree);
  highlightActiveFile();
  highlightSelectedFolder();
}

function buildTreeRows(items) {
  const visible = [], stack = [];
  for (const item of items) {
    let hidden = false;
    for (const f of stack) { if (item.path.startsWith(f.path) && !f.expanded) { hidden = true; break; } }
    if (item.type === 'folder') stack.push(item);
    if (!hidden) visible.push(item);
    while (stack.length && !item.path.startsWith(stack[stack.length - 1].path)) stack.pop();
  }
  if (visible.length === 0) return '';
  return visible.map(item => {
    const indent = item.depth * 20;
    const isFolder = item.type === 'folder';
    const expanded = item.expanded !== false;
    const icon = isFolder ? (expanded ? '📂' : '📁') : getFileIcon(item.name);
    return `<div class="fe-tree-item ${isFolder ? 'fe-folder' : 'fe-file'}"
      data-path="${escAttr(item.path)}" data-type="${isFolder ? 'folder' : 'file'}" data-depth="${item.depth}"
      title="${escAttr(item.path)}"
      style="padding-left:${indent + 8}px"><span class="fe-chevron ${isFolder ? (expanded ? 'fe-chevron-open' : '') : 'fe-chevron-hidden'}">▶</span>
      <span class="fe-icon">${icon}</span><span class="fe-name">${esc(item.name)}</span>
      <span class="fe-actions">
        <button class="fe-action-btn" data-action="download" title="Download">⬇</button>
        ${isFolder ? '' : '<button class="fe-action-btn" data-action="duplicate" title="Duplicate">⧉</button>'}
        <button class="fe-action-btn" data-action="rename" title="Rename">✎</button>
        <button class="fe-action-btn fe-action-delete" data-action="delete" title="Delete">✕</button></span></div>`;
  }).join('');
}

function attachListeners(tree) {
  if (!container) return;

  // Folder click → expand/collapse + select as target
  container.querySelectorAll('.fe-folder').forEach(el => {
    el.addEventListener('click', async (e) => {
      if (e.target.closest('.fe-action-btn')) return;
      const path = el.dataset.path;
      // Select this folder for new file/folder creation
      selectedFolder = path;
      highlightSelectedFolder();
      // Toggle expand
      const p = await getProject(projectId);
      if (!p) return;
      const node = findNodeByPath(p.tree, path);
      if (node && node.type === 'folder') {
        await setFolderExpanded(projectId, path, node._expanded === false);
        await renderTree();
      }
    });
  });

  // Click path bar → deselect (create at root)
  document.getElementById('fe-path-bar')?.addEventListener('click', () => {
    selectedFolder = '';
    highlightSelectedFolder();
    renderTree();
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

  // Action buttons
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

  // Project download dropdown
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
    document.querySelectorAll('.fe-dropdown-menu.fe-dropdown-open').forEach(m => {
      if (m !== menu) m.classList.remove('fe-dropdown-open');
    });
    menu.classList.toggle('fe-dropdown-open');
  });
  menu.querySelectorAll('.fe-dropdown-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation(); menu.classList.remove('fe-dropdown-open');
      onSelect(item.dataset.dl);
    });
  });
}

async function handleAction(action, path, type, btnElement) {
  try {
    switch (action) {
      case 'download':
        if (type === 'file') showDownloadPopup(btnElement, path, 'file');
        else showDownloadPopup(btnElement, path, 'folder');
        break;
      case 'duplicate':
        if (type !== 'file') { alert('Only files can be duplicated.'); return; }
        if (!confirm(`Duplicate "${path}"?`)) return;
        await duplicateFile(projectId, path);
        await renderTree();
        break;
      case 'rename': {
        const oldName = path.split('/').pop();
        const newName = prompt('Rename:', oldName);
        if (!newName || newName === oldName) return;
        const parts = path.split('/'); parts.pop();
        const newPath = (parts.length ? parts.join('/') + '/' : '') + newName;
        await renameEntry(projectId, path, newPath);
        if (activeFilePath === path) activeFilePath = newPath;
        await renderTree();
        break;
      }
      case 'delete': {
        const label = type === 'folder' ? `folder "${path}" and contents` : `"${path}"`;
        if (!confirm(`Delete ${label}?`)) return;
        if (type === 'folder') await deleteFolder(projectId, path);
        else await deleteFile(projectId, path);
        if (activeFilePath === path) activeFilePath = null;
        await renderTree();
        break;
      }
    }
  } catch (err) { alert('Error: ' + err.message); }
}

function showDownloadPopup(anchorBtn, itemPath, itemType) {
  document.querySelectorAll('.fe-file-dl-popup').forEach(p => p.remove());
  const popup = document.createElement('div');
  popup.className = 'fe-file-dl-popup';
  if (itemType === 'folder') {
    popup.innerHTML = `<button data-fmt="json">📋 .json (blocks)</button><button data-fmt="zip">📦 .zip</button>`;
    popup.querySelector('[data-fmt="json"]').onclick = async (e) => { e.stopPropagation(); popup.remove(); await downloadFolderAs(itemPath, 'json'); };
    popup.querySelector('[data-fmt="zip"]').onclick = async (e) => { e.stopPropagation(); popup.remove(); await downloadFolderAs(itemPath, 'zip'); };
  } else {
    popup.innerHTML = `<button data-fmt="json">📋 .json (blocks)</button><button data-fmt="raw">📄 Download file</button>`;
    popup.querySelector('[data-fmt="json"]').onclick = async (e) => { e.stopPropagation(); popup.remove(); await downloadFileAs(itemPath, 'json'); };
    popup.querySelector('[data-fmt="raw"]').onclick = async (e) => { e.stopPropagation(); popup.remove(); await downloadFileAs(itemPath, 'raw'); };
  }
  const rect = anchorBtn.getBoundingClientRect();
  popup.style.cssText = `position:fixed;left:${rect.right+4}px;top:${rect.top}px;z-index:200`;
  document.body.appendChild(popup);
  setTimeout(() => {
    const close = (e) => { if (!popup.contains(e.target) && e.target !== anchorBtn) { popup.remove(); document.removeEventListener('click', close); } };
    document.addEventListener('click', close);
  }, 0);
}

async function downloadFileAs(filePath, format) {
  if (format === 'json') {
    const ws = window._blocklyWorkspace;
    if (!ws) { alert('No workspace.'); return; }
    const { default: Blockly } = await import('blockly');
    const state = Blockly.serialization.workspaces.save(ws);
    triggerDownload(new Blob([JSON.stringify(state,null,2)],{type:'application/json'}), filePath.split('/').pop().replace(/\.\w+$/,'.json'));
  } else {
    const content = await readFile(projectId, filePath);
    const fn = filePath.split('/').pop();
    triggerDownload(new Blob([content],{type:fn.endsWith('.json')?'application/json':'text/plain'}), fn);
  }
}

async function downloadFolderAs(folderPath, format) {
  const allFiles = await getAllFiles(projectId);
  const fk = folderPath.endsWith('/') ? folderPath : folderPath + '/';
  const ff = allFiles.filter(f => f.path.startsWith(fk));
  const fn = folderPath.replace(/\/$/,'').split('/').pop() || 'folder';
  if (format === 'json') {
    const subtree = {};
    for (const {path,content} of ff) {
      const rel = path.slice(fk.length), parts = rel.split('/');
      let cur = subtree;
      for (let i = 0; i < parts.length-1; i++) {
        if (!cur[parts[i]+'/']) cur[parts[i]+'/'] = {type:'folder',children:{}};
        cur = cur[parts[i]+'/'].children;
      }
      cur[parts[parts.length-1]] = {type:'file',content};
    }
    triggerDownload(new Blob([JSON.stringify({format:'pyblocks-project',version:1,name:fn,exportedAt:Date.now(),tree:subtree},null,2)],{type:'application/json'}), fn+'.pyblocks-project.json');
  } else {
    const JSZip = window.JSZip; if (!JSZip) { alert('JSZip not loaded.'); return; }
    const zip = new JSZip();
    for (const {path,content} of ff) zip.file(path.slice(fk.length), content);
    triggerDownload(await zip.generateAsync({type:'blob'}), fn+'.zip');
  }
}

async function downloadProjectZip() {
  const JSZip = window.JSZip; if (!JSZip) { alert('JSZip not loaded.'); return; }
  const allFiles = await getAllFiles(projectId);
  const project = await getProject(projectId);
  const zip = new JSZip();
  for (const {path,content} of allFiles) zip.file(path, content);
  triggerDownload(await zip.generateAsync({type:'blob'}), (project.name||'project')+'.zip');
}

async function handleNewFile() {
  const prefix = selectedFolder;
  const hint = prefix ? prefix + 'new_file.py' : 'main.py';
  const name = prompt('Create file in: ' + (prefix || 'root') + '\nName (.py/.json/.txt):', hint);
  if (!name) return;
  if (!name.includes('.')) { alert('Include extension (.py, .json, .txt)'); return; }
  try {
    const fpath = prefix + name;
    const fn = name.split('/').pop();
    const def = fn.endsWith('.json') ? JSON.stringify({blocks:{languageVersion:0,blocks:[]}}) : '# '+fn+'\n';
    await createFile(projectId, fpath, def);
    await renderTree();
    const content = await readFile(projectId, fpath);
    if (onFileOpen) onFileOpen(fpath, content);
    setActiveFile(fpath);
  } catch (err) { alert('Error: ' + err.message); }
}

async function handleNewFolder() {
  const prefix = selectedFolder;
  const name = prompt('Create folder in: ' + (prefix || 'root') + '\nFolder name:', '');
  if (!name) return;
  try {
    await createFolder(projectId, prefix + name + '/');
    await renderTree();
  } catch (err) { alert('Error: ' + err.message); }
}

async function handleImport() {
  const input = document.createElement('input');
  input.type = 'file'; input.multiple = true; input.accept = '.json';
  input.onchange = async () => {
    if (!input.files || input.files.length === 0) return;
    for (const f of input.files) { if (!f.name.endsWith('.json')) { alert('Only .json supported.'); return; } }
    await importFiles(projectId, input.files);
    await renderTree();
  };
  input.click();
}

function findNodeByPath(tree, path) {
  const parts = path.split('/').filter(Boolean);
  let cur = tree;
  for (const p of parts) {
    if (cur[p + '/']) cur = cur[p + '/'];
    else if (cur[p]) cur = cur[p];
    else return null;
  }
  return cur;
}

function highlightActiveFile() {
  if (!container) return;
  container.querySelectorAll('.fe-tree-item.fe-file').forEach(el =>
    el.classList.toggle('fe-active', el.dataset.path === activeFilePath));
}

function highlightSelectedFolder() {
  if (!container) return;
  container.querySelectorAll('.fe-tree-item.fe-folder').forEach(el =>
    el.classList.toggle('fe-selected', el.dataset.path === selectedFolder));
  // Update path bar
  const bar = document.getElementById('fe-path-bar');
  if (bar) {
    const projectName = container.querySelector('.file-explorer-title')?.textContent || '';
    bar.textContent = '📁 ' + projectName + '/' + (selectedFolder || '');
  }
}

function getFileIcon(name) {
  if (name.endsWith('.py')) return '🐍';
  if (name.endsWith('.json')) return '📋';
  return '📄';
}

function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
function escAttr(s) { return s.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
