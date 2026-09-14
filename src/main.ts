import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/animations.css';

import { store } from './state/store';
import { renderAmbientHorizon } from './components/AmbientHorizon';
import { TaskInput } from './components/TaskInput';
import { TaskList } from './components/TaskList';
import { Navigation } from './components/Navigation';
import { openSearchModal, closeSearchModal } from './components/SearchModal';
import { openSettingsModal, closeSettingsModal } from './components/SettingsModal';
import { showToast } from './components/Toast';

function initApp(): void {
  const appRoot = document.getElementById('app');
  if (!appRoot) return;

  // 1. Ambient Horizon Background
  appRoot.appendChild(renderAmbientHorizon());

  // 2. Desktop Sidebar
  const sidebar = document.createElement('aside');
  sidebar.className = 'app-sidebar';
  appRoot.appendChild(sidebar);

  // 3. Main Content Workspace
  const main = document.createElement('main');
  main.className = 'app-main';
  appRoot.appendChild(main);

  // 4. Mobile Floating Bottom Nav
  const mobileNav = document.createElement('nav');
  mobileNav.className = 'mobile-bottom-nav';
  mobileNav.setAttribute('aria-label', 'Mobile view navigation');
  appRoot.appendChild(mobileNav);

  // Initialize Navigation controller
  new Navigation(sidebar, mobileNav);

  // Render Main Workspace Content
  renderMainContent(main);

  // Global Keyboard Shortcuts
  setupKeyboardShortcuts();

  // Register Service Worker & Offline Listeners
  setupPWA();
}

function renderMainContent(mainContainer: HTMLElement): void {
  const container = document.createElement('div');
  container.className = 'main-container';

  // Top bar
  const topbar = document.createElement('header');
  topbar.className = 'main-topbar';
  topbar.innerHTML = `
    <div class="mobile-brand">
      <span class="brand-logo-text">t ā s k</span>
    </div>
    <div class="topbar-actions">
      <button type="button" class="icon-btn" id="topbar-search-btn" title="Search tasks (Cmd+K)" aria-label="Search">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </button>
      <button type="button" class="icon-btn" id="topbar-settings-btn" title="Preferences" aria-label="Preferences">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      </button>
    </div>
  `;
  container.appendChild(topbar);

  // View Greeting Header
  const viewHeader = document.createElement('div');
  viewHeader.className = 'view-header';
  container.appendChild(viewHeader);

  const updateHeaderGreeting = () => {
    const view = store.getViewMode();
    const hour = new Date().getHours();
    let timeGreeting = 'Good morning,';
    if (hour >= 12 && hour < 17) timeGreeting = 'Good afternoon,';
    else if (hour >= 17) timeGreeting = 'Good evening,';

    if (view === 'today') {
      viewHeader.innerHTML = `
        <h1 class="view-greeting">${timeGreeting}</h1>
        <h2 class="view-subgreeting">Let's get a few things done.</h2>
      `;
    } else if (view === 'upcoming') {
      viewHeader.innerHTML = `
        <h1 class="view-greeting">Upcoming,</h1>
        <h2 class="view-subgreeting">Plan the days ahead.</h2>
      `;
    } else {
      viewHeader.innerHTML = `
        <h1 class="view-greeting">Completed,</h1>
        <h2 class="view-subgreeting">Small steps build big days.</h2>
      `;
    }
  };

  updateHeaderGreeting();
  store.subscribe(updateHeaderGreeting);

  // Task Input Pill
  const taskInput = new TaskInput();
  container.appendChild(taskInput.getElement());

  // Task List
  const taskList = new TaskList();
  container.appendChild(taskList.getElement());

  mainContainer.appendChild(container);

  // Topbar Button events
  container.querySelector('#topbar-search-btn')?.addEventListener('click', openSearchModal);
  container.querySelector('#topbar-settings-btn')?.addEventListener('click', openSettingsModal);

  // Also bind sidebar settings if available
  document.getElementById('sidebar-settings-btn')?.addEventListener('click', openSettingsModal);
}

function setupKeyboardShortcuts(): void {
  window.addEventListener('keydown', (e) => {
    const activeEl = document.activeElement;
    const isInputActive = activeEl instanceof HTMLInputElement || activeEl instanceof HTMLTextAreaElement;

    // Search: Cmd + K or Ctrl + K
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      openSearchModal();
      return;
    }

    // Escape: close open modals
    if (e.key === 'Escape') {
      closeSearchModal();
      closeSettingsModal();
      return;
    }

    if (!isInputActive) {
      // 'N' or '/' to focus task input
      if (e.key === 'n' || e.key === '/') {
        e.preventDefault();
        const input = document.getElementById('task-input-field') as HTMLInputElement;
        if (input) input.focus();
      }

      // '1', '2', '3' for views
      if (e.key === '1') store.setViewMode('today');
      if (e.key === '2') store.setViewMode('upcoming');
      if (e.key === '3') store.setViewMode('completed');

      // 'D' to toggle dark/light theme
      if (e.key.toLowerCase() === 'd') {
        store.toggleTheme();
      }
    }
  });
}

function setupPWA(): void {
  // Offline & Online events
  window.addEventListener('offline', () => {
    showToast('Works offline — Your tasks are safe.');
  });

  window.addEventListener('online', () => {
    showToast('Connection restored');
  });

  // Register Service Worker
  if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => {
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  showToast('App update available');
                }
              });
            }
          });
        })
        .catch((err) => {
          console.warn('SW registration bypassed', err);
        });
    });
  }
}

// Start application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
