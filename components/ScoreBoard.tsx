"use client";

import type { Game, TeamId } from "@/lib/types";
import { totals } from "@/lib/scoring";

interface Props {
  game: Game;
  winner?: TeamId;
}

export default function ScoreBoard({ game, winner }: Props) {
  const t = totals(game.hands);
  const pctA = Math.min(100, (t.A / game.target) * 100);
  const pctB = Math.min(100, (t.B / game.target) * 100);

  return (
    <div className="grid grid-cols-2 gap-3">
      <TeamCard
        name={game.teamA}
        score={t.A}
        target={game.target}
        pct={pctA}
        winning={t.A >= t.B}
        winner={winner === "A"}
      />
      <TeamCard
        name={game.teamB}
        score={t.B}
        target={game.target}
        pct={pctB}
        winning={t.B > t.A}
        winner={winner === "B"}
      />
    </div>
  );
}

function TeamCard({
  name,
  score,
  target,
  pct,
  winning,
  winner,
}: {
  name: string;
  score: number;
  target: number;
  pct: number;
  winning: boolean;
  winner: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-4 backdrop-blur transition ${
        winner
          ? "border-gold-500 bg-gold-500/15"
          : winning
            ? "border-white/20 bg-white/10"
            : "border-white/10 bg-white/5"
      }`}
    >
      <div className="text-xs uppercase tracking-wider text-white/60">
        {name}
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="font-display text-5xl font-bold text-white tabular-nums">
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
      {winner && (
        <div className="mt-2 text-xs font-bold uppercase tracking-wider text-gold-400">
          Vainqueur
        </div>
      )}
    </div>
  );
}
