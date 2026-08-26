"use client";

import { useEffect, useMemo, useState } from "react";
import HistoryModal from "@/components/HistoryModal";
import RulesModal from "@/components/RulesModal";
import TargetModal from "@/components/TargetModal";
import { computeTotals, detectWinner } from "@/lib/game";
import { useGame } from "@/lib/useGame";

export default function Page() {
  const g = useGame();
  const [menuOpen, setMenuOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [targetOpen, setTargetOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    if (!confirmReset) return;
    const t = setTimeout(() => setConfirmReset(false), 3000);
    return () => clearTimeout(t);
  }, [confirmReset]);

  const totals = useMemo(
    () => (g.state ? computeTotals(g.state.rows) : { a: 0, b: 0 }),
    [g.state],
  );

  if (!g.state) return null;
  const { state } = g;

  const winner = detectWinner(totals.a, totals.b, state.target);
  const hasScores = totals.a > 0 || totals.b > 0;
  const pctA = Math.min(100, (totals.a / state.target) * 100);
  const pctB = Math.min(100, (totals.b / state.target) * 100);

  const handleNewGame = () => {
    if (!hasScores) {
      g.newGame();
      setMenuOpen(false);
      return;
    }
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    g.newGame();
    setConfirmReset(false);
    setMenuOpen(false);
  };

  return (
    <main className="mx-auto max-w-3xl p-4 sm:p-6">
      <header className="mb-3 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          CoincheScore
        </h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={g.undo}
            disabled={!g.canUndo}
            aria-label="Annuler"
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
          >
            ↶ Annuler
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Menu"
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-lg leading-none text-white/80 hover:bg-white/10"
          >
            ⋯
          </button>
        </div>
      </header>

      <button
        type="button"
        onClick={() => setTargetOpen(true)}
        className="mb-4 flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-left transition hover:bg-white/10"
      >
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-white/50">
            Score &agrave; atteindre
          </div>
          <div className="font-display text-lg font-bold tabular-nums">
            {state.target} pts
          </div>
        </div>
        <div className="flex-1 px-4">
          <ProgressBars pctA={pctA} pctB={pctB} winner={winner} />
        </div>
        <div className="text-xs text-white/40">Modifier</div>
      </button>

      {winner && (
        <div className="mb-3 rounded-2xl border border-gold-500 bg-gold-500/15 p-3 text-center">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-gold-400">
            Victoire
          </div>
          <div className="mt-0.5 font-display text-lg font-bold">
            {winner === "A" ? state.teamA : state.teamB} remporte la partie
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur">
        <div className="grid grid-cols-[3rem_1fr_1fr_2.5rem] items-center gap-2 border-b border-white/10 bg-black/20 p-3">
          <div className="text-center text-xs font-semibold uppercase tracking-wider text-white/50">
            #
          </div>
          <input
            type="text"
            value={state.teamA}
            onChange={(e) => g.setTeam("A", e.target.value)}
            onBlur={(e) => {
              if (!e.target.value.trim()) g.setTeam("A", "Nous");
            }}
            placeholder="Équipe A"
            maxLength={20}
            className="min-w-0 rounded-lg border border-white/10 bg-black/20 px-2 py-1.5 text-center font-display text-xl font-bold text-white outline-none placeholder:font-normal placeholder:text-white/30 focus:border-gold-500"
          />
          <input
            type="text"
            value={state.teamB}
            onChange={(e) => g.setTeam("B", e.target.value)}
            onBlur={(e) => {
              if (!e.target.value.trim()) g.setTeam("B", "Eux");
            }}
            placeholder="Équipe B"
            maxLength={20}
            className="min-w-0 rounded-lg border border-white/10 bg-black/20 px-2 py-1.5 text-center font-display text-xl font-bold text-white outline-none placeholder:font-normal placeholder:text-white/30 focus:border-gold-500"
          />
          <div />
        </div>

        <ul>
          {state.rows.map((r, i) => {
            const isEmpty = r.a === "" && r.b === "";
            const isLast = i === state.rows.length - 1;
            return (
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
                  onChange={(e) => g.updateRow(r.id, "a", e.target.value)}
                  onBlur={g.commitRow}
                  placeholder="—"
                  className="w-full rounded-lg border border-white/5 bg-black/20 px-3 py-3 text-center font-display text-2xl tabular-nums text-white outline-none placeholder:text-white/20 focus:border-gold-500"
                />
                <input
                  type="text"
                  inputMode="numeric"
                  value={r.b}
                  onChange={(e) => g.updateRow(r.id, "b", e.target.value)}
                  onBlur={g.commitRow}
                  placeholder="—"
                  className="w-full rounded-lg border border-white/5 bg-black/20 px-3 py-3 text-center font-display text-2xl tabular-nums text-white outline-none placeholder:text-white/20 focus:border-gold-500"
                />
                {isEmpty && isLast ? (
                  <div />
                ) : (
                  <button
                    type="button"
                    onClick={() => g.removeRow(r.id)}
                    aria-label="Supprimer la ligne"
                    className="rounded-full text-white/30 hover:text-white/70"
                  >
                    ✕
                  </button>
                )}
              </li>
            );
          })}
        </ul>

        <div className="grid grid-cols-[3rem_1fr_1fr_2.5rem] items-center gap-2 border-t-2 border-gold-500/50 bg-black/30 p-3">
          <div className="text-center text-xs font-semibold uppercase tracking-wider text-gold-400">
            Σ
          </div>
          <div
            className={`text-center font-display text-4xl font-bold tabular-nums ${
              winner === "A" ? "text-gold-400" : "text-gold-400/90"
            }`}
          >
            {totals.a}
          </div>
          <div
            className={`text-center font-display text-4xl font-bold tabular-nums ${
              winner === "B" ? "text-gold-400" : "text-gold-400/90"
            }`}
          >
            {totals.b}
          </div>
          <div />
        </div>
      </div>

      <MenuModal
        open={menuOpen}
        onClose={() => {
          setMenuOpen(false);
          setConfirmReset(false);
        }}
        onOpenHistory={() => {
          setMenuOpen(false);
          setHistoryOpen(true);
        }}
        onOpenRules={() => {
          setMenuOpen(false);
          setRulesOpen(true);
        }}
        onNewGame={handleNewGame}
        confirmReset={confirmReset}
        hasScores={hasScores}
      />

      <HistoryModal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        history={state.history}
        onClear={g.clearHistory}
      />

      <RulesModal open={rulesOpen} onClose={() => setRulesOpen(false)} />

      <TargetModal
        open={targetOpen}
        onClose={() => setTargetOpen(false)}
        target={state.target}
        onChange={g.setTarget}
      />
    </main>
  );
}

function ProgressBars({
  pctA,
  pctB,
  winner,
}: {
  pctA: number;
  pctB: number;
  winner: "A" | "B" | null;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="h-1.5 overflow-hidden rounded-full bg-black/40">
        <div
          className={`h-full rounded-full transition-all duration-500 ${winner === "A" ? "bg-gold-500" : "bg-white/50"}`}
          style={{ width: `${pctA}%` }}
        />
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-black/40">
        <div
          className={`h-full rounded-full transition-all duration-500 ${winner === "B" ? "bg-gold-500" : "bg-white/50"}`}
          style={{ width: `${pctB}%` }}
        />
      </div>
    </div>
  );
}

interface MenuProps {
  open: boolean;
  onClose: () => void;
  onOpenHistory: () => void;
  onOpenRules: () => void;
  onNewGame: () => void;
  confirmReset: boolean;
  hasScores: boolean;
}

function MenuModal({
  open,
  onClose,
  onOpenHistory,
  onOpenRules,
  onNewGame,
  confirmReset,
  hasScores,
}: MenuProps) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-t-3xl border border-white/10 bg-felt-900 p-4 shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
        style={{
          paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
        }}
      >
        <div className="flex flex-col gap-2">
          <MenuItem icon="📜" label="Historique des parties" onClick={onOpenHistory} />
          <MenuItem icon="🃏" label="Règles coinche / belote" onClick={onOpenRules} />
          <button
            type="button"
            onClick={onNewGame}
            className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
              confirmReset
                ? "border border-red-500 bg-red-500/20 text-red-300"
                : "border border-white/10 bg-white/5 text-white/90 hover:bg-white/10"
            }`}
          >
            <span className="text-lg">🔄</span>
            <span>
              {confirmReset
                ? "Confirmer la nouvelle partie ?"
                : hasScores
                  ? "Nouvelle partie (archive celle-ci)"
                  : "Nouvelle partie"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
}: {
  icon: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-semibold text-white/90 transition hover:bg-white/10"
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
    </button>
  );
}
