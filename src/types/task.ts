export interface Task {
  id: string;
  title: string;
  completed: boolean;
  completedAt: number | null;
  dueDate: string | null; // ISO Date YYYY-MM-DD
  reminderTime: string | null; // e.g. "7:00 PM" or ISO timestamp
  createdAt: number;
  order: number;
}

export type ViewMode = 'today' | 'upcoming' | 'completed';

export type Theme = 'dark' | 'light';

export interface AppSettings {
  theme: Theme;
  soundEnabled: boolean;
  hapticEnabled: boolean;
  notificationsEnabled: boolean;
}

export interface TaskCounts {
  today: number;
  upcoming: number;
  completed: number;
}
