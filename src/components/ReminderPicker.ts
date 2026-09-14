export interface ReminderSelection {
  timeString: string; // e.g. "7:00 PM"
  dueDate: string;    // YYYY-MM-DD
}

type ReminderCallback = (selection: ReminderSelection | null) => void;

let activeCallback: ReminderCallback | null = null;
let currentHour = 7;
let currentMinute = 0;
let currentPeriod = 'PM';
let currentDueDate = new Date().toISOString().split('T')[0];

export function openReminderPicker(initialTime: string | null = null, callback: ReminderCallback): void {
  activeCallback = callback;

  if (initialTime) {
    const match = initialTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (match) {
      currentHour = parseInt(match[1], 10);
      currentMinute = parseInt(match[2], 10);
      currentPeriod = match[3].toUpperCase();
    }
  } else {
    const now = new Date();
    currentHour = (now.getHours() % 12 || 12);
    currentMinute = Math.round(now.getMinutes() / 5) * 5 % 60;
    currentPeriod = now.getHours() >= 12 ? 'PM' : 'AM';
  }

  currentDueDate = new Date().toISOString().split('T')[0];

  let modal = document.getElementById('reminder-modal-root');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'reminder-modal-root';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  renderModalContent(modal);
  requestAnimationFrame(() => {
    modal!.classList.add('active');
  });
}

export function closeReminderPicker(): void {
  const modal = document.getElementById('reminder-modal-root');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => {
      if (modal.parentNode) modal.parentNode.removeChild(modal);
    }, 250);
  }
}

