"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  computeTotals,
  detectWinner,
  emptyRow,
  ensureTrailingEmpty,
  initialState,
  type GameState,
  type PastGame,
  type Row,
} from "./game";

const STORAGE_KEY = "coinchescore:v3";
const MAX_HISTORY = 50;
const MAX_UNDO = 20;

interface Serialized {
  teamA?: string;
  teamB?: string;
  target?: number;
  rows?: Row[];
  startedAt?: number;
  history?: PastGame[];
}

function load(): GameState {
  if (typeof window === "undefined") return initialState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState();
    const parsed = JSON.parse(raw) as Serialized;
    return {
      teamA: parsed.teamA?.trim() || "Nous",
      teamB: parsed.teamB?.trim() || "Eux",
      target: parsed.target && parsed.target > 0 ? parsed.target : 1000,
      rows: ensureTrailingEmpty(parsed.rows ?? []),
      startedAt: parsed.startedAt ?? Date.now(),
      history: Array.isArray(parsed.history) ? parsed.history : [],
    };
  } catch {
    return initialState();
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

export function useGame() {
  const [state, setState] = useState<GameState | null>(null);
  const undoStack = useRef<GameState[]>([]);

  useEffect(() => {
    setState(load());
  }, []);

  useEffect(() => {
    if (!state) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore quota
    }
  }, [state]);

  const pushUndo = useCallback((snapshot: GameState) => {
    undoStack.current = [...undoStack.current.slice(-(MAX_UNDO - 1)), snapshot];
  }, []);

  const canUndo = undoStack.current.length > 0;

  const updateRow = useCallback(
    (id: string, key: "a" | "b", raw: string) => {
      const cleaned = raw.replace(/[^\d-]/g, "");
      setState((s) => {
        if (!s) return s;
        pushUndo(s);
        const rows = s.rows.map((r) =>
          r.id === id ? { ...r, [key]: cleaned } : r,
        );
        return { ...s, rows: ensureTrailingEmpty(rows) };
      });
    },
    [pushUndo],
  );

  const commitRow = useCallback(() => {
    haptic(6);
  }, []);

  const removeRow = useCallback(
    (id: string) => {
      setState((s) => {
        if (!s) return s;
        pushUndo(s);
        const rows = s.rows.filter((r) => r.id !== id);
        return { ...s, rows: ensureTrailingEmpty(rows) };
      });
      haptic(8);
    },
    [pushUndo],
  );

  const undo = useCallback(() => {
    if (undoStack.current.length === 0) return;
    const last = undoStack.current[undoStack.current.length - 1];
    undoStack.current = undoStack.current.slice(0, -1);
    setState(last);
    haptic(12);
  }, []);

  const setTeam = useCallback(
    (team: "A" | "B", name: string) => {
      setState((s) => {
        if (!s) return s;
        return team === "A" ? { ...s, teamA: name } : { ...s, teamB: name };
      });
    },
    [],
  );

  const setTarget = useCallback((target: number) => {
    setState((s) => (s ? { ...s, target } : s));
  }, []);

  const newGame = useCallback(() => {
    setState((s) => {
      if (!s) return s;
      const totals = computeTotals(s.rows);
      const hasScores = totals.a > 0 || totals.b > 0;
      let history = s.history;
      if (hasScores) {
        const filledRows = s.rows.filter((r) => r.a || r.b);
        const winner = detectWinner(totals.a, totals.b, s.target);
        const past: PastGame = {
          id: crypto.randomUUID(),
          teamA: s.teamA,
          teamB: s.teamB,
          target: s.target,
          rows: filledRows,
          createdAt: s.startedAt,
          finishedAt: Date.now(),
          totalA: totals.a,
          totalB: totals.b,
          winner,
        };
        history = [past, ...s.history].slice(0, MAX_HISTORY);
      }
      undoStack.current = [];
      return {
        ...s,
        rows: [emptyRow()],
        startedAt: Date.now(),
        history,
      };
    });
    haptic([15, 40, 15]);
  }, []);

  const clearHistory = useCallback(() => {
    setState((s) => (s ? { ...s, history: [] } : s));
  }, []);

  return {
    state,
    canUndo,
    updateRow,
    commitRow,
    removeRow,
    undo,
    setTeam,
    setTarget,
    newGame,
    clearHistory,
  };
}
