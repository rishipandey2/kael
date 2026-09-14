import { Task, ViewMode, Theme, AppSettings, TaskCounts } from '../types/task';
import { playTactileTick, playCompletionChime } from './sound';
import { sendTaskNotification } from './notifications';

const TASKS_STORAGE_KEY = 'task_app_items_v1';
const SETTINGS_STORAGE_KEY = 'task_app_settings_v1';

// Seed sample tasks matching the design reference for first-time use
const DEFAULT_SAMPLE_TASKS: Task[] = [
  {
    id: 'seed-1',
    title: 'Finish design mockups',
    completed: false,
    completedAt: null,
    dueDate: new Date().toISOString().split('T')[0],
    reminderTime: '7:00 PM',
    createdAt: Date.now() - 3600000,
    order: 1
  },
  {
    id: 'seed-2',
    title: 'Reply to client email',
    completed: true,
    completedAt: Date.now() - 1800000,
    dueDate: new Date().toISOString().split('T')[0],
    reminderTime: '1:45 PM',
    createdAt: Date.now() - 7200000,
    order: 2
  },
  {
    id: 'seed-3',
    title: 'Go for a walk',
    completed: false,
    completedAt: null,
    dueDate: new Date().toISOString().split('T')[0],
    reminderTime: '6:00 PM',
    createdAt: Date.now() - 900000,
    order: 3
  }
];

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  soundEnabled: true,
  hapticEnabled: true,
  notificationsEnabled: false
};

type Listener = () => void;

class TaskStore {
  private tasks: Task[] = [];
  private settings: AppSettings = DEFAULT_SETTINGS;
  private currentView: ViewMode = 'today';
  private searchQuery: string = '';
  private listeners: Set<Listener> = new Set();
  private reminderCheckInterval: number | null = null;

  public destroy(): void {
    if (this.reminderCheckInterval) {
      clearInterval(this.reminderCheckInterval);
      this.reminderCheckInterval = null;
    }
  }

  constructor() {
    this.loadState();
    this.applyTheme(this.settings.theme);
    this.startReminderDaemon();
  }

