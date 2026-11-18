// Ecriture principale choisie globalement (recommandation R1 de l'audit OPUS).
// Une seule ecriture affichee en grand ; les autres restent accessibles au toucher.
export type ScriptMode = 'arabic' | 'arabizi' | 'latin';

export const SCRIPT_MODE_STORAGE_KEY = 'darijago_script_mode_v1';

export const SCRIPT_MODES: Array<{
  id: ScriptMode;
  label: string;
  short: string;
  sample: string;
}> = [
  { id: 'arabic', label: 'Arabe', short: 'ع', sample: 'السلام عليكم' },
  { id: 'arabizi', label: 'Arabizi', short: '3', sample: 'Salam 3likoum' },
  { id: 'latin', label: 'Latin', short: 'A', sample: 'Salam alikum' },
];

export function parseScriptMode(raw: string | null | undefined): ScriptMode {
  return raw === 'arabic' || raw === 'arabizi' || raw === 'latin' ? raw : 'arabizi';
}

export function getStoredScriptMode(): ScriptMode {
  if (typeof window === 'undefined') return 'arabizi';
  try {
    return parseScriptMode(window.localStorage.getItem(SCRIPT_MODE_STORAGE_KEY));
  } catch {
    return 'arabizi';
  }
}

export function storeScriptMode(mode: ScriptMode): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(SCRIPT_MODE_STORAGE_KEY, mode);
  } catch {
    // ignore storage quota
  }
}

/** Retourne la valeur a afficher en fonction du mode choisi. */
export function pickScript(
  mode: ScriptMode,
  arabic: string,
  arabizi: string,
  latin: string
): string {
  if (mode === 'arabic') return arabic || arabizi || latin;
  if (mode === 'latin') return latin || arabizi || arabic;
  return arabizi || latin || arabic;
}
