"use client";

import { useState } from "react";
import type { Game, Variant } from "@/lib/types";

interface Props {
  onCreate: (game: Game) => void;
  defaults?: { teamA: string; teamB: string };
}

const PRESETS = [500, 1000, 1500, 2000, 3000];

export default function GameSetup({ onCreate, defaults }: Props) {
  const [variant, setVariant] = useState<Variant>("coinche");
  const [teamA, setTeamA] = useState(defaults?.teamA ?? "Nous");
  const [teamB, setTeamB] = useState(defaults?.teamB ?? "Eux");
  const [target, setTarget] = useState(1000);

  const handleSubmit = () => {
    const game: Game = {
      id: crypto.randomUUID(),
      variant,
      teamA: teamA.trim() || "Nous",
      teamB: teamB.trim() || "Eux",
      target,
      hands: [],
      createdAt: Date.now(),
    };
    onCreate(game);
  };

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 p-6">
      <header className="text-center">
        <h1 className="font-display text-4xl font-bold tracking-tight text-white">
          CoincheScore
        </h1>
        <p className="mt-2 text-sm text-white/70">
          Compteur gratuit, sans pub, sans compte.
        </p>
      </header>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/60">
          Variante
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {(["coinche", "belote"] as Variant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={`rounded-xl border px-4 py-3 text-sm font-semibold capitalize transition ${
                variant === v
                  ? "border-gold-500 bg-gold-500 text-felt-950"
                  : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/60">
          Équipes
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-xs text-white/60">
            Équipe A
            <input
              type="text"
              value={teamA}
              onChange={(e) => setTeamA(e.target.value)}
              maxLength={20}
              className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-base text-white outline-none focus:border-gold-500"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-white/60">
            Équipe B
            <input
              type="text"
              value={teamB}
              onChange={(e) => setTeamB(e.target.value)}
              maxLength={20}
              className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-base text-white outline-none focus:border-gold-500"
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/60">
          Score à atteindre
        </h2>
        <div className="mb-3 flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setTarget(p)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                target === p
                  ? "border-gold-500 bg-gold-500 text-felt-950"
                  : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <input
          type="number"
          value={target}
          min={100}
          max={10000}
          step={100}
          onChange={(e) => setTarget(Number(e.target.value) || 1000)}
          className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-base text-white outline-none focus:border-gold-500"
        />
      </section>

      <button
        type="button"
        onClick={handleSubmit}
        className="rounded-2xl bg-gold-500 px-6 py-4 text-base font-bold text-felt-950 shadow-lg shadow-black/30 transition hover:bg-gold-400 active:scale-95"
      >
        Démarrer la partie
      </button>
    </div>
  );
}
