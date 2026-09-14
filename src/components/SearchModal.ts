import { store } from '../state/store';

export function openSearchModal(): void {
  let modal = document.getElementById('search-modal-root');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'search-modal-root';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-dialog" role="dialog" aria-labelledby="search-input" aria-modal="true" style="max-width: 480px;">
      <div style="padding: 16px 20px; border-bottom: 1px solid var(--border-subtle); display: flex; align-items: center; gap: 12px;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--text-muted); flex-shrink: 0;">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input 
          type="text" 
          id="search-input" 
          placeholder="Search all tasks..." 
          style="flex: 1; font-size: 1.05rem; color: var(--text-primary);" 
          autocomplete="off"
        />
        <kbd style="padding: 3px 6px; font-size: 0.75rem; border-radius: var(--radius-xs); background-color: var(--bg-surface-active); color: var(--text-muted); font-family: inherit;">ESC</kbd>
      </div>
      <div id="search-results" style="max-height: 280px; overflow-y: auto; padding: 12px;">
        <div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 0.9rem;">
          Type to search your tasks...
        </div>
      </div>
    </div>
  `;

  requestAnimationFrame(() => {
    modal!.classList.add('active');
    const input = modal!.querySelector('#search-input') as HTMLInputElement;
    input.focus();

    const resultsContainer = modal!.querySelector('#search-results') as HTMLElement;

    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      if (!q) {
        resultsContainer.innerHTML = `<div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 0.9rem;">Type to search your tasks...</div>`;
        return;
      }

      const tasks = store.getTasks().filter(t => t.title.toLowerCase().includes(q));

      if (tasks.length === 0) {
        resultsContainer.innerHTML = `<div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 0.9rem;">No matching tasks found.</div>`;
        return;
      }

      resultsContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 4px;">
          ${tasks.map(t => `
            <div class="search-result-item" data-id="${t.id}" style="padding: 10px 14px; border-radius: var(--radius-sm); cursor: pointer; display: flex; align-items: center; justify-content: space-between; transition: background-color var(--duration-fast);">
              <span style="font-size: 0.95rem; color: var(--text-primary); ${t.completed ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${escapeHtml(t.title)}</span>
              <span style="font-size: 0.75rem; color: var(--text-muted);">${t.completed ? 'Completed' : 'Pending'}</span>
            </div>
          `).join('')}
        </div>
      `;

      resultsContainer.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('mouseenter', () => {
          (item as HTMLElement).style.backgroundColor = 'var(--bg-surface)';
        });
        item.addEventListener('mouseleave', () => {
          (item as HTMLElement).style.backgroundColor = 'transparent';
        });
        item.addEventListener('click', () => {
          const id = item.getAttribute('data-id');
          if (id) {
            closeSearchModal();
            // Highlight task or switch view
            const task = store.getTasks().find(t => t.id === id);
            if (task) {
              if (task.completed) {
                store.setViewMode('completed');
              } else {
                store.setViewMode('today');
              }
            }
          }
        });
      });
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeSearchModal();
      }
    });
  });

  const clickOutside = (e: MouseEvent) => {
    if (e.target === modal) {
      closeSearchModal();
    }
  };
  modal.addEventListener('click', clickOutside);
}

export function closeSearchModal(): void {
  const modal = document.getElementById('search-modal-root');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => {
      if (modal.parentNode) modal.parentNode.removeChild(modal);
    }, 200);
  }
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
