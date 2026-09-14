import { store } from '../state/store';
import { openReminderPicker, ReminderSelection } from './ReminderPicker';

export class TaskInput {
  private element: HTMLElement;
  private inputField!: HTMLInputElement;
  private submitBtn!: HTMLButtonElement;
  private reminderBtn!: HTMLButtonElement;
  private reminderContainer!: HTMLElement;
  private activeReminder: ReminderSelection | null = null;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'task-input-wrapper';
    this.render();
  }

  public getElement(): HTMLElement {
    return this.element;
  }

  public focus(): void {
    if (this.inputField) {
      this.inputField.focus();
    }
  }

  private render(): void {
    this.element.innerHTML = `
      <form class="task-input-pill" id="task-input-form" onsubmit="return false;">
        <div class="task-input-circle-icon" aria-hidden="true"></div>
        <input 
          type="text" 
          class="task-input-field" 
          id="task-input-field" 
          placeholder="Add a task..." 
          autocomplete="off"
          autocorrect="off"
          spellcheck="false"
          aria-label="Add a task"
        />
        <div class="task-input-actions">
          <button 
            type="button" 
            class="input-action-btn" 
            id="task-reminder-btn" 
            title="Set reminder (time)" 
            aria-label="Set reminder"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </button>
          <button 
            type="submit" 
            class="input-submit-btn" 
            id="task-submit-btn" 
            disabled 
            aria-label="Submit task"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </div>
      </form>
      <div id="task-reminder-tag-container"></div>
    `;

    this.inputField = this.element.querySelector('#task-input-field') as HTMLInputElement;
    this.submitBtn = this.element.querySelector('#task-submit-btn') as HTMLButtonElement;
    this.reminderBtn = this.element.querySelector('#task-reminder-btn') as HTMLButtonElement;
    this.reminderContainer = this.element.querySelector('#task-reminder-tag-container') as HTMLElement;

    this.bindEvents();
  }

  private bindEvents(): void {
    this.inputField.addEventListener('input', () => {
      const hasValue = this.inputField.value.trim().length > 0;
      this.submitBtn.disabled = !hasValue;
    });

    this.inputField.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.submit();
      }
    });

    this.element.querySelector('#task-input-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.submit();
    });

    this.reminderBtn.addEventListener('click', () => {
      openReminderPicker(
        this.activeReminder ? this.activeReminder.timeString : null,
        (selection) => {
          this.activeReminder = selection;
          this.updateReminderTag();
          this.inputField.focus();
        }
      );
    });
  }

  private updateReminderTag(): void {
    if (!this.activeReminder) {
      this.reminderContainer.innerHTML = '';
      this.reminderBtn.classList.remove('active');
      return;
    }

    this.reminderBtn.classList.add('active');
    this.reminderContainer.innerHTML = `
      <div class="reminder-tag">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        <span>${this.activeReminder.timeString}</span>
        <button type="button" class="reminder-tag-remove" id="reminder-tag-remove" aria-label="Remove reminder">×</button>
      </div>
    `;

    this.reminderContainer.querySelector('#reminder-tag-remove')?.addEventListener('click', () => {
      this.activeReminder = null;
      this.updateReminderTag();
    });
  }

  private submit(): void {
    const title = this.inputField.value.trim();
    if (!title) return;

    const dueDate = this.activeReminder ? this.activeReminder.dueDate : null;
    const reminderTime = this.activeReminder ? this.activeReminder.timeString : null;

    store.addTask(title, dueDate, reminderTime);

    this.inputField.value = '';
    this.submitBtn.disabled = true;
    this.activeReminder = null;
    this.updateReminderTag();
  }
}
