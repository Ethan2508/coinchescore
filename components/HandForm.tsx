"use client";

import { useState } from "react";
import type { Game, Hand, Suit, TeamId, Variant } from "@/lib/types";
import { SUIT_LABEL } from "@/lib/types";
import {
  COINCHE_CONTRACTS,
  HAND_TOTAL,
  computeHand,
} from "@/lib/scoring";

interface Props {
  game: Game;
  onSubmit: (hand: Hand) => void;
  onCancel: () => void;
}

const SUITS: Suit[] = [
  "pique",
  "coeur",
  "carreau",
  "trefle",
  "sans-atout",
  "tout-atout",
];

export default function HandForm({ game, onSubmit, onCancel }: Props) {
  const [taker, setTaker] = useState<TeamId>("A");
  const [suit, setSuit] = useState<Suit>("pique");
  const [contract, setContract] = useState<number>(80);
  const [takerPoints, setTakerPoints] = useState<number>(82);
  const [belote, setBelote] = useState<"none" | TeamId>("none");
  const [coinche, setCoinche] = useState<"none" | "coinche" | "surcoinche">(
    "none",
  );

  const variant: Variant = game.variant;
  const isCapotContract = variant === "coinche" && contract === 250;

  const preview = computeHand({
    variant,
    taker,
    takerPoints: isCapotContract ? HAND_TOTAL : takerPoints,
    belote,
    contract,
    coinche,
  });

  const submit = () => {
    const hand: Hand = {
      id: crypto.randomUUID(),
      index: game.hands.length + 1,
      variant,
      taker,
      suit,
      contract: variant === "coinche" ? contract : undefined,
      takerPoints: isCapotContract ? HAND_TOTAL : takerPoints,
      belote,
      coinche: variant === "coinche" ? coinche : "none",
      capot: preview.capot,
      scoreA: preview.scoreA,
      scoreB: preview.scoreB,
      chute: preview.chute,
      createdAt: Date.now(),
    };
    onSubmit(hand);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center">
      <div className="max-h-[95vh] w-full max-w-md overflow-y-auto rounded-t-3xl border border-white/10 bg-felt-900 p-5 shadow-2xl sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold">
            Manche {game.hands.length + 1}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/70 hover:bg-white/10"
          >
            Fermer
          </button>
        </div>

        <Section label="Preneur">
          <div className="grid grid-cols-2 gap-2">
            {(["A", "B"] as TeamId[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTaker(t)}
                className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                  taker === t
                    ? "border-gold-500 bg-gold-500 text-felt-950"
                    : "border-white/10 bg-white/5 text-white/80"
                }`}
              >
                {t === "A" ? game.teamA : game.teamB}
              </button>
            ))}
          </div>
        </Section>

        <Section label="Couleur">
          <div className="grid grid-cols-3 gap-2">
            {SUITS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSuit(s)}
                className={`rounded-lg border px-2 py-2 text-xs font-semibold transition ${
                  suit === s
                    ? "border-gold-500 bg-gold-500 text-felt-950"
                    : "border-white/10 bg-white/5 text-white/80"
                }`}
              >
                {SUIT_LABEL[s]}
              </button>
            ))}
          </div>
        </Section>

        {variant === "coinche" && (
          <Section label="Contrat">
            <div className="grid grid-cols-5 gap-1.5">
              {COINCHE_CONTRACTS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setContract(c)}
                  className={`rounded-md border py-2 text-sm font-semibold transition ${
                    contract === c
                      ? "border-gold-500 bg-gold-500 text-felt-950"
                      : "border-white/10 bg-white/5 text-white/80"
                  }`}
                >
                  {c === 250 ? "Cap" : c}
                </button>
              ))}
            </div>
          </Section>
        )}

        {!isCapotContract && (
          <Section
            label={`Points du preneur : ${takerPoints} / ${HAND_TOTAL}`}
          >
            <input
              type="range"
              min={0}
              max={HAND_TOTAL}
              step={1}
              value={takerPoints}
              onChange={(e) => setTakerPoints(Number(e.target.value))}
              className="w-full"
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[0, 50, 82, 90, 100, 120, 140, 162].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setTakerPoints(v)}
                  className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-white/70 hover:bg-white/10"
                >
                  {v}
                </button>
              ))}
            </div>
          </Section>
        )}

        <Section label="Belote / rebelote">
          <div className="grid grid-cols-3 gap-2">
            {(["none", "A", "B"] as const).map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setBelote(b)}
                className={`rounded-lg border px-2 py-2 text-xs font-semibold transition ${
                  belote === b
                    ? "border-gold-500 bg-gold-500 text-felt-950"
                    : "border-white/10 bg-white/5 text-white/80"
                }`}
              >
                {b === "none"
                  ? "Aucune"
                  : b === "A"
                    ? game.teamA
                    : game.teamB}
              </button>
            ))}
          </div>
        </Section>

        {variant === "coinche" && (
          <Section label="Coinche">
            <div className="grid grid-cols-3 gap-2">
              {(["none", "coinche", "surcoinche"] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCoinche(c)}
                  className={`rounded-lg border px-2 py-2 text-xs font-semibold capitalize transition ${
                    coinche === c
                      ? "border-gold-500 bg-gold-500 text-felt-950"
                      : "border-white/10 bg-white/5 text-white/80"
                  }`}
                >
                  {c === "none" ? "Aucune" : c}
                </button>
              ))}
            </div>
          </Section>
        )}

        <div className="my-4 rounded-2xl border border-white/10 bg-black/30 p-4">
          <div className="mb-2 text-xs uppercase tracking-wider text-white/50">
            Aperçu
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-white/60">{game.teamA}</div>
              <div className="font-display text-3xl font-bold text-white">
                +{preview.scoreA}
              </div>
            </div>
            <div className="text-center">
              {preview.chute && (
                <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-semibold text-red-300">
                  Chute
                </span>
              )}
              {preview.capot && !preview.chute && (
                <span className="rounded-full bg-gold-500/20 px-2 py-0.5 text-xs font-semibold text-gold-400">
                  Capot
                </span>
              )}
            </div>
            <div className="text-right">
              <div className="text-xs text-white/60">{game.teamB}</div>
              <div className="font-display text-3xl font-bold text-white">
                +{preview.scoreB}
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={submit}
          className="w-full rounded-2xl bg-gold-500 px-6 py-4 text-base font-bold text-felt-950 shadow-lg shadow-black/30 transition hover:bg-gold-400 active:scale-95"
        >
          Valider la manche
        </button>
      </div>
    </div>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/60">
        {label}
      </div>
      {children}
    </div>
  );
}
