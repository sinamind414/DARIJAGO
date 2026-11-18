// Vitesse de lecture globale reglable par l'apprenant (recommandation R7 / audits).
// 0,7 = 30 % plus lent (defaut actuel), 0,85, 1 = vitesse naturelle.
export type PlaybackSpeed = 0.7 | 0.85 | 1;

export const SPEED_STORAGE_KEY = 'darijago_playback_speed_v1';
export const DEFAULT_SPEED: PlaybackSpeed = 0.7;

export const SPEED_OPTIONS: Array<{ value: PlaybackSpeed; label: string }> = [
  { value: 0.7, label: 'Lent' },
  { value: 0.85, label: 'Normal' },
  { value: 1, label: 'Rapide' },
];

export function parseSpeed(raw: string | null | undefined): PlaybackSpeed {
  const n = Number(raw);
  return n === 0.85 || n === 1 ? n : DEFAULT_SPEED;
}

export function getStoredSpeed(): PlaybackSpeed {
  if (typeof window === 'undefined') return DEFAULT_SPEED;
  try {
    return parseSpeed(window.localStorage.getItem(SPEED_STORAGE_KEY));
  } catch {
    return DEFAULT_SPEED;
  }
}

export function storeSpeed(speed: PlaybackSpeed): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(SPEED_STORAGE_KEY, String(speed));
  } catch {
    // ignore
  }
}
