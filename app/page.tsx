"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";

export default function HomePage() {
  const { ready, current, history } = useStore();

  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-md flex-col p-6">
      <div className="mt-8 text-center sm:mt-16">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-gold-500/40 bg-gold-500/10 shadow-lg shadow-black/40">
          <span className="text-5xl leading-none text-gold-400">♠</span>
        </div>
        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight">
          CoincheScore
        </h1>
        <p className="mt-2 text-sm text-white/60">
          Compteur de points de coinche, gratuit et sans pub.
        </p>
      </div>

      <div className="mt-10 flex flex-col gap-3">
        {ready && current && current.hands.length > 0 && (
          <Link
            href="/game"
            className="rounded-2xl border border-gold-500 bg-gold-500 px-5 py-4 text-center font-display text-lg font-bold text-felt-950 shadow-lg shadow-black/30 transition hover:bg-gold-400 active:scale-[0.98]"
          >
            Reprendre la partie
            <div className="mt-0.5 text-xs font-normal text-felt-950/70">
              {current.teamA} vs {current.teamB} · {current.hands.length} manche
              {current.hands.length > 1 ? "s" : ""}
            </div>
          </Link>
        )}

        <Link
          href="/new"
          className={`rounded-2xl px-5 py-4 text-center font-display text-lg font-bold shadow-lg shadow-black/30 transition active:scale-[0.98] ${
            ready && current && current.hands.length > 0
              ? "border border-white/15 bg-white/10 text-white hover:bg-white/15"
              : "bg-gold-500 text-felt-950 hover:bg-gold-400"
          }`}
        >
          Nouvelle partie
        </Link>

        <Link
          href="/history"
          className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-4 font-semibold text-white/90 transition hover:bg-white/10 active:scale-[0.98]"
        >
          <span>Historique</span>
          {ready && (
            <span className="text-xs text-white/50">
              {history.length} partie{history.length > 1 ? "s" : ""}
            </span>
          )}
        </Link>

        <Link
          href="/rules"
          className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-center font-semibold text-white/90 transition hover:bg-white/10 active:scale-[0.98]"
        >
          Règles
        </Link>
      </div>

      <div className="mt-auto pt-10 text-center text-xs text-white/30">
        v0.2 · coinche &amp; belote
      </div>
    </main>
  );
}
