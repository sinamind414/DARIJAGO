// Lecteur de sons d'interface CC0 (Openverse) pour darijaGO.
// Les sons sont servis statiquement depuis /assets/sfx/ — aucune API a l'usage.

export type SfxId =
  | 'ui_click'
  | 'ui_success'
  | 'ui_correct'
  | 'ui_wrong'
  | 'ui_notification'
  | 'amb_souk'
  | 'amb_cafe'
  | 'amb_tea';

const CHEMINS: Record<SfxId, string> = {
  ui_click: '/assets/sfx/ui_click.mp3',
  ui_success: '/assets/sfx/ui_success.mp3',
  ui_correct: '/assets/sfx/ui_correct.mp3',
  ui_wrong: '/assets/sfx/ui_wrong.mp3',
  ui_notification: '/assets/sfx/ui_notification.mp3',
  amb_souk: '/assets/sfx/amb_souk.mp3',
  amb_cafe: '/assets/sfx/amb_cafe.mp3',
  amb_tea: '/assets/sfx/amb_tea.mp3',
};

let volume = 0.35;
let actif = true;

export function setSfxEnabled(on: boolean): void {
  actif = on;
}
export function isSfxEnabled(): boolean {
  return actif;
}
export function setSfxVolume(v: number): void {
  volume = Math.max(0, Math.min(1, v));
}

/** Joue un son d'interface. Silencieux si desactive. */
export function playSfx(id: SfxId, vol?: number): void {
  if (!actif || typeof Audio === 'undefined') return;
  try {
    const a = new Audio(CHEMINS[id]);
    a.volume = vol ?? volume;
    void a.play().catch(() => {});
  } catch {
    // audio non disponible : on ignore
  }
}

/** Raccourcis semantiques. */
export const sfx = {
  click: () => playSfx('ui_click', 0.25),
  correct: () => playSfx('ui_correct', 0.4),
  wrong: () => playSfx('ui_wrong', 0.4),
  success: () => playSfx('ui_success', 0.4),
  notification: () => playSfx('ui_notification', 0.35),
};
