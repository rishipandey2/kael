// Web Notification API integration for scheduled task reminders

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  if (Notification.permission !== 'denied') {
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  }
  return false;
}

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermissionStatus(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

/**
 * Dispatch a notification for a task
 */
export function sendTaskNotification(title: string, body: string): void {
  if (getNotificationPermissionStatus() !== 'granted') return;

  try {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, {
          body,
          icon: '/icon-192.png',
          badge: '/favicon.svg',
          tag: 'task-reminder',
        });
      });
    } else {
      new Notification(title, {
        body,
        icon: '/icon-192.png',
      });
    }
  } catch (err) {
    console.warn('Failed to display notification', err);
  }
}
