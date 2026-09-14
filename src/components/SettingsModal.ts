import { store } from '../state/store';
import { requestNotificationPermission, getNotificationPermissionStatus } from '../state/notifications';
import { showToast } from './Toast';

export function openSettingsModal(): void {
  let modal = document.getElementById('settings-modal-root');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'settings-modal-root';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  const settings = store.getSettings();
  const notifStatus = getNotificationPermissionStatus();

  modal.innerHTML = `
    <div class="modal-dialog" role="dialog" aria-labelledby="settings-title" aria-modal="true">
      <div class="modal-header">
        <h3 id="settings-title" class="modal-title">Preferences</h3>
        <button class="modal-close-btn" id="settings-close-x" aria-label="Close preferences">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <div class="settings-section">
          <!-- Appearance -->
          <div class="settings-row">
            <div class="settings-label">
              <span class="settings-label-title">Dark Appearance</span>
              <span class="settings-label-sub">Warm black night aesthetic</span>
            </div>
            <label class="switch">
              <input type="checkbox" id="setting-theme-toggle" ${settings.theme === 'dark' ? 'checked' : ''} />
              <span class="slider"></span>
            </label>
          </div>

          <!-- Tactile Sound -->
          <div class="settings-row">
            <div class="settings-label">
              <span class="settings-label-title">Tactile Audio Feedback</span>
              <span class="settings-label-sub">Synthesized click & completion tones</span>
            </div>
            <label class="switch">
              <input type="checkbox" id="setting-sound-toggle" ${settings.soundEnabled ? 'checked' : ''} />
              <span class="slider"></span>
            </label>
          </div>

          <!-- Notifications -->
          <div class="settings-row">
            <div class="settings-label">
              <span class="settings-label-title">Task Reminders</span>
              <span class="settings-label-sub">${notifStatus === 'granted' ? 'Notifications active' : 'Alerts when scheduled tasks are due'}</span>
            </div>
            <button type="button" class="btn-secondary" id="setting-notif-btn" style="padding: 6px 14px; font-size: 0.82rem;">
              ${notifStatus === 'granted' ? 'Enabled' : 'Allow'}
            </button>
          </div>

          <div style="border-top: 1px solid var(--border-subtle); padding-top: 16px; display: flex; flex-direction: column; gap: 12px;">
            <span style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); font-weight: 600;">Data & Privacy</span>
            
            <div style="font-size: 0.82rem; color: var(--text-muted); line-height: 1.4;">
              100% local-first. No servers, no tracking, no AI surveillance. Your tasks never leave this device.
            </div>

            <div style="display: flex; gap: 8px; margin-top: 4px;">
              <button type="button" class="btn-secondary" id="setting-export-btn" style="flex: 1; font-size: 0.84rem;">Export Backup</button>
              <button type="button" class="btn-secondary" id="setting-import-btn" style="flex: 1; font-size: 0.84rem;">Restore Backup</button>
              <input type="file" id="setting-import-input" accept=".json" style="display: none;" />
            </div>

            <button type="button" id="setting-clear-completed-btn" style="text-align: left; padding: 8px 0; font-size: 0.84rem; color: var(--text-muted); cursor: pointer; transition: color var(--duration-fast);">
              Clear all completed tasks
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  requestAnimationFrame(() => {
    modal!.classList.add('active');
  });

  // Close handlers
  modal.querySelector('#settings-close-x')?.addEventListener('click', closeSettingsModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeSettingsModal();
  });

  // Theme toggle
  modal.querySelector('#setting-theme-toggle')?.addEventListener('change', (e) => {
    const isDark = (e.target as HTMLInputElement).checked;
    store.setTheme(isDark ? 'dark' : 'light');
  });

  // Sound toggle
  modal.querySelector('#setting-sound-toggle')?.addEventListener('change', (e) => {
    const isEnabled = (e.target as HTMLInputElement).checked;
    store.updateSettings({ soundEnabled: isEnabled });
  });

  // Notification button
  const notifBtn = modal.querySelector('#setting-notif-btn') as HTMLButtonElement;
  notifBtn?.addEventListener('click', async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      store.updateSettings({ notificationsEnabled: true });
      notifBtn.textContent = 'Enabled';
      showToast('Notifications enabled');
    } else {
      showToast('Notifications not permitted in browser');
    }
  });

  // Export JSON
  modal.querySelector('#setting-export-btn')?.addEventListener('click', () => {
    const json = store.exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `task-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup downloaded');
  });

  // Import JSON
  const importInput = modal.querySelector('#setting-import-input') as HTMLInputElement;
  modal.querySelector('#setting-import-btn')?.addEventListener('click', () => {
    importInput.click();
  });

  importInput?.addEventListener('change', () => {
    const file = importInput.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (content && store.importData(content)) {
          showToast('Tasks restored successfully');
          closeSettingsModal();
        } else {
          showToast('Failed to parse backup file');
        }
      };
      reader.readAsText(file);
    }
  });

  // Clear completed
  modal.querySelector('#setting-clear-completed-btn')?.addEventListener('click', () => {
    store.clearCompleted();
    showToast('Completed tasks cleared');
    closeSettingsModal();
  });
}

export function closeSettingsModal(): void {
  const modal = document.getElementById('settings-modal-root');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => {
      if (modal.parentNode) modal.parentNode.removeChild(modal);
    }, 200);
  }
}
