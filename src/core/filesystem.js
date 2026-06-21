/**
 * Virtual Filesystem — IndexedDB-backed project & file management
 *
 * Database: "pyblocks-fs"
 * Object store: "projects" (keyPath: "id")
 *
 * Each project record:
 *   { id, name, createdAt, updatedAt, tree: { ... } }
 *
 * tree is a nested object:
 *   { "main.py": { type: "file", content: "<blockly JSON string>" },
 *     "utils": { type: "folder", children: { "helper.py": { ... } } } }
 */

const DB_NAME = 'pyblocks-fs';
const DB_VERSION = 1;
const STORE_NAME = 'projects';

// --------------- IndexedDB helpers ---------------

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('name', 'name', { unique: false });
        store.createIndex('updatedAt', 'updatedAt', { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function dbTx(db, mode) {
  const tx = db.transaction(STORE_NAME, mode);
  return tx.objectStore(STORE_NAME);
}

function promisify(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// --------------- Tree helpers ---------------

/** Walk into a nested tree given a "/"‑delimited path. Returns {parent, key, node}. */
function walkTree(tree, path) {
  const parts = path.split('/').filter(Boolean);
  if (parts.length === 0) return { parent: null, key: null, node: tree };
  let parent = tree;
  for (let i = 0; i < parts.length - 1; i++) {
    const folder = parent[parts[i] + '/'];
    if (!folder || folder.type !== 'folder') {
      throw new Error(`Path not found: ${parts.slice(0, i + 1).join('/')}/`);
    }
    parent = folder.children;
  }
  const key = parts[parts.length - 1];
  return { parent, key, node: parent[key] || null };
}

/** Insert a node at path (creating intermediate folders if needed). */
function setAtPath(tree, path, node) {
  const parts = path.split('/').filter(Boolean);
  let current = tree;
  for (let i = 0; i < parts.length - 1; i++) {
    const folderKey = parts[i] + '/';
    if (!current[folderKey] || current[folderKey].type !== 'folder') {
      current[folderKey] = { type: 'folder', children: {} };
    }
    current = current[folderKey].children;
  }
  current[parts[parts.length - 1]] = node;
}

/** Delete a node at path, and clean up empty parent folders. */
function deleteAtPath(tree, path) {
  const parts = path.split('/').filter(Boolean);
  if (parts.length === 0) return;
  const stack = [{ parent: null, key: null, node: tree }];
  let current = tree;
  for (let i = 0; i < parts.length - 1; i++) {
    const folderKey = parts[i] + '/';
    const folder = current[folderKey];
    if (!folder || folder.type !== 'folder') return;
    stack.push({ parent: current, key: folderKey, node: folder.children });
    current = folder.children;
  }
  const key = parts[parts.length - 1];
  delete current[key];
  // Cleanup: remove empty parent folders (bottom-up, skip root)
  for (let i = stack.length - 1; i > 0; i--) {
    const { parent, key } = stack[i];
    if (parent && key && Object.keys(parent[key].children || {}).length === 0) {
      delete parent[key];
    } else {
      break;
    }
  }
}

/** Recursively collect all file paths in a tree. */
function collectFiles(tree, prefix = '') {
  const result = [];
  for (const [name, node] of Object.entries(tree)) {
    if (node.type === 'file') {
      result.push({ path: prefix + name, content: node.content });
    } else if (node.type === 'folder') {
      result.push(...collectFiles(node.children, prefix + name));
    }
  }
  return result;
}

/** Clone a tree deeply. */
function cloneTree(tree) {
  const clone = {};
  for (const [name, node] of Object.entries(tree)) {
    if (node.type === 'folder') {
      clone[name] = { type: 'folder', children: cloneTree(node.children) };
    } else {
      clone[name] = { type: 'file', content: node.content };
    }
  }
  return clone;
}

/** Build a flat list of tree entries with depth for UI rendering. */
export function flattenTree(tree, prefix = '', depth = 0) {
  const result = [];
  // Sort: folders first, then files; alphabetical within each group
  const entries = Object.entries(tree).sort((a, b) => {
    const aIsFolder = a[1].type === 'folder';
    const bIsFolder = b[1].type === 'folder';
    if (aIsFolder && !bIsFolder) return -1;
    if (!aIsFolder && bIsFolder) return 1;
    return a[0].localeCompare(b[0]);
  });
  for (const [name, node] of entries) {
    if (node.type === 'folder') {
      const folderPath = prefix + name; // "utils/"
      result.push({
        path: folderPath,
        name: name.replace(/\/$/, ''),
        type: 'folder',
        depth,
        expanded: node._expanded !== false,
      });
      result.push(...flattenTree(node.children, folderPath, depth + 1));
    } else {
      result.push({
        path: prefix + name,
        name,
        type: 'file',
        depth,
      });
    }
  }
  return result;
}

// --------------- Public API ---------------

/** Generate a unique project ID. */
function uid() {
  return 'proj_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
}

/** Create a new project. */
export async function createProject(name) {
  const db = await openDB();
  const now = Date.now();
  const project = {
    id: uid(),
    name,
    createdAt: now,
    updatedAt: now,
    tree: {},
  };
  await promisify(dbTx(db, 'readwrite').add(project));
  return project;
}

/** Get a single project by ID. */
export async function getProject(id) {
  const db = await openDB();
  return promisify(dbTx(db, 'readonly').get(id));
}

/** List all projects (latest first). */
export async function listProjects() {
  const db = await openDB();
  const all = await promisify(dbTx(db, 'readonly').getAll());
  all.sort((a, b) => b.updatedAt - a.updatedAt);
  return all;
}

/** Delete a project and all its files. */
export async function deleteProject(id) {
  const db = await openDB();
  await promisify(dbTx(db, 'readwrite').delete(id));
}

/** Rename a project. */
export async function renameProject(id, newName) {
  const db = await openDB();
  const project = await promisify(dbTx(db, 'readonly').get(id));
  if (!project) throw new Error('Project not found');
  project.name = newName;
  project.updatedAt = Date.now();
  await promisify(dbTx(db, 'readwrite').put(project));
  return project;
}

/** Create a file at path with optional Blob/string content. */
export async function createFile(projectId, fpath, content = '') {
  const db = await openDB();
  const project = await promisify(dbTx(db, 'readonly').get(projectId));
  if (!project) throw new Error('Project not found');
  if (!fpath.endsWith('.py') && !fpath.endsWith('.json') && !fpath.endsWith('.txt')) {
    throw new Error('File must have .py, .json, or .txt extension');
  }
  setAtPath(project.tree, fpath, { type: 'file', content });
  project.updatedAt = Date.now();
  await promisify(dbTx(db, 'readwrite').put(project));
  return project;
}

/** Create a folder at path (path should end with / or just be the folder name). */
export async function createFolder(projectId, fpath) {
  const db = await openDB();
  const project = await promisify(dbTx(db, 'readonly').get(projectId));
  if (!project) throw new Error('Project not found');
  const folderKey = fpath.endsWith('/') ? fpath : fpath + '/';
  setAtPath(project.tree, folderKey, { type: 'folder', children: {} });
  project.updatedAt = Date.now();
  await promisify(dbTx(db, 'readwrite').put(project));
  return project;
}

/** Read file content. */
export async function readFile(projectId, fpath) {
  const db = await openDB();
  const project = await promisify(dbTx(db, 'readonly').get(projectId));
  if (!project) throw new Error('Project not found');
  const { node } = walkTree(project.tree, fpath);
  if (!node || node.type !== 'file') throw new Error(`File not found: ${fpath}`);
  return node.content;
}

/** Write file content. */
export async function writeFile(projectId, fpath, content) {
  const db = await openDB();
  const project = await promisify(dbTx(db, 'readonly').get(projectId));
  if (!project) throw new Error('Project not found');
  const { node } = walkTree(project.tree, fpath);
  if (!node || node.type !== 'file') throw new Error(`File not found: ${fpath}`);
  node.content = content;
  project.updatedAt = Date.now();
  await promisify(dbTx(db, 'readwrite').put(project));
}

/** Delete a file. */
export async function deleteFile(projectId, fpath) {
  const db = await openDB();
  const project = await promisify(dbTx(db, 'readonly').get(projectId));
  if (!project) throw new Error('Project not found');
  deleteAtPath(project.tree, fpath);
  project.updatedAt = Date.now();
  await promisify(dbTx(db, 'readwrite').put(project));
  return project;
}

/** Delete a folder and all its contents. */
export async function deleteFolder(projectId, fpath) {
  const db = await openDB();
  const project = await promisify(dbTx(db, 'readonly').get(projectId));
  if (!project) throw new Error('Project not found');
  const folderKey = fpath.endsWith('/') ? fpath : fpath + '/';
  deleteAtPath(project.tree, folderKey);
  project.updatedAt = Date.now();
  await promisify(dbTx(db, 'readwrite').put(project));
  return project;
}

/** Rename a file or folder. Returns updated project. */
export async function renameEntry(projectId, oldPath, newPath) {
  const db = await openDB();
  const project = await promisify(dbTx(db, 'readonly').get(projectId));
  if (!project) throw new Error('Project not found');
  const { node } = walkTree(project.tree, oldPath);
  if (!node) throw new Error(`Not found: ${oldPath}`);
  const cloned = node.type === 'folder'
    ? { type: 'folder', children: cloneTree(node.children) }
    : { type: 'file', content: node.content };
  deleteAtPath(project.tree, oldPath);
  setAtPath(project.tree, newPath, cloned);
  project.updatedAt = Date.now();
  await promisify(dbTx(db, 'readwrite').put(project));
  return project;
}

/** Get the full tree of a project. */
export async function getTree(projectId) {
  const db = await openDB();
  const project = await promisify(dbTx(db, 'readonly').get(projectId));
  if (!project) throw new Error('Project not found');
  return project.tree;
}

/** Set folder expanded state (stored in tree node metadata). */
export async function setFolderExpanded(projectId, folderPath, expanded) {
  const db = await openDB();
  const project = await promisify(dbTx(db, 'readonly').get(projectId));
  if (!project) throw new Error('Project not found');
  const folderKey = folderPath.endsWith('/') ? folderPath : folderPath + '/';
  const { node } = walkTree(project.tree, folderKey);
  if (node && node.type === 'folder') {
    node._expanded = expanded;
    project.updatedAt = Date.now();
    await promisify(dbTx(db, 'readwrite').put(project));
  }
  return project;
}

/** Recursively get all files with their content. */
export async function getAllFiles(projectId) {
  const db = await openDB();
  const project = await promisify(dbTx(db, 'readonly').get(projectId));
  if (!project) throw new Error('Project not found');
  return collectFiles(project.tree);
}

// --------------- Import / Export ---------------

/** Export a single file as a Blob. */
export function exportFileBlob(content, filename) {
  if (filename.endsWith('.py')) {
    return new Blob([content], { type: 'text/x-python' });
  }
  return new Blob([content], { type: 'application/json' });
}

/** Export the whole project as a single JSON Blob (all files bundled). */
export async function exportProjectJson(projectId) {
  const db = await openDB();
  const project = await promisify(dbTx(db, 'readonly').get(projectId));
  if (!project) throw new Error('Project not found');

  const bundle = {
    format: 'pyblocks-project',
    version: 1,
    name: project.name,
    exportedAt: Date.now(),
    tree: project.tree,
  };
  const json = JSON.stringify(bundle, null, 2);
  return new Blob([json], { type: 'application/json' });
}

/** Import a project from a JSON string. Creates a new project. */
export async function importProjectFromJson(jsonString, projectName) {
  let bundle;
  try {
    bundle = JSON.parse(jsonString);
  } catch (e) {
    throw new Error('Invalid JSON file.');
  }

  // Support both our .pyblocks-project format and plain tree format
  let tree, name;
  if (bundle.format === 'pyblocks-project' && bundle.tree) {
    tree = bundle.tree;
    name = projectName || bundle.name || 'Imported Project';
  } else if (typeof bundle === 'object' && bundle !== null) {
    // Try to detect if it's a tree (contains file/folder nodes)
    const hasTreeNodes = Object.values(bundle).some(
      v => v && (v.type === 'file' || v.type === 'folder')
    );
    if (hasTreeNodes) {
      tree = bundle;
      name = projectName || 'Imported Project';
    } else {
      throw new Error('Unrecognized project format. Expected a .pyblocks-project file.');
    }
  } else {
    throw new Error('Unrecognized project format.');
  }

  const db = await openDB();
  const now = Date.now();
  const project = {
    id: 'proj_' + now.toString(36) + '_' + Math.random().toString(36).slice(2, 8),
    name,
    createdAt: now,
    updatedAt: now,
    tree,
  };
  await promisify(dbTx(db, 'readwrite').add(project));
  return project;
}

/** Export the whole project as a ZIP Blob (requires JSZip on window). */
export async function exportProjectZip(projectId) {
  const JSZip = window.JSZip;
  if (!JSZip) throw new Error('JSZip not loaded');

  const files = await getAllFiles(projectId);
  const zip = new JSZip();
  for (const { path, content } of files) {
    zip.file(path, content);
  }
  return zip.generateAsync({ type: 'blob' });
}

/** Import files from File objects into a project. */
export async function importFiles(projectId, fileList) {
  const db = await openDB();
  const project = await promisify(dbTx(db, 'readonly').get(projectId));
  if (!project) throw new Error('Project not found');

  const readFileAsText = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });

  for (const file of fileList) {
    // Support folder upload via webkitRelativePath
    const fpath = file.webkitRelativePath || file.name;
    const content = await readFileAsText(file);
    setAtPath(project.tree, fpath, { type: 'file', content });
  }

  project.updatedAt = Date.now();
  await promisify(dbTx(db, 'readwrite').put(project));
  return project;
}

/** Duplicate a file within the same project. */
export async function duplicateFile(projectId, fpath) {
  const db = await openDB();
  const project = await promisify(dbTx(db, 'readonly').get(projectId));
  if (!project) throw new Error('Project not found');
  const { node } = walkTree(project.tree, fpath);
  if (!node || node.type !== 'file') throw new Error(`File not found: ${fpath}`);

  // Generate unique name: "script.py" → "script (copy).py"
  const parts = fpath.split('/');
  const filename = parts.pop();
  const dir = parts.length ? parts.join('/') + '/' : '';
  const dotIdx = filename.lastIndexOf('.');
  const base = dotIdx > 0 ? filename.slice(0, dotIdx) : filename;
  const ext = dotIdx > 0 ? filename.slice(dotIdx) : '';
  const newPath = dir + base + ' (copy)' + ext;

  setAtPath(project.tree, newPath, { type: 'file', content: node.content });
  project.updatedAt = Date.now();
  await promisify(dbTx(db, 'readwrite').put(project));
  return project;
}
