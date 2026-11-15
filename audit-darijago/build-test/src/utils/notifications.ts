export type ToastKind = 'achievement' | 'daily-goal';

export interface AppToast {
  id: string;
  kind: ToastKind;
  title: string;
  description: string;
  actionLabel?: string;
  createdAt: number;
}

export const MAX_VISIBLE_TOASTS = 3;

export function enqueueToast(
  existing: AppToast[],
  incoming: Omit<AppToast, 'createdAt'>,
  now: number = Date.now()
): AppToast[] {
  const filtered = existing.filter((t) => t.id !== incoming.id);
  const next: AppToast = { ...incoming, createdAt: now };
  const combined = [...filtered, next];
  if (combined.length <= MAX_VISIBLE_TOASTS) {
    return combined;
  }
  return combined.slice(combined.length - MAX_VISIBLE_TOASTS);
}

export function dismissToast(existing: AppToast[], id: string): AppToast[] {
  return existing.filter((t) => t.id !== id);
}

export type DesktopNotificationPermission = NotificationPermission | 'unsupported';

export function getDesktopNotificationPermission(): DesktopNotificationPermission {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return window.Notification.permission;
}

export async function requestDesktopNotificationPermission(): Promise<DesktopNotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  if (window.Notification.permission !== 'default') {
    return window.Notification.permission;
  }
  try {
    return await window.Notification.requestPermission();
  } catch {
    return window.Notification.permission;
  }
}

export function triggerDesktopNotification(
  title: string,
  body: string,
  tag?: string
): boolean {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  if (window.Notification.permission !== 'granted') {
    return false;
  }
  try {
    new window.Notification(title, { body, tag });
    return true;
  } catch {
    return false;
  }
}
