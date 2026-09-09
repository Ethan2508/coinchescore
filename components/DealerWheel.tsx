"use client";

import { useState } from "react";
import type { Player } from "@/lib/types";

interface Props {
  players: Player[];
  onResult: (seat: number) => void;
}

export default function DealerWheel({ players, onResult }: Props) {
  const [spinning, setSpinning] = useState(false);
  const [highlighted, setHighlighted] = useState<number | null>(null);
  const [result, setResult] = useState<number | null>(null);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setResult(null);
    const finalSeat = Math.floor(Math.random() * 4);

    const totalTicks = 18 + finalSeat;
    let tick = 0;
    let delay = 80;

    const step = () => {
      setHighlighted(tick % 4);
      tick += 1;
      if (tick < totalTicks) {
        delay += tick > totalTicks - 6 ? 40 : 6;
        setTimeout(step, delay);
      } else {
        setHighlighted(finalSeat);
        setResult(finalSeat);
        setSpinning(false);
        onResult(finalSeat);
      }
    };
    setTimeout(step, delay);
  };

  const ordered = [...players].sort((a, b) => a.seat - b.seat);

  return (
    <div className="flex flex-col items-center gap-4 py-2">
      <div className="relative flex h-56 w-56 items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-white/10 bg-black/20" />
        {ordered.map((p) => {
          const angle = (p.seat * 90 - 90) * (Math.PI / 180);
          const radius = 90;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          const active = highlighted === p.seat;
          const won = result === p.seat;
          return (
            <div
              key={p.id}
              className={`absolute flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 text-center text-xs font-bold transition-all duration-100 ${
                won
                  ? "scale-125 border-gold-500 bg-gold-500 text-felt-950 shadow-lg shadow-gold-500/50"
                  : active
                    ? "scale-110 border-gold-400 bg-gold-500/30 text-white"
                    : "border-white/15 bg-white/5 text-white/70"
              }`}
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
              }}
            >
              <span className="line-clamp-2 px-1 leading-tight">
                {p.name}
              </span>
            </div>
          );
        })}
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black/30 text-2xl">
          🂠
        </div>
      </div>

      {result !== null ? (
        <div className="text-center">
          <div className="text-xs uppercase tracking-wider text-gold-400">
            Premier donneur
          </div>
          <div className="font-display text-2xl font-bold">
            {ordered.find((p) => p.seat === result)?.name}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={spin}
          disabled={spinning}
          className="rounded-2xl bg-gold-500 px-6 py-3 text-sm font-bold text-felt-950 shadow-lg shadow-black/30 transition hover:bg-gold-400 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {spinning ? "..." : "🎡 Lancer la roue"}
        </button>
      )}
    </div>
  );
}
