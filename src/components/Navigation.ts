import { store } from '../state/store';
import { ViewMode } from '../types/task';

export class Navigation {
  private sidebarContainer: HTMLElement;
  private mobileNavContainer: HTMLElement;

  constructor(sidebarContainer: HTMLElement, mobileNavContainer: HTMLElement) {
    this.sidebarContainer = sidebarContainer;
    this.mobileNavContainer = mobileNavContainer;

    this.render();
    store.subscribe(() => this.updateState());
  }

  public render(): void {
    const currentView = store.getViewMode();
    const counts = store.getCounts();
    const theme = store.getSettings().theme;

    // Desktop Sidebar Layout
    this.sidebarContainer.innerHTML = `
      <div class="sidebar-top">
        <div class="sidebar-brand">
          <span class="brand-logo-text">t ā s k</span>
        </div>
        <ul class="sidebar-nav">
          <li>
            <button type="button" class="nav-item-btn ${currentView === 'today' ? 'active' : ''}" data-view="today">
              <span class="nav-item-left">
                <span style="font-size: 0.8rem; opacity: 0.7;">●</span>
                <span>Today</span>
              </span>
              <span class="nav-counter-pill" id="counter-today">${counts.today}</span>
            </button>
          </li>
          <li>
            <button type="button" class="nav-item-btn ${currentView === 'upcoming' ? 'active' : ''}" data-view="upcoming">
              <span class="nav-item-left">
                <svg class="nav-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                </svg>
                <span>Upcoming</span>
              </span>
              <span class="nav-counter-pill" id="counter-upcoming">${counts.upcoming}</span>
            </button>
          </li>
          <li>
            <button type="button" class="nav-item-btn ${currentView === 'completed' ? 'active' : ''}" data-view="completed">
              <span class="nav-item-left">
                <svg class="nav-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Completed</span>
              </span>
              <span class="nav-counter-pill" id="counter-completed">${counts.completed}</span>
            </button>
          </li>
        </ul>
      </div>

      <div class="sidebar-footer">
        <button type="button" class="sidebar-footer-btn" id="sidebar-theme-toggle" aria-label="Toggle theme">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            ${theme === 'dark' 
              ? '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>' 
              : '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>'}
          </svg>
          <span id="theme-label">${theme === 'dark' ? 'Dark' : 'Light'}</span>
        </button>

        <button type="button" class="icon-btn" id="sidebar-settings-btn" title="Settings" aria-label="Settings">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </button>
      </div>
    `;

    // Mobile Bottom Floating Nav
    this.mobileNavContainer.innerHTML = `
      <button type="button" class="mobile-nav-btn ${currentView === 'today' ? 'active' : ''}" data-view="today">
        <span>Today</span>
        <span class="mobile-nav-counter" id="mobile-counter-today">${counts.today}</span>
      </button>
      <button type="button" class="mobile-nav-btn ${currentView === 'upcoming' ? 'active' : ''}" data-view="upcoming">
        <span>Upcoming</span>
        <span class="mobile-nav-counter" id="mobile-counter-upcoming">${counts.upcoming}</span>
      </button>
      <button type="button" class="mobile-nav-btn ${currentView === 'completed' ? 'active' : ''}" data-view="completed">
        <span>Done</span>
        <span class="mobile-nav-counter" id="mobile-counter-completed">${counts.completed}</span>
      </button>
    `;

    this.bindEvents();
  }

  private bindEvents(): void {
    // Nav button clicks
    const allNavButtons = [
      ...Array.from(this.sidebarContainer.querySelectorAll('[data-view]')),
      ...Array.from(this.mobileNavContainer.querySelectorAll('[data-view]'))
    ];

    allNavButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const view = (e.currentTarget as HTMLElement).getAttribute('data-view') as ViewMode;
        if (view) {
          store.setViewMode(view);
        }
      });
    });

    // Theme toggle
    this.sidebarContainer.querySelector('#sidebar-theme-toggle')?.addEventListener('click', () => {
      store.toggleTheme();
    });
  }

  public updateState(): void {
    const currentView = store.getViewMode();
    const counts = store.getCounts();
    const theme = store.getSettings().theme;

    // Update active classes
    this.sidebarContainer.querySelectorAll('[data-view]').forEach(el => {
      const v = el.getAttribute('data-view');
      el.classList.toggle('active', v === currentView);
    });

    this.mobileNavContainer.querySelectorAll('[data-view]').forEach(el => {
      const v = el.getAttribute('data-view');
      el.classList.toggle('active', v === currentView);
    });

    // Update counters
    const updateCount = (id: string, val: number) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val.toString();
    };

    updateCount('counter-today', counts.today);
    updateCount('counter-upcoming', counts.upcoming);
    updateCount('counter-completed', counts.completed);
    updateCount('mobile-counter-today', counts.today);
    updateCount('mobile-counter-upcoming', counts.upcoming);
    updateCount('mobile-counter-completed', counts.completed);

    // Update theme button text/icon
    const themeLabel = document.getElementById('theme-label');
    if (themeLabel) {
      themeLabel.textContent = theme === 'dark' ? 'Dark' : 'Light';
    }
  }
}
