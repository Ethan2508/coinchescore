import type { Game } from "./types";

const CURRENT_KEY = "coinchescore:current";
const HISTORY_KEY = "coinchescore:history";
const MAX_HISTORY = 30;

export function loadCurrent(): Game | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CURRENT_KEY);
    return raw ? (JSON.parse(raw) as Game) : null;
  } catch {
    return null;
  }
}

export function saveCurrent(game: Game | null): void {
  if (typeof window === "undefined") return;
  try {
    if (game) window.localStorage.setItem(CURRENT_KEY, JSON.stringify(game));
    else window.localStorage.removeItem(CURRENT_KEY);
  } catch {
    // ignore quota errors
  }
}

export function loadHistory(): Game[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as Game[]) : [];
  } catch {
    return [];
  }
}

export function pushToHistory(game: Game): void {
  if (typeof window === "undefined") return;
  const list = loadHistory();
  list.unshift(game);
  const trimmed = list.slice(0, MAX_HISTORY);
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  } catch {
    // ignore
  }
}

export function clearHistory(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(HISTORY_KEY);
}
