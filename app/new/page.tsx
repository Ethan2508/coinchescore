"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import HeaderBar from "@/components/HeaderBar";
import { makePlayers } from "@/lib/players";
import { useStore } from "@/lib/store";

const PRESETS = [500, 1000, 1500, 2000, 3000];
const SEAT_POSITIONS = [
  { label: "Nord", grid: "col-start-2 row-start-1" },
  { label: "Est", grid: "col-start-3 row-start-2" },
  { label: "Sud", grid: "col-start-2 row-start-3" },
  { label: "Ouest", grid: "col-start-1 row-start-2" },
] as const;

export default function NewGamePage() {
  const router = useRouter();
  const { startGame, current, finishAndArchive } = useStore();

  const [teamA, setTeamA] = useState("Nous");
  const [teamB, setTeamB] = useState("Eux");
  const [teamsCustomized, setTeamsCustomized] = useState(false);
  const [target, setTarget] = useState(1000);
  const [showPlayers, setShowPlayers] = useState(false);
  const [playerNames, setPlayerNames] = useState<string[]>([
    "",
    "",
    "",
    "",
  ]);

  const setPlayerName = (i: number, value: string) => {
    setPlayerNames((names) => {
      const next = [...names];
      next[i] = value;
      if (!teamsCustomized && next.every((n) => n.trim())) {
        setTeamA(`${next[0].trim()} & ${next[2].trim()}`);
        setTeamB(`${next[1].trim()} & ${next[3].trim()}`);
      }
      return next;
    });
  };

  const filledPlayers = playerNames.filter((n) => n.trim()).length;

  const submit = () => {
    if (current && current.hands.length > 0) {
      finishAndArchive();
    }
    const players =
      filledPlayers === 4
        ? makePlayers(playerNames as [string, string, string, string])
        : undefined;
    startGame({ teamA, teamB, target, players });
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
              onChange={(e) => {
                setTeamA(e.target.value);
                setTeamsCustomized(true);
              }}
              maxLength={20}
              className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-base text-white outline-none focus:border-gold-500"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-white/60">
            Équipe B
            <input
              type="text"
              value={teamB}
              onChange={(e) => {
                setTeamB(e.target.value);
                setTeamsCustomized(true);
              }}
              maxLength={20}
              className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-base text-white outline-none focus:border-gold-500"
            />
          </label>
        </div>
      </section>

      <section className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-5">
        <button
          type="button"
          onClick={() => setShowPlayers((s) => !s)}
          className="flex w-full items-center justify-between"
        >
          <h2 className="text-xs font-semibold uppercase tracking-wider text-white/60">
            Joueurs (optionnel)
          </h2>
          <span className="text-xs text-white/40">
            {showPlayers ? "Masquer" : filledPlayers > 0 ? `${filledPlayers}/4` : "Ajouter"}
          </span>
        </button>

        {showPlayers && (
          <div className="mt-4">
            <p className="mb-3 text-xs text-white/50">
              Places autour de la table, dans le sens des aiguilles d&apos;une
              montre. Nord/Sud et Est/Ouest forment chacun une équipe.
            </p>
            <div className="grid grid-cols-3 grid-rows-3 gap-2">
              {SEAT_POSITIONS.map((pos, i) => (
                <div key={pos.label} className={pos.grid}>
                  <label className="flex flex-col gap-1 text-[10px] text-white/50">
                    {pos.label}
                    <input
                      type="text"
                      value={playerNames[i]}
                      onChange={(e) => setPlayerName(i, e.target.value)}
                      maxLength={16}
                      placeholder={`Joueur ${i + 1}`}
                      className="rounded-lg border border-white/10 bg-black/20 px-2 py-1.5 text-center text-sm text-white outline-none placeholder:text-white/20 focus:border-gold-500"
                    />
                  </label>
                </div>
              ))}
            </div>
            {filledPlayers > 0 && filledPlayers < 4 && (
              <p className="mt-3 text-xs text-yellow-300/80">
                Remplis les 4 places pour activer la roue du donneur et le
                suivi individuel.
              </p>
            )}
          </div>
        )}
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
