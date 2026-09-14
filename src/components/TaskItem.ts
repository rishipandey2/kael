import { Task } from '../types/task';
import { store } from '../state/store';
import { openReminderPicker } from './ReminderPicker';

export function renderTaskItem(task: Task): HTMLElement {
  const li = document.createElement('li');
  li.className = `task-item ${task.completed ? 'completed' : ''}`;
  li.setAttribute('data-id', task.id);

  // Format meta string
  let metaHtml = '';
  if (task.reminderTime || task.dueDate) {
    const todayStr = new Date().toISOString().split('T')[0];
    let dateLabel = 'Today';
    if (task.dueDate && task.dueDate !== todayStr) {
      const parsed = new Date(task.dueDate + 'T00:00:00');
      dateLabel = parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    const timeLabel = task.reminderTime ? `, ${task.reminderTime}` : '';

    metaHtml = `
      <div class="task-meta">
        <span class="task-meta-item">
          <svg class="task-meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <span>${dateLabel}${timeLabel}</span>
        </span>
      </div>
    `;
  }

  li.innerHTML = `
    <div class="task-item-main" role="button" tabindex="0" aria-label="Toggle task ${escapeHtml(task.title)}">
      <div class="task-checkbox-btn" aria-hidden="true">
        <div class="task-checkbox-circle">
          <svg class="task-checkbox-check" viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
      </div>

      <div class="task-content">
        <span class="task-title">${escapeHtml(task.title)}</span>
        ${metaHtml}
      </div>
    </div>

    <div class="task-actions">
      <button class="task-menu-btn" title="More options" aria-label="Task options">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="1.5" fill="currentColor"></circle>
          <circle cx="19" cy="12" r="1.5" fill="currentColor"></circle>
          <circle cx="5" cy="12" r="1.5" fill="currentColor"></circle>
        </svg>
      </button>
    </div>
  `;

  // Click on main row toggles completion
  const mainBtn = li.querySelector('.task-item-main') as HTMLElement;
  const toggleAction = () => {
    const isCompleting = !task.completed;
    const inTodayView = store.getCurrentView() === 'today';

    if (isCompleting && inTodayView) {
      // Immediately show the completed visual state
      li.classList.add('completed');
      // Then animate out
      requestAnimationFrame(() => {
        li.classList.add('task-exiting');
        li.addEventListener('transitionend', () => {
          store.toggleTask(task.id);
        }, { once: true });
      });
    } else {
      store.toggleTask(task.id);
    }
  };

  mainBtn.addEventListener('click', toggleAction);
  mainBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleAction();
    }
  });

  // Task menu button (delete / edit / reminder)
  const menuBtn = li.querySelector('.task-menu-btn') as HTMLElement;
  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openTaskMenu(task, menuBtn);
  });

  return li;
}

function openTaskMenu(task: Task, anchor: HTMLElement): void {
  const existingMenu = document.getElementById('task-context-menu');
  if (existingMenu) {
    existingMenu.remove();
    return;
  }

  const menu = document.createElement('div');
  menu.id = 'task-context-menu';
  menu.style.position = 'fixed';
  menu.style.zIndex = '150';
  menu.style.backgroundColor = 'var(--bg-surface-elevated)';
  menu.style.border = '1px solid var(--border-medium)';
  menu.style.borderRadius = 'var(--radius-md)';
  menu.style.boxShadow = 'var(--shadow-popover)';
  menu.style.padding = '6px';
  menu.style.minWidth = '160px';

  const rect = anchor.getBoundingClientRect();
  menu.style.top = `${rect.bottom + 6}px`;
  menu.style.right = `${window.innerWidth - rect.right}px`;

  menu.innerHTML = `
    <button type="button" class="task-context-item" id="menu-remind" style="width: 100%; display: flex; align-items: center; gap: 8px; padding: 8px 12px; font-size: 0.88rem; border-radius: var(--radius-sm); color: var(--text-primary); text-align: left;">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      </svg>
      <span>Set reminder</span>
    </button>
    <button type="button" class="task-context-item" id="menu-delete" style="width: 100%; display: flex; align-items: center; gap: 8px; padding: 8px 12px; font-size: 0.88rem; border-radius: var(--radius-sm); color: #E57373; text-align: left;">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      </svg>
      <span>Delete task</span>
    </button>
  `;

  document.body.appendChild(menu);

  menu.querySelector('#menu-remind')?.addEventListener('click', () => {
    menu.remove();
    openReminderPicker(task.reminderTime, (selection) => {
      if (selection) {
        store.updateTask(task.id, {
          reminderTime: selection.timeString,
          dueDate: selection.dueDate
        });
      }
    });
  });

  menu.querySelector('#menu-delete')?.addEventListener('click', () => {
    menu.remove();
    store.deleteTask(task.id);
  });

  const closeHandler = (e: MouseEvent) => {
    if (!menu.contains(e.target as Node) && e.target !== anchor) {
      menu.remove();
      document.removeEventListener('click', closeHandler);
    }
  };
  setTimeout(() => {
    document.addEventListener('click', closeHandler);
  }, 10);
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
