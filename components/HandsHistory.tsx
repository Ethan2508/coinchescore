"use client";

import type { Hand } from "@/lib/types";
import { SUIT_LABEL } from "@/lib/types";

interface Props {
  hands: Hand[];
  teamA: string;
  teamB: string;
  onDelete: (id: string) => void;
}

export default function HandsHistory({ hands, teamA, teamB, onDelete }: Props) {
  if (hands.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-8 text-center text-sm text-white/50">
        Pas encore de manche jouée.
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {[...hands].reverse().map((h) => (
        <li
          key={h.id}
          className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/30 text-xs font-bold text-white/70">
            {h.index}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-xs text-white/60">
              <span className="truncate">
                {h.taker === "A" ? teamA : teamB}
              </span>
              <span>•</span>
              <span>{SUIT_LABEL[h.suit]}</span>
              {h.contract !== undefined && (
                <>
                  <span>•</span>
                  <span>{h.contract === 250 ? "Capot" : h.contract}</span>
                </>
              )}
              {h.coinche !== "none" && (
                <span className="rounded bg-red-500/20 px-1.5 text-red-300">
                  {h.coinche === "surcoinche" ? "×4" : "×2"}
                </span>
              )}
              {h.chute && (
                <span className="rounded bg-red-500/20 px-1.5 text-red-300">
                  Chute
                </span>
              )}
              {h.capot && !h.chute && (
                <span className="rounded bg-gold-500/20 px-1.5 text-gold-400">
                  Capot
                </span>
              )}
              {h.belote !== "none" && (
                <span className="rounded bg-blue-500/20 px-1.5 text-blue-300">
                  Belote
                </span>
              )}
            </div>
            <div className="mt-0.5 flex gap-3 text-sm font-semibold">
              <span className="text-white">
                {teamA}{" "}
                <span className="text-gold-400">+{h.scoreA}</span>
              </span>
              <span className="text-white/40">|</span>
              <span className="text-white">
                {teamB}{" "}
                <span className="text-gold-400">+{h.scoreB}</span>
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onDelete(h.id)}
            aria-label="Supprimer la manche"
            className="rounded-full border border-white/10 px-2 py-1 text-xs text-white/60 hover:bg-white/10"
          >
            ✕
          </button>
        </li>
      ))}
    </ul>
  );
}
