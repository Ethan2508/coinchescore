"use client";

import { useEffect, useState } from "react";

interface Row {
  id: string;
  a: string;
  b: string;
}

interface State {
  teamA: string;
  teamB: string;
  rows: Row[];
}

const STORAGE_KEY = "coinchescore:v2";

function emptyRow(): Row {
  return { id: crypto.randomUUID(), a: "", b: "" };
}

function initial(): State {
  return {
    teamA: "Nous",
    teamB: "Eux",
    rows: [emptyRow(), emptyRow(), emptyRow()],
  };
}

export default function Page() {
  const [state, setState] = useState<State | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setState(raw ? (JSON.parse(raw) as State) : initial());
    } catch {
      setState(initial());
    }
  }, []);

  useEffect(() => {
    if (!state) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [state]);

  if (!state) return null;

  const totalA = state.rows.reduce((s, r) => s + (parseInt(r.a) || 0), 0);
  const totalB = state.rows.reduce((s, r) => s + (parseInt(r.b) || 0), 0);

  const updateRow = (id: string, key: "a" | "b", value: string) => {
    const cleaned = value.replace(/[^\d-]/g, "");
    setState((s) =>
      s
        ? {
            ...s,
            rows: s.rows.map((r) =>
              r.id === id ? { ...r, [key]: cleaned } : r,
            ),
          }
        : s,
    );
  };

  const addRow = () =>
    setState((s) => (s ? { ...s, rows: [...s.rows, emptyRow()] } : s));

  const removeRow = (id: string) =>
    setState((s) =>
      s ? { ...s, rows: s.rows.filter((r) => r.id !== id) } : s,
    );

  const reset = () => {
    if (
      state.rows.some((r) => r.a || r.b) &&
      !confirm("Effacer tous les scores ?")
    )
      return;
    setState((s) =>
      s ? { ...s, rows: [emptyRow(), emptyRow(), emptyRow()] } : s,
    );
  };

  const resetAll = () => {
    if (!confirm("Tout réinitialiser (noms + scores) ?")) return;
    setState(initial());
  };

  return (
    <main className="mx-auto max-w-3xl p-4 sm:p-6">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          CoincheScore
        </h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={reset}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 hover:bg-white/10"
          >
            Nouvelle partie
          </button>
          <button
            type="button"
            onClick={resetAll}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/60 hover:bg-white/10"
          >
            Reset total
          </button>
        </div>
      </header>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur">
        <div className="grid grid-cols-[3rem_1fr_1fr_2.5rem] items-center gap-2 border-b border-white/10 bg-black/20 p-3">
          <div className="text-center text-xs font-semibold uppercase tracking-wider text-white/50">
            #
          </div>
          <input
            type="text"
            value={state.teamA}
            onChange={(e) =>
              setState((s) => (s ? { ...s, teamA: e.target.value } : s))
            }
            maxLength={20}
            className="rounded-lg bg-transparent px-2 py-1 text-center font-display text-xl font-bold text-white outline-none focus:bg-black/30"
          />
          <input
            type="text"
            value={state.teamB}
            onChange={(e) =>
              setState((s) => (s ? { ...s, teamB: e.target.value } : s))
            }
            maxLength={20}
            className="rounded-lg bg-transparent px-2 py-1 text-center font-display text-xl font-bold text-white outline-none focus:bg-black/30"
          />
          <div />
        </div>

        <ul>
          {state.rows.map((r, i) => (
            <li
              key={r.id}
              className="grid grid-cols-[3rem_1fr_1fr_2.5rem] items-center gap-2 border-b border-white/5 p-2 last:border-b-0"
            >
              <div className="text-center text-sm font-semibold tabular-nums text-white/40">
                {i + 1}
              </div>
              <input
                type="text"
                inputMode="numeric"
                value={r.a}
                onChange={(e) => updateRow(r.id, "a", e.target.value)}
                placeholder="—"
                className="w-full rounded-lg border border-white/5 bg-black/20 px-3 py-3 text-center font-display text-2xl tabular-nums text-white outline-none placeholder:text-white/20 focus:border-gold-500"
              />
              <input
                type="text"
                inputMode="numeric"
                value={r.b}
                onChange={(e) => updateRow(r.id, "b", e.target.value)}
                placeholder="—"
                className="w-full rounded-lg border border-white/5 bg-black/20 px-3 py-3 text-center font-display text-2xl tabular-nums text-white outline-none placeholder:text-white/20 focus:border-gold-500"
              />
              <button
                type="button"
                onClick={() => removeRow(r.id)}
                aria-label="Supprimer la ligne"
                className="rounded-full text-white/30 hover:text-white/70"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>

        <div className="grid grid-cols-[3rem_1fr_1fr_2.5rem] items-center gap-2 border-t-2 border-gold-500/50 bg-black/30 p-3">
          <div className="text-center text-xs font-semibold uppercase tracking-wider text-gold-400">
            Σ
          </div>
          <div className="text-center font-display text-4xl font-bold tabular-nums text-gold-400">
            {totalA}
          </div>
          <div className="text-center font-display text-4xl font-bold tabular-nums text-gold-400">
            {totalB}
          </div>
          <div />
        </div>
      </div>

      <button
        type="button"
        onClick={addRow}
        className="mt-4 w-full rounded-2xl border-2 border-dashed border-white/15 bg-white/5 px-4 py-4 text-base font-semibold text-white/70 transition hover:border-gold-500 hover:bg-white/10 hover:text-white active:scale-[0.99]"
      >
        + Ajouter une manche
      </button>

      <p className="mt-6 text-center text-xs text-white/40">
        Les scores sont sauvegardés automatiquement sur cet appareil.
      </p>
    </main>
  );
}
