"use client";

import { useCallback, useEffect, useState } from "react";
import { computeScore, detectWinner, totalScores } from "./scoring";
import type { Game, Hand, TeamId } from "./types";

const CURRENT_KEY = "coinchescore:current";
const HISTORY_KEY = "coinchescore:history";
const MAX_HISTORY = 50;

interface Store {
  ready: boolean;
  current: Game | null;
  history: Game[];
}

function loadCurrent(): Game | null {
  try {
    const raw = localStorage.getItem(CURRENT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Game;
  } catch {
    return null;
  }
}

function loadHistory(): Game[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as Game[];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function saveCurrent(game: Game | null) {
  try {
    if (game) localStorage.setItem(CURRENT_KEY, JSON.stringify(game));
    else localStorage.removeItem(CURRENT_KEY);
  } catch {
    // ignore
  }
}

function saveHistory(list: Game[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

function haptic(pattern: number | number[] = 8) {
  if (typeof navigator === "undefined") return;
  try {
    navigator.vibrate?.(pattern);
  } catch {
    // ignore
  }
}

function recomputeWinner(game: Game): Game {
  const totals = totalScores(game.hands);
  const winner = detectWinner(totals.a, totals.b, game.target);
  if (winner && !game.winner) {
    return { ...game, winner, finishedAt: Date.now() };
  }
  if (!winner && game.winner) {
    return { ...game, winner: undefined, finishedAt: undefined };
  }
  return game;
}

export function useStore() {
  const [store, setStore] = useState<Store>({
    ready: false,
    current: null,
    history: [],
  });

  useEffect(() => {
    setStore({
      ready: true,
      current: loadCurrent(),
      history: loadHistory(),
    });
  }, []);

  useEffect(() => {
    if (!store.ready) return;
    saveCurrent(store.current);
  }, [store.current, store.ready]);

  useEffect(() => {
    if (!store.ready) return;
    saveHistory(store.history);
  }, [store.history, store.ready]);

  const startGame = useCallback(
    (opts: { teamA: string; teamB: string; target: number }) => {
      const g: Game = {
        id: crypto.randomUUID(),
        teamA: opts.teamA.trim() || "Nous",
        teamB: opts.teamB.trim() || "Eux",
        target: opts.target,
        hands: [],
        createdAt: Date.now(),
      };
      setStore((s) => ({ ...s, current: g }));
      haptic([15, 40, 15]);
    },
    [],
  );

  const abandonGame = useCallback(() => {
    setStore((s) => ({ ...s, current: null }));
    haptic(12);
  }, []);

  const finishAndArchive = useCallback(() => {
    setStore((s) => {
      if (!s.current) return s;
      const game = recomputeWinner({
        ...s.current,
        finishedAt: s.current.finishedAt ?? Date.now(),
      });
      const history = [game, ...s.history].slice(0, MAX_HISTORY);
      return { ...s, current: null, history };
    });
    haptic([15, 40, 15]);
  }, []);

  const addHand = useCallback((hand: Omit<Hand, "id" | "createdAt">) => {
    setStore((s) => {
      if (!s.current) return s;
      const newHand: Hand = {
        ...hand,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
      };
      const updated = recomputeWinner({
        ...s.current,
        hands: [...s.current.hands, newHand],
      });
      return { ...s, current: updated };
    });
    haptic(10);
  }, []);

  const updateHand = useCallback(
    (id: string, patch: Omit<Hand, "id" | "createdAt">) => {
      setStore((s) => {
        if (!s.current) return s;
        const updated = recomputeWinner({
          ...s.current,
          hands: s.current.hands.map((h) =>
            h.id === id ? { ...h, ...patch } : h,
          ),
        });
        return { ...s, current: updated };
      });
      haptic(8);
    },
    [],
  );

  const deleteHand = useCallback((id: string) => {
    setStore((s) => {
      if (!s.current) return s;
      const updated = recomputeWinner({
        ...s.current,
        hands: s.current.hands.filter((h) => h.id !== id),
      });
      return { ...s, current: updated };
    });
    haptic(8);
  }, []);

  const undoLast = useCallback(() => {
    setStore((s) => {
      if (!s.current || s.current.hands.length === 0) return s;
      const updated = recomputeWinner({
        ...s.current,
        hands: s.current.hands.slice(0, -1),
      });
      return { ...s, current: updated };
    });
    haptic(12);
  }, []);

  const setTeamName = useCallback((team: TeamId, name: string) => {
    setStore((s) => {
      if (!s.current) return s;
      return {
        ...s,
        current:
          team === "A"
            ? { ...s.current, teamA: name }
            : { ...s.current, teamB: name },
      };
    });
  }, []);

  const clearHistory = useCallback(() => {
    setStore((s) => ({ ...s, history: [] }));
  }, []);

  return {
    ready: store.ready,
    current: store.current,
    history: store.history,
    startGame,
    abandonGame,
    finishAndArchive,
    addHand,
    updateHand,
    deleteHand,
    undoLast,
    setTeamName,
    clearHistory,
  };
}

export { computeScore, totalScores };
