"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import HandEditor from "@/components/HandEditor";
import HeaderBar from "@/components/HeaderBar";
import { totalScores, useStore } from "@/lib/store";
import { contractLabel } from "@/lib/scoring";
import { SUIT_COLOR, SUIT_SYMBOL, type Hand } from "@/lib/types";

export default function GamePage() {
  const router = useRouter();
  const {
    ready,
    current,
    addHand,
    updateHand,
    deleteHand,
    undoLast,
    finishAndArchive,
    setTeamName,
  } = useStore();

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingHand, setEditingHand] = useState<Hand | undefined>(undefined);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  useEffect(() => {
    if (ready && !current) router.replace("/");
  }, [ready, current, router]);

  useEffect(() => {
    if (!confirmDiscard) return;
    const t = setTimeout(() => setConfirmDiscard(false), 3000);
    return () => clearTimeout(t);
  }, [confirmDiscard]);

  const totals = useMemo(
    () => (current ? totalScores(current.hands) : { a: 0, b: 0 }),
    [current],
  );

  if (!current) return null;

  const pctA = Math.min(100, (totals.a / current.target) * 100);
  const pctB = Math.min(100, (totals.b / current.target) * 100);
  const winner = current.winner;

  const openNewHand = () => {
    setEditingHand(undefined);
    setEditorOpen(true);
  };

  const openEditHand = (hand: Hand) => {
    setEditingHand(hand);
    setEditorOpen(true);
  };

  const handleSubmit = (patch: Omit<Hand, "id" | "createdAt">) => {
    if (editingHand) updateHand(editingHand.id, patch);
    else addHand(patch);
  };

  const handleFinish = () => {
    finishAndArchive();
    router.push("/");
  };

  return (
    <main className="mx-auto min-h-[100dvh] max-w-md p-4 pb-28 sm:p-6">
      <HeaderBar
        title="Partie en cours"
        back="/"
        right={
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Menu"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-lg text-white/80 hover:bg-white/10"
          >
            ⋯
          </button>
        }
      />

      <section className="mb-4 grid grid-cols-2 gap-3">
        <TeamCard
          name={current.teamA}
          score={totals.a}
          target={current.target}
          pct={pctA}
          winner={winner === "A"}
          leading={totals.a >= totals.b && (totals.a > 0 || totals.b > 0)}
          editable
          onNameChange={(v) => setTeamName("A", v.trim() || "Nous")}
        />
        <TeamCard
          name={current.teamB}
          score={totals.b}
          target={current.target}
          pct={pctB}
          winner={winner === "B"}
          leading={totals.b > totals.a}
          editable
          onNameChange={(v) => setTeamName("B", v.trim() || "Eux")}
        />
      </section>

      {winner && (
        <div className="mb-4 rounded-2xl border border-gold-500 bg-gold-500/15 p-4 text-center">
          <div className="text-xs uppercase tracking-wider text-gold-400">
            Victoire à {current.target} pts
          </div>
          <div className="mt-1 font-display text-xl font-bold">
            {winner === "A" ? current.teamA : current.teamB} remporte
          </div>
          <button
            type="button"
            onClick={handleFinish}
            className="mt-3 rounded-xl bg-gold-500 px-4 py-2 text-sm font-bold text-felt-950 hover:bg-gold-400"
          >
            Terminer et archiver
          </button>
        </div>
      )}

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-white/60">
            Manches ({current.hands.length})
          </h2>
          {current.hands.length > 0 && (
            <button
              type="button"
              onClick={undoLast}
              className="text-xs font-semibold text-white/60 hover:text-white"
            >
              ↶ Annuler la dernière
            </button>
          )}
        </div>

        {current.hands.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-8 text-center text-sm text-white/50">
            Aucune manche pour l&apos;instant. Ajoute la première ci-dessous.
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {[...current.hands].reverse().map((h) => {
              const index = current.hands.findIndex((x) => x.id === h.id) + 1;
              return (
                <HandRow
                  key={h.id}
                  hand={h}
                  index={index}
                  teamA={current.teamA}
                  teamB={current.teamB}
                  onEdit={() => openEditHand(h)}
                  onDelete={() => deleteHand(h.id)}
                />
              );
            })}
          </ul>
        )}
      </section>

      <div
        className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-felt-950/95 backdrop-blur"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto max-w-md p-3">
          <button
            type="button"
            onClick={openNewHand}
            disabled={!!winner}
            className="w-full rounded-2xl bg-gold-500 px-6 py-4 text-base font-bold text-felt-950 shadow-lg shadow-black/30 transition hover:bg-gold-400 active:scale-95 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40 disabled:shadow-none"
          >
            + Ajouter une manche
          </button>
        </div>
      </div>

      <HandEditor
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        teamA={current.teamA}
        teamB={current.teamB}
        handIndex={
          editingHand
            ? current.hands.findIndex((h) => h.id === editingHand.id) + 1
            : current.hands.length + 1
        }
        initial={editingHand}
        onSubmit={handleSubmit}
      />

      {menuOpen && (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center"
          onClick={() => {
            setMenuOpen(false);
            setConfirmDiscard(false);
          }}
        >
          <div
            className="w-full max-w-sm rounded-t-3xl border border-white/10 bg-felt-900 p-4 shadow-2xl sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
            style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
          >
            <div className="flex flex-col gap-2">
              <Link
                href="/rules"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/10"
              >
                🃏 Règles
              </Link>
              <button
                type="button"
                onClick={() => {
                  finishAndArchive();
                  router.push("/");
                }}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-semibold text-white/90 hover:bg-white/10"
              >
                📥 Terminer et archiver
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!confirmDiscard) {
                    setConfirmDiscard(true);
                    return;
                  }
                  router.push("/");
                  setMenuOpen(false);
                  setConfirmDiscard(false);
                }}
                className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                  confirmDiscard
                    ? "border-red-500 bg-red-500/20 text-red-300"
                    : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                }`}
              >
                {confirmDiscard
                  ? "⚠️ Confirmer (partie non archivée)"
                  : "🗑️ Abandonner la partie"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function TeamCard({
  name,
  score,
  target,
  pct,
  winner,
  leading,
  editable,
  onNameChange,
}: {
  name: string;
  score: number;
  target: number;
  pct: number;
  winner: boolean;
  leading: boolean;
  editable?: boolean;
  onNameChange?: (v: string) => void;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-4 backdrop-blur transition ${
        winner
          ? "border-gold-500 bg-gold-500/15"
          : leading
            ? "border-white/20 bg-white/10"
            : "border-white/10 bg-white/5"
      }`}
    >
      {editable ? (
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange?.(e.target.value)}
          onBlur={(e) => onNameChange?.(e.target.value.trim() || name)}
          maxLength={20}
          className="w-full bg-transparent text-xs uppercase tracking-wider text-white/70 outline-none focus:text-white"
        />
      ) : (
        <div className="text-xs uppercase tracking-wider text-white/70">
          {name}
        </div>
      )}
      <div className="mt-1 flex items-baseline gap-1.5">
        <span className="font-display text-4xl font-bold tabular-nums text-white">
          {score}
        </span>
        <span className="text-xs text-white/50">/ {target}</span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/40">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            winner ? "bg-gold-500" : "bg-white/60"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function HandRow({
  hand,
  index,
  teamA,
  teamB,
  onEdit,
  onDelete,
}: {
  hand: Hand;
  index: number;
  teamA: string;
  teamB: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <li className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
      <button
        type="button"
        onClick={onEdit}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/30 text-xs font-bold text-white/70 hover:bg-black/50"
        aria-label="Modifier"
      >
        {index}
      </button>
      <button
        type="button"
        onClick={onEdit}
        className="min-w-0 flex-1 text-left"
      >
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-white/70">
          <span className={`text-lg leading-none ${SUIT_COLOR[hand.suit]}`}>
            {SUIT_SYMBOL[hand.suit]}
          </span>
          <span className="font-semibold">
            {hand.taker === "A" ? teamA : teamB}
          </span>
          <span>·</span>
          <span>{contractLabel(hand.contract)}</span>
          {hand.coinche !== "none" && (
            <span className="rounded bg-red-500/20 px-1.5 font-semibold text-red-300">
              {hand.coinche === "surcoinche" ? "×4" : "×2"}
            </span>
          )}
          {hand.chute && (
            <span className="rounded bg-red-500/20 px-1.5 font-semibold text-red-300">
              Chute
            </span>
          )}
          {hand.capot && !hand.chute && (
            <span className="rounded bg-gold-500/20 px-1.5 font-semibold text-gold-400">
              Capot
            </span>
          )}
          {hand.belote !== "none" && (
            <span className="rounded bg-blue-500/20 px-1.5 font-semibold text-blue-300">
              Belote
            </span>
          )}
        </div>
        <div className="mt-1 flex gap-3 text-sm font-semibold">
          <span className="text-white">
            {teamA} <span className="text-gold-400">+{hand.scoreA}</span>
          </span>
          <span className="text-white/30">|</span>
          <span className="text-white">
            {teamB} <span className="text-gold-400">+{hand.scoreB}</span>
          </span>
        </div>
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label="Supprimer"
        className="rounded-full text-white/30 hover:text-white/70"
      >
        ✕
      </button>
    </li>
  );
}