function renderModalContent(container: HTMLElement): void {
  const hours = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
  const periods = ['AM', 'PM'];

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });

  container.innerHTML = `
    <div class="modal-dialog" role="dialog" aria-labelledby="reminder-title" aria-modal="true">
      <div class="modal-header">
        <h3 id="reminder-title" class="modal-title">Set Reminder</h3>
        <button class="modal-close-btn" id="reminder-cancel-x" aria-label="Cancel">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <!-- Quick Presets -->
        <div class="quick-presets">
          <button type="button" class="preset-chip" data-preset="today-7pm">Today, 7:00 PM</button>
          <button type="button" class="preset-chip" data-preset="tomorrow-9am">Tomorrow, 9:00 AM</button>
          <button type="button" class="preset-chip" data-preset="today-6pm">Today, 6:00 PM</button>
        </div>

        <!-- Wheel Drum Picker -->
        <div class="drum-picker-container">
          <div class="drum-picker-highlight"></div>

          <!-- Hours -->
          <div class="drum-column" id="drum-hours">
            <div class="drum-column-spacer"></div>
            ${hours.map(h => `<div class="drum-item ${h === currentHour ? 'active' : ''}" data-val="${h}">${h}</div>`).join('')}
            <div class="drum-column-spacer"></div>
          </div>

          <!-- Minutes -->
          <div class="drum-column" id="drum-minutes">
            <div class="drum-column-spacer"></div>
            ${minutes.map(m => {
              const formatted = m.toString().padStart(2, '0');
              return `<div class="drum-item ${m === currentMinute ? 'active' : ''}" data-val="${m}">${formatted}</div>`;
            }).join('')}
            <div class="drum-column-spacer"></div>
          </div>

          <!-- AM/PM -->
          <div class="drum-column" id="drum-period">
            <div class="drum-column-spacer"></div>
            ${periods.map(p => `<div class="drum-item ${p === currentPeriod ? 'active' : ''}" data-val="${p}">${p}</div>`).join('')}
            <div class="drum-column-spacer"></div>
          </div>
        </div>

        <!-- Date indicator / picker -->
        <div style="margin-top: 16px; padding: 12px 16px; background-color: var(--bg-surface); border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 8px; font-size: 0.9rem; color: var(--text-primary);">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span id="reminder-date-label">Today, ${todayStr}</span>
          </div>
          <input type="date" id="reminder-date-input" value="${currentDueDate}" style="opacity: 0; position: absolute; pointer-events: none;" />
          <button type="button" id="reminder-change-date" style="font-size: 0.82rem; color: var(--text-muted); cursor: pointer;">Change</button>
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn-secondary" id="reminder-btn-cancel">Cancel</button>
        <button type="button" class="btn-primary" id="reminder-btn-done">Done</button>
      </div>
    </div>
  `;

  // Attach event handlers
  container.querySelector('#reminder-cancel-x')?.addEventListener('click', () => {
    closeReminderPicker();
  });
  container.querySelector('#reminder-btn-cancel')?.addEventListener('click', () => {
    closeReminderPicker();
  });

  // Preset chips
  container.querySelectorAll('.preset-chip').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const preset = (e.currentTarget as HTMLElement).getAttribute('data-preset');
      const now = new Date();
      if (preset === 'today-7pm') {
        currentHour = 7;
        currentMinute = 0;
        currentPeriod = 'PM';
        currentDueDate = now.toISOString().split('T')[0];
      } else if (preset === 'tomorrow-9am') {
        currentHour = 9;
        currentMinute = 0;
        currentPeriod = 'AM';
        const tomorrow = new Date(now.getTime() + 86400000);
        currentDueDate = tomorrow.toISOString().split('T')[0];
      } else if (preset === 'today-6pm') {
        currentHour = 6;
        currentMinute = 0;
        currentPeriod = 'PM';
        currentDueDate = now.toISOString().split('T')[0];
      }
      updateDrumSelection(container);
    });
  });

  // Drum selection click listeners
  container.querySelectorAll('#drum-hours .drum-item').forEach(item => {
    item.addEventListener('click', (e) => {
      currentHour = parseInt((e.currentTarget as HTMLElement).getAttribute('data-val') || '7', 10);
      updateDrumSelection(container);
    });
  });

  container.querySelectorAll('#drum-minutes .drum-item').forEach(item => {
    item.addEventListener('click', (e) => {
      currentMinute = parseInt((e.currentTarget as HTMLElement).getAttribute('data-val') || '0', 10);
      updateDrumSelection(container);
    });
  });

  container.querySelectorAll('#drum-period .drum-item').forEach(item => {
    item.addEventListener('click', (e) => {
      currentPeriod = (e.currentTarget as HTMLElement).getAttribute('data-val') || 'PM';
      updateDrumSelection(container);
    });
  });

  // Change date button triggers hidden native date picker
  const dateInput = container.querySelector('#reminder-date-input') as HTMLInputElement;
  container.querySelector('#reminder-change-date')?.addEventListener('click', () => {
    try {
      dateInput.showPicker();
    } catch {
      dateInput.click();
    }
  });

  dateInput.addEventListener('change', () => {
    if (dateInput.value) {
      currentDueDate = dateInput.value;
      const parsed = new Date(dateInput.value + 'T00:00:00');
      const label = container.querySelector('#reminder-date-label');
      if (label) {
        label.textContent = parsed.toLocaleDateString('en-US', {
          weekday: 'short',
          day: 'numeric',
          month: 'short'
        });
      }
    }
  });

  // Done button
  container.querySelector('#reminder-btn-done')?.addEventListener('click', () => {
    const formattedMinutes = currentMinute.toString().padStart(2, '0');
    const timeString = `${currentHour}:${formattedMinutes} ${currentPeriod}`;
    if (activeCallback) {
      activeCallback({
        timeString,
        dueDate: currentDueDate
      });
    }
    closeReminderPicker();
  });
}

function updateDrumSelection(container: HTMLElement): void {
  container.querySelectorAll('#drum-hours .drum-item').forEach(el => {
    const v = parseInt(el.getAttribute('data-val') || '', 10);
    el.classList.toggle('active', v === currentHour);
  });
  container.querySelectorAll('#drum-minutes .drum-item').forEach(el => {
    const v = parseInt(el.getAttribute('data-val') || '', 10);
    el.classList.toggle('active', v === currentMinute);
  });
  container.querySelectorAll('#drum-period .drum-item').forEach(el => {
    const v = el.getAttribute('data-val');
    el.classList.toggle('active', v === currentPeriod);
  });
}
