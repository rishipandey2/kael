import { store } from '../state/store';
import { renderTaskItem } from './TaskItem';

export class TaskList {
  private element: HTMLElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'task-list-container';
    this.render();
    store.subscribe(() => this.render());
  }

  public getElement(): HTMLElement {
    return this.element;
  }

  public render(): void {
    const tasks = store.getFilteredTasks();
    const currentView = store.getViewMode();
    const counts = store.getCounts();
    const isSearching = store.getSearchQuery().trim().length > 0;

    this.element.innerHTML = '';

    if (tasks.length === 0) {
      this.element.appendChild(this.renderEmptyState(currentView, counts.today, isSearching));
      return;
    }

    const ul = document.createElement('ul');
    ul.className = 'task-list';

    tasks.forEach((task) => {
      ul.appendChild(renderTaskItem(task));
    });

    this.element.appendChild(ul);
  }

  private renderEmptyState(view: string, pendingTodayCount: number, isSearching: boolean): HTMLElement {
    const container = document.createElement('div');
    container.className = 'empty-state';

    if (isSearching) {
      container.innerHTML = `
        <h3 class="empty-state-title">No matching tasks</h3>
        <p class="empty-state-subtitle">Try searching for something else.</p>
      `;
      return container;
    }

    // Screen 7 from reference: "All done for today. / The world feels lighter when you do."
    if (view === 'today' && pendingTodayCount === 0 && store.getTasks().length > 0) {
      container.innerHTML = `
        <div class="empty-state-art">
          <svg viewBox="0 0 140 70" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="70" cy="22" r="9" fill="var(--text-muted)" opacity="0.65" />
            <path d="M 10 58 Q 70 34 130 58" stroke="var(--text-muted)" stroke-width="1.6" stroke-linecap="round" opacity="0.75" />
            <path d="M 30 62 Q 85 45 120 62" stroke="var(--text-subtle)" stroke-width="1.2" stroke-linecap="round" opacity="0.4" />
          </svg>
        </div>
        <h3 class="empty-state-title">All done for today.</h3>
        <p class="empty-state-subtitle">The world feels lighter when you do.</p>
      `;
      return container;
    }

    // Screen 2 from reference: "What's on your mind today? |"
    if (view === 'today') {
      container.innerHTML = `
        <div class="empty-state-art">
          <svg viewBox="0 0 140 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M 15 42 Q 70 18 125 42" stroke="var(--text-subtle)" stroke-width="1.5" stroke-linecap="round" opacity="0.5" />
            <path d="M 35 48 Q 75 32 105 48" stroke="var(--text-subtle)" stroke-width="1" stroke-linecap="round" opacity="0.3" />
          </svg>
        </div>
        <h3 class="empty-state-title">What’s on your mind today?<span class="blinking-cursor"></span></h3>
        <p class="empty-state-subtitle">Just type. No clutter.</p>
      `;
      return container;
    }

    if (view === 'upcoming') {
      container.innerHTML = `
        <h3 class="empty-state-title">No upcoming tasks</h3>
        <p class="empty-state-subtitle">Schedule dates and times to organize future thoughts.</p>
      `;
      return container;
    }

    container.innerHTML = `
      <h3 class="empty-state-title">No completed tasks yet</h3>
      <p class="empty-state-subtitle">Completed tasks will gently settle here.</p>
    `;
    return container;
  }
}
