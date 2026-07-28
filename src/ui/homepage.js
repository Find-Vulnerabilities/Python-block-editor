/**
 * Homepage UI — Landing page with two choices:
 *   1. Create Single File
 *   2. Create Multi-file Project
 *
 * Also shows recent projects from IndexedDB.
 */

import { listProjects, deleteProject, importProjectFromJson } from '../core/filesystem.js';

let homepageContainer = null;
let onNavigate = null; // callback: (route) => void

export function initHomepage(container, navigateFn) {
  homepageContainer = container;
  onNavigate = navigateFn;
  render();
}

async function render() {
  if (!homepageContainer) return;

  const projects = await listProjects().catch(() => []);

  homepageContainer.innerHTML = `
    <div class="homepage">
      <div class="homepage-hero">
        <div class="homepage-logo">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <rect width="64" height="64" rx="14" fill="#4CAF50"/>
            <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="28" font-weight="bold" fill="white" font-family="monospace">&lt;/&gt;</text>
          </svg>
        </div>
        <h1 class="homepage-title">Python Block Editor</h1>
        <p class="homepage-subtitle">Learn Python with blocks — like Scratch, but generates real Python code with turtle graphics</p>
      </div>

      <div class="homepage-cards">
        <div class="homepage-card" data-route="single">
          <div class="homepage-card-icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect x="8" y="4" width="32" height="40" rx="3" stroke="#2196F3" stroke-width="2.5" fill="#E3F2FD"/>
              <line x1="16" y1="14" x2="32" y2="14" stroke="#2196F3" stroke-width="2" stroke-linecap="round"/>
              <line x1="16" y1="20" x2="28" y2="20" stroke="#90CAF9" stroke-width="2" stroke-linecap="round"/>
              <line x1="16" y1="26" x2="30" y2="26" stroke="#90CAF9" stroke-width="2" stroke-linecap="round"/>
              <line x1="16" y1="32" x2="24" y2="32" stroke="#90CAF9" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <h2 class="homepage-card-title">Create Single File</h2>
          <p class="homepage-card-desc">Quick start with a single Python file. Perfect for simple scripts, learning the basics, and experimenting with blocks.</p>
          <button class="homepage-card-btn" data-route="single">Get Started →</button>
        </div>

        <div class="homepage-card" data-route="project">
          <div class="homepage-card-icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect x="6" y="6" width="36" height="36" rx="4" stroke="#4CAF50" stroke-width="2.5" fill="#E8F5E9"/>
              <rect x="10" y="10" width="12" height="8" rx="1.5" fill="#4CAF50" opacity="0.3"/>
              <rect x="10" y="20" width="12" height="8" rx="1.5" fill="#4CAF50" opacity="0.2"/>
              <rect x="10" y="30" width="12" height="8" rx="1.5" fill="#4CAF50" opacity="0.15"/>
              <rect x="24" y="10" width="14" height="8" rx="1.5" fill="#81C784" opacity="0.3"/>
              <rect x="24" y="20" width="14" height="8" rx="1.5" fill="#81C784" opacity="0.2"/>
              <rect x="24" y="30" width="14" height="8" rx="1.5" fill="#81C784" opacity="0.15"/>
            </svg>
          </div>
          <h2 class="homepage-card-title">Create Multi-file Project</h2>
          <p class="homepage-card-desc">Build larger projects with multiple files and folders. Full project management with a VSCode-style file explorer.</p>
          <button class="homepage-card-btn primary" data-route="project">Create Project →</button>
        </div>
      </div>

      <div class="homepage-import-area">
        <button class="homepage-import-btn" id="hp-import-project">📥 Import Project</button>
        <input type="file" id="hp-import-input" style="display:none" accept=".json" />
      </div>

      ${projects.length > 0 ? `
        <div class="homepage-recent">
          <h3 class="homepage-recent-title">Recent Projects</h3>
          <div class="homepage-recent-list">
            ${projects.map(p => `
              <div class="homepage-recent-item" data-project-id="${p.id}">
                <div class="homepage-recent-icon">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <rect x="2" y="2" width="16" height="16" rx="2" stroke="#4CAF50" stroke-width="1.5" fill="#E8F5E9"/>
                    <rect x="5" y="5" width="5" height="4" rx="0.5" fill="#4CAF50" opacity="0.4"/>
                    <rect x="5" y="10" width="5" height="4" rx="0.5" fill="#4CAF50" opacity="0.25"/>
                    <rect x="11" y="5" width="4" height="4" rx="0.5" fill="#81C784" opacity="0.3"/>
                    <rect x="11" y="10" width="4" height="4" rx="0.5" fill="#81C784" opacity="0.2"/>
                  </svg>
                </div>
                <div class="homepage-recent-info">
                  <span class="homepage-recent-name">${escapeHtml(p.name)}</span>
                  <span class="homepage-recent-date">${formatDate(p.updatedAt)}</span>
                </div>
                <button class="homepage-recent-delete" data-delete-id="${p.id}" title="Delete project">✕</button>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;

  // Attach event listeners
  attachListeners();
}

function attachListeners() {
  if (!homepageContainer) return;

  // Import project button
  const importBtn = document.getElementById('hp-import-project');
  const importInput = document.getElementById('hp-import-input');
  if (importBtn && importInput) {
    importBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      importInput.click();
    });
    importInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const text = await file.text();
        const project = await importProjectFromJson(text, file.name.replace(/\.json$/i, ''));
        importInput.value = '';
        onNavigate && onNavigate('#editor/project/' + project.id);
      } catch (err) {
        alert('Error importing project: ' + err.message);
        importInput.value = '';
      }
    });
  }

  // Card buttons and card clicks
  homepageContainer.querySelectorAll('[data-route]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const route = el.dataset.route;
      if (route === 'single') {
        onNavigate && onNavigate('#editor/single');
      } else if (route === 'project') {
        onNavigate && onNavigate('#editor/project/new');
      }
    });
  });

  // Recent project clicks
  homepageContainer.querySelectorAll('.homepage-recent-item').forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.target.closest('[data-delete-id]')) return;
      const projectId = el.dataset.projectId;
      if (projectId) {
        onNavigate && onNavigate(`#editor/project/${projectId}`);
      }
    });
  });

  // Delete project buttons
  homepageContainer.querySelectorAll('[data-delete-id]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const projectId = btn.dataset.deleteId;
      if (!projectId) return;
      if (confirm('Delete this project? This cannot be undone.')) {
        await deleteProject(projectId);
        render(); // re-render
      }
    });
  });
}

// --------------- Helpers ---------------

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function formatDate(ts) {
  const d = new Date(ts);
  const now = new Date();
  const diff = now - d;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
