"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import HeaderBar from "@/components/HeaderBar";
import { useStore } from "@/lib/store";

const PRESETS = [500, 1000, 1500, 2000, 3000];

export default function NewGamePage() {
  const router = useRouter();
  const { startGame, current, finishAndArchive } = useStore();

  const [teamA, setTeamA] = useState("Nous");
  const [teamB, setTeamB] = useState("Eux");
  const [target, setTarget] = useState(1000);

  const submit = () => {
    if (current && current.hands.length > 0) {
      finishAndArchive();
    }
    startGame({ teamA, teamB, target });
    router.push("/game");
  };

  return (
    <main className="mx-auto min-h-[100dvh] max-w-md p-4 sm:p-6">
      <HeaderBar title="Nouvelle partie" back="/" />

      <section className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-5">
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

      <section className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-5">
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
          inputMode="numeric"
          value={target}
          min={100}
          max={9999}
          step={100}
          onChange={(e) => setTarget(Number(e.target.value) || 1000)}
          className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-base text-white outline-none focus:border-gold-500"
        />
      </section>

      {current && current.hands.length > 0 && (
        <div className="mb-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3 text-xs text-yellow-200">
          Une partie est en cours ({current.teamA} vs {current.teamB},{" "}
          {current.hands.length} manche{current.hands.length > 1 ? "s" : ""}).
          Elle sera archivée dans l&apos;historique.
        </div>
      )}

      <button
        type="button"
        onClick={submit}
        className="w-full rounded-2xl bg-gold-500 px-6 py-4 text-base font-bold text-felt-950 shadow-lg shadow-black/30 transition hover:bg-gold-400 active:scale-95"
      >
        Démarrer la partie
      </button>
    </main>
  );
}
