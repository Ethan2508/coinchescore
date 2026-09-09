"use client";

import { useState } from "react";
import { CONTRACTS, contractShortLabel } from "@/lib/scoring";
import { nextDealerSeat, playerAtSeat } from "@/lib/players";
import {
  SUITS,
  SUIT_COLOR,
  SUIT_SYMBOL,
  type BidEntry,
  type Player,
  type Suit,
} from "@/lib/types";

interface Props {
  players: Player[];
  startSeat: number;
  onDone: (log: BidEntry[], last: BidEntry | null) => void;
}

export default function BiddingRound({ players, startSeat, onDone }: Props) {
  const [log, setLog] = useState<BidEntry[]>([]);
  const [seat, setSeat] = useState(startSeat);
  const [suit, setSuit] = useState<Suit>("pique");
  const [contract, setContract] = useState<number>(80);

  const current = playerAtSeat(players, seat)!;
  const lastBid = [...log].reverse().find((e) => !e.pass) ?? null;

  const consecutivePasses = (() => {
    let n = 0;
    for (let i = log.length - 1; i >= 0; i--) {
      if (log[i].pass) n++;
      else break;
    }
    return n;
  })();
  const canAutoEnd =
    (lastBid && consecutivePasses >= 3) ||
    (!lastBid && consecutivePasses >= 4);

  const advance = (entry: BidEntry) => {
    const nextLog = [...log, entry];
    setLog(nextLog);
    setSeat(nextDealerSeat(seat));
  };

  const announce = () => {
    advance({ playerId: current.id, pass: false, suit, contract });
  };

  const pass = () => {
    advance({ playerId: current.id, pass: true });
  };

  const finish = () => {
    const last = [...log].reverse().find((e) => !e.pass) ?? null;
    onDone(log, last);
  };

  return (
    <div>
      {log.length > 0 && (
        <div className="mb-4 flex flex-col gap-1 rounded-xl border border-white/10 bg-black/20 p-3">
          {log.map((entry, i) => {
            const p = players.find((pl) => pl.id === entry.playerId)!;
            return (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="w-16 shrink-0 truncate font-semibold text-white/80">
                  {p.name}
                </span>
                {entry.pass ? (
                  <span className="text-white/40">passe</span>
                ) : (
                  <span className="text-gold-400">
                    {contractShortLabel(entry.contract!)}{" "}
                    <span className={SUIT_COLOR[entry.suit!]}>
                      {SUIT_SYMBOL[entry.suit!]}
                    </span>
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="mb-4 rounded-xl border border-gold-500/40 bg-gold-500/10 p-3 text-center">
        <div className="text-[10px] uppercase tracking-wider text-gold-400">
          Au tour de
        </div>
        <div className="font-display text-xl font-bold">{current.name}</div>
      </div>

      <div className="mb-3">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/60">
          Atout
        </div>
        <div className="grid grid-cols-6 gap-1.5">
          {SUITS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSuit(s)}
              className={`flex items-center justify-center rounded-lg border py-2 text-lg leading-none transition ${
                suit === s
                  ? "border-gold-500 bg-gold-500/15"
                  : "border-white/10 bg-white/5 hover:bg-white/10"
              } ${SUIT_COLOR[s]}`}
            >
              {SUIT_SYMBOL[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/60">
          Contrat annoncé
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {CONTRACTS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setContract(c)}
              className={`rounded-lg border py-2 text-xs font-semibold transition ${
                contract === c
                  ? "border-gold-500 bg-gold-500 text-felt-950"
                  : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
              }`}
            >
              {contractShortLabel(c)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={pass}
          className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/10 active:scale-95"
        >
          Passe
        </button>
        <button
          type="button"
          onClick={announce}
          className="rounded-2xl bg-gold-500 px-4 py-3 text-sm font-bold text-felt-950 transition hover:bg-gold-400 active:scale-95"
        >
          Annoncer
        </button>
      </div>

      <button
        type="button"
        onClick={finish}
        disabled={!lastBid}
        className={`mt-3 w-full rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
          canAutoEnd
            ? "border-gold-500 bg-gold-500/15 text-gold-400"
            : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
        } disabled:cursor-not-allowed disabled:opacity-30`}
      >
        {lastBid
          ? `Terminer les enchères (${contractShortLabel(lastBid.contract!)} ${SUIT_SYMBOL[lastBid.suit!]} retenu)`
          : "Terminer les enchères"}
      </button>

      {!lastBid && log.length >= 4 && (
        <p className="mt-2 text-center text-xs text-white/40">
          Tout le monde a passé — aucune manche à enregistrer.
        </p>
      )}
    </div>
  );
}