  private loadState(): void {
    try {
      const savedTasks = localStorage.getItem(TASKS_STORAGE_KEY);
      if (savedTasks) {
        this.tasks = JSON.parse(savedTasks);
      } else {
        this.tasks = DEFAULT_SAMPLE_TASKS;
        this.saveTasks();
      }

      const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (savedSettings) {
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) };
      }

      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const urlTheme = urlParams.get('theme');
        if (urlTheme === 'light' || urlTheme === 'dark') {
          this.settings.theme = urlTheme;
        }
      }
    } catch {
      this.tasks = DEFAULT_SAMPLE_TASKS;
      this.settings = DEFAULT_SETTINGS;
    }
  }

  private saveTasks(): void {
    try {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(this.tasks));
    } catch (e) {
      console.error('Failed to persist tasks', e);
    }
  }

  private saveSettings(): void {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(this.settings));
    } catch (e) {
      console.error('Failed to persist settings', e);
    }
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private _notifyPending = false;

  private notify(): void {
    if (this._notifyPending) return;
    this._notifyPending = true;
    requestAnimationFrame(() => {
      this._notifyPending = false;
      this.listeners.forEach((fn) => fn());
    });
  }

  public getTasks(): Task[] {
    return [...this.tasks];
  }

  public getCurrentView(): string {
    return this.currentView;
  }

  public getFilteredTasks(): Task[] {
    const todayStr = new Date().toISOString().split('T')[0];
    let list = this.tasks;

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      return list.filter((t) => t.title.toLowerCase().includes(q));
    }

    if (this.currentView === 'today') {
      // In Today view: only incomplete tasks due today or without a future due date
      return list.filter((t) => {
        if (t.completed) return false;
        if (!t.dueDate) return true;
        return t.dueDate <= todayStr;
      }).sort((a, b) => a.order - b.order);
    }

    if (this.currentView === 'upcoming') {
      return list.filter((t) => {
        return t.dueDate && t.dueDate > todayStr && !t.completed;
      }).sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''));
    }

    if (this.currentView === 'completed') {
      return list.filter((t) => t.completed)
        .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));
    }

    return list;
  }

  public getCounts(): TaskCounts {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayCount = this.tasks.filter((t) => {
      if (t.completed) return false;
      return !t.dueDate || t.dueDate <= todayStr;
    }).length;

    const upcomingCount = this.tasks.filter((t) => {
      return !t.completed && t.dueDate && t.dueDate > todayStr;
    }).length;

    const completedCount = this.tasks.filter((t) => t.completed).length;

    return {
      today: todayCount,
      upcoming: upcomingCount,
      completed: completedCount
    };
  }

  public getViewMode(): ViewMode {
    return this.currentView;
  }

  public setViewMode(view: ViewMode): void {
    if (this.currentView !== view) {
      this.currentView = view;
      this.searchQuery = '';
      if (this.settings.soundEnabled) playTactileTick();
      this.notify();
    }
  }

  public getSearchQuery(): string {
    return this.searchQuery;
  }

  public setSearchQuery(query: string): void {
    this.searchQuery = query;
    this.notify();
  }

  public addTask(title: string, dueDate: string | null = null, reminderTime: string | null = null): Task {
    const todayStr = new Date().toISOString().split('T')[0];
    const newTask: Task = {
      id: 'task-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      title: title.trim(),
      completed: false,
      completedAt: null,
      dueDate: dueDate || todayStr,
      reminderTime: reminderTime || null,
      createdAt: Date.now(),
      order: this.tasks.length + 1
    };

    this.tasks.unshift(newTask);
    this.saveTasks();

    if (this.settings.soundEnabled) {
      playTactileTick();
    }

    this.notify();
    return newTask;
  }

  public toggleTask(id: string): void {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) return;

    task.completed = !task.completed;
    task.completedAt = task.completed ? Date.now() : null;
    this.saveTasks();

    if (this.settings.soundEnabled) {
      if (task.completed) {
        playCompletionChime();
      } else {
        playTactileTick();
      }
    }

    this.notify();
  }

  public deleteTask(id: string): void {
    this.tasks = this.tasks.filter((t) => t.id !== id);
    this.saveTasks();
    if (this.settings.soundEnabled) playTactileTick();
    this.notify();
  }

  public updateTask(id: string, updates: Partial<Task>): void {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) return;

    Object.assign(task, updates);
    this.saveTasks();
    this.notify();
  }

  public clearCompleted(): void {
    this.tasks = this.tasks.filter((t) => !t.completed);
    this.saveTasks();
    if (this.settings.soundEnabled) playTactileTick();
    this.notify();
  }

  // Settings
  public getSettings(): AppSettings {
    return { ...this.settings };
  }

  public setTheme(theme: Theme): void {
    this.settings.theme = theme;
    this.saveSettings();
    this.applyTheme(theme);
    if (this.settings.soundEnabled) playTactileTick();
    this.notify();
  }

  public toggleTheme(): void {
    const newTheme = this.settings.theme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }

  public updateSettings(partial: Partial<AppSettings>): void {
    this.settings = { ...this.settings, ...partial };
    this.saveSettings();
    if (partial.theme) {
      this.applyTheme(partial.theme);
    }
    this.notify();
  }

  private applyTheme(theme: Theme): void {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', theme === 'dark' ? '#0B0B0C' : '#F6F4EF');
      }
    }
  }

  // Export / Import
  public exportData(): string {
    return JSON.stringify({
      version: 1,
      exportedAt: new Date().toISOString(),
      tasks: this.tasks,
      settings: this.settings
    }, null, 2);
  }

  public importData(jsonContent: string): boolean {
    try {
      const data = JSON.parse(jsonContent);
      if (Array.isArray(data.tasks)) {
        this.tasks = data.tasks;
        this.saveTasks();
        if (data.settings) {
          this.settings = { ...this.settings, ...data.settings };
          this.saveSettings();
          this.applyTheme(this.settings.theme);
        }
        this.notify();
        return true;
      }
    } catch (e) {
      console.error('Import parse failure', e);
    }
    return false;
  }

  // Scheduled notification check
  private startReminderDaemon(): void {
    if (typeof window === 'undefined') return;
    this.reminderCheckInterval = window.setInterval(() => {
      this.checkDueReminders();
    }, 30000);
  }

  private checkDueReminders(): void {
    if (!this.settings.notificationsEnabled) return;

    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();

    // Match formatted time e.g. "7:00 PM"
    const period = currentHours >= 12 ? 'PM' : 'AM';
    const hours12 = currentHours % 12 || 12;
    const timeString = `${hours12}:${currentMinutes.toString().padStart(2, '0')} ${period}`;

    const todayStr = now.toISOString().split('T')[0];

    this.tasks.forEach((task) => {
      if (!task.completed && task.reminderTime && task.dueDate === todayStr) {
        if (task.reminderTime.trim().toLowerCase() === timeString.toLowerCase()) {
          sendTaskNotification('tāsk Reminder', task.title);
        }
      }
    });
  }
}

export const store = new TaskStore();
