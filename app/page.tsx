"use client";

import { useCallback, useEffect, useState } from "react";
import GameSetup from "@/components/GameSetup";
import HandForm from "@/components/HandForm";
import HandsHistory from "@/components/HandsHistory";
import ScoreBoard from "@/components/ScoreBoard";
import { detectWinner } from "@/lib/scoring";
import {
  loadCurrent,
  loadHistory,
  pushToHistory,
  saveCurrent,
} from "@/lib/storage";
import type { Game, Hand } from "@/lib/types";

type View = "setup" | "game";

export default function Page() {
  const [game, setGame] = useState<Game | null>(null);
  const [view, setView] = useState<View>("setup");
  const [showHandForm, setShowHandForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [pastGames, setPastGames] = useState<Game[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const current = loadCurrent();
    if (current) {
      setGame(current);
      setView("game");
    }
    setPastGames(loadHistory());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveCurrent(game);
  }, [game, hydrated]);

  const winner = game ? detectWinner(game.hands, game.target) : undefined;

  useEffect(() => {
    if (!game || !winner || game.finishedAt) return;
    const finished: Game = { ...game, finishedAt: Date.now(), winner };
    setGame(finished);
    pushToHistory(finished);
    setPastGames(loadHistory());
  }, [game, winner]);

  const startGame = useCallback((g: Game) => {
    setGame(g);
    setView("game");
  }, []);

  const addHand = useCallback((hand: Hand) => {
    setGame((g) => (g ? { ...g, hands: [...g.hands, hand] } : g));
    setShowHandForm(false);
  }, []);

  const deleteHand = useCallback((id: string) => {
    setGame((g) => {
      if (!g) return g;
      const hands = g.hands.filter((h) => h.id !== id);
      return { ...g, hands, finishedAt: undefined, winner: undefined };
    });
  }, []);

  const undoLast = useCallback(() => {
    setGame((g) => {
      if (!g || g.hands.length === 0) return g;
      return {
        ...g,
        hands: g.hands.slice(0, -1),
        finishedAt: undefined,
        winner: undefined,
      };
    });
  }, []);

  const newGame = useCallback(() => {
    if (!game) return;
    if (
      !game.finishedAt &&
      game.hands.length > 0 &&
      !confirm("Abandonner la partie en cours ?")
    )
      return;
    setGame(null);
    setView("setup");
  }, [game]);

  if (!hydrated) return null;

  if (view === "setup" || !game) {
    return (
      <main className="min-h-screen">
        <GameSetup
          onCreate={startGame}
          defaults={
            pastGames[0]
              ? { teamA: pastGames[0].teamA, teamB: pastGames[0].teamB }
              : undefined
          }
        />
        {pastGames.length > 0 && (
          <div className="mx-auto max-w-md p-6 pt-0">
            <button
              type="button"
              onClick={() => setShowHistory((s) => !s)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 hover:bg-white/10"
            >
              {showHistory ? "Masquer" : "Voir"} l'historique ({pastGames.length})
            </button>
            {showHistory && (
              <ul className="mt-3 flex flex-col gap-2">
                {pastGames.map((g) => (
                  <li
                    key={g.id}
                    className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm"
                  >
                    <div className="flex justify-between text-xs text-white/60">
                      <span className="capitalize">{g.variant}</span>
                      <span>
                        {new Date(g.createdAt).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                    <div className="mt-1 flex justify-between">
                      <span
                        className={
                          g.winner === "A"
                            ? "font-bold text-gold-400"
                            : "text-white"
                        }
                      >
                        {g.teamA}
                      </span>
                      <span className="tabular-nums text-white/70">
                        {g.hands.reduce((s, h) => s + h.scoreA, 0)} —{" "}
                        {g.hands.reduce((s, h) => s + h.scoreB, 0)}
                      </span>
                      <span
                        className={
                          g.winner === "B"
                            ? "font-bold text-gold-400"
                            : "text-white"
                        }
                      >
                        {g.teamB}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md p-4 pb-32">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-white/50">
            {game.variant} · {game.target} pts
          </div>
          <h1 className="font-display text-2xl font-bold">Partie en cours</h1>
        </div>
        <button
          type="button"
          onClick={newGame}
          className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 hover:bg-white/10"
        >
          Nouvelle partie
        </button>
      </header>

      <ScoreBoard game={game} winner={winner} />

      {winner && (
        <div className="my-4 rounded-2xl border border-gold-500 bg-gold-500/15 p-4 text-center">
          <div className="text-xs uppercase tracking-wider text-gold-400">
            Victoire
          </div>
          <div className="mt-1 font-display text-xl font-bold">
            {winner === "A" ? game.teamA : game.teamB} remporte la partie
          </div>
        </div>
      )}

      <div className="my-4 flex gap-2">
        <button
          type="button"
          onClick={() => setShowHandForm(true)}
          disabled={!!winner}
          className="flex-1 rounded-2xl bg-gold-500 px-4 py-4 text-base font-bold text-felt-950 shadow-lg shadow-black/30 transition hover:bg-gold-400 active:scale-95 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40 disabled:shadow-none"
        >
          + Manche
        </button>
        <button
          type="button"
          onClick={undoLast}
          disabled={game.hands.length === 0}
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm font-semibold text-white/80 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Annuler
        </button>
      </div>

      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/60">
          Manches ({game.hands.length})
        </h2>
        <HandsHistory
          hands={game.hands}
          teamA={game.teamA}
          teamB={game.teamB}
          onDelete={deleteHand}
        />
      </section>

      {showHandForm && (
        <HandForm
          game={game}
          onSubmit={addHand}
          onCancel={() => setShowHandForm(false)}
        />
      )}
    </main>
  );
}
