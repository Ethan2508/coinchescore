"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import HeaderBar from "@/components/HeaderBar";
import { useStore } from "@/lib/store";
import { contractLabel } from "@/lib/scoring";
import { SUIT_COLOR, SUIT_SYMBOL } from "@/lib/types";

const dtf = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export default function HistoryPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto min-h-[100dvh] max-w-md p-4">
          <HeaderBar title="Historique" back="/" />
        </main>
      }
    >
      <HistoryInner />
    </Suspense>
  );
}

function HistoryInner() {
  const params = useSearchParams();
  const id = params.get("id");
  const { ready, history, clearHistory } = useStore();
  const [confirmClear, setConfirmClear] = useState(false);

  const selected = useMemo(
    () => (id ? history.find((g) => g.id === id) : undefined),
    [id, history],
  );

  if (!ready) {
    return (
      <main className="mx-auto min-h-[100dvh] max-w-md p-4 sm:p-6">
        <HeaderBar title="Historique" back="/" />
      </main>
    );
  }

  if (id && selected) {
    const totalsA = selected.hands.reduce((s, h) => s + h.scoreA, 0);
    const totalsB = selected.hands.reduce((s, h) => s + h.scoreB, 0);
    return (
      <main className="mx-auto min-h-[100dvh] max-w-md p-4 sm:p-6">
        <HeaderBar
          title={`${selected.teamA} vs ${selected.teamB}`}
          back="/history"
        />
        <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="mb-1 text-xs text-white/50">
            {dtf.format(new Date(selected.createdAt))} · Cible {selected.target}{" "}
            pts
          </div>
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <div
              className={`text-right ${selected.winner === "A" ? "text-gold-400" : "text-white/80"}`}
            >
              <div className="text-xs uppercase tracking-wider opacity-70">
                {selected.teamA}
              </div>
              <div className="font-display text-3xl font-bold tabular-nums">
                {totalsA}
              </div>
            </div>
            <div className="text-center text-xs font-bold uppercase tracking-wider text-white/40">
              vs
            </div>
            <div
              className={`text-left ${selected.winner === "B" ? "text-gold-400" : "text-white/80"}`}
            >
              <div className="text-xs uppercase tracking-wider opacity-70">
                {selected.teamB}
              </div>
              <div className="font-display text-3xl font-bold tabular-nums">
                {totalsB}
              </div>
            </div>
          </div>
          {selected.winner && (
            <div className="mt-2 text-center text-xs font-semibold text-gold-400">
              {selected.winner === "A" ? selected.teamA : selected.teamB} gagne
            </div>
          )}
        </div>

        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/60">
          Manches ({selected.hands.length})
        </h2>
        <ul className="flex flex-col gap-2">
          {selected.hands.map((h, i) => (
            <li
              key={h.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-3"
            >
              <div className="flex items-center gap-2 text-xs text-white/70">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black/30 text-xs font-bold text-white/70">
                  {i + 1}
                </span>
                <span className={`text-lg leading-none ${SUIT_COLOR[h.suit]}`}>
                  {SUIT_SYMBOL[h.suit]}
                </span>
                <span className="font-semibold">
                  {h.taker === "A" ? selected.teamA : selected.teamB}
                </span>
                <span>·</span>
                <span>{contractLabel(h.contract)}</span>
                {h.coinche !== "none" && (
                  <span className="rounded bg-red-500/20 px-1.5 font-semibold text-red-300">
                    {h.coinche === "surcoinche" ? "×4" : "×2"}
                  </span>
                )}
                {h.chute && (
                  <span className="rounded bg-red-500/20 px-1.5 font-semibold text-red-300">
                    Chute
                  </span>
                )}
                {h.capot && !h.chute && (
                  <span className="rounded bg-gold-500/20 px-1.5 font-semibold text-gold-400">
                    Capot
                  </span>
                )}
                {h.belote !== "none" && (
                  <span className="rounded bg-blue-500/20 px-1.5 font-semibold text-blue-300">
                    Belote
                  </span>
                )}
              </div>
              <div className="ml-9 mt-1 flex gap-3 text-sm font-semibold">
                <span className="text-white">
                  {selected.teamA}{" "}
                  <span className="text-gold-400">+{h.scoreA}</span>
                </span>
                <span className="text-white/30">|</span>
                <span className="text-white">
                  {selected.teamB}{" "}
                  <span className="text-gold-400">+{h.scoreB}</span>
                </span>
              </div>
            </li>
          ))}
        </ul>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-[100dvh] max-w-md p-4 sm:p-6">
      <HeaderBar title="Historique" back="/" />

      {history.length === 0 ? (
        <div className="mt-16 text-center">
          <div className="mb-3 text-5xl">📜</div>
          <div className="text-sm text-white/60">
            Aucune partie archivée.
            <br />
            Une partie est archivée quand tu la termines.
          </div>
        </div>
      ) : (
        <>
          <ul className="flex flex-col gap-2">
            {history.map((g) => {
              const totalsA = g.hands.reduce((s, h) => s + h.scoreA, 0);
              const totalsB = g.hands.reduce((s, h) => s + h.scoreB, 0);
              return (
                <li key={g.id}>
                  <Link
                    href={`/history?id=${g.id}`}
                    className="block rounded-2xl border border-white/10 bg-white/5 p-3 transition hover:bg-white/10"
                  >
                    <div className="mb-1 flex items-center justify-between text-xs text-white/50">
                      <span>{dtf.format(new Date(g.createdAt))}</span>
                      <span>
                        {g.hands.length} manche{g.hands.length > 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                      <div
                        className={`text-right ${g.winner === "A" ? "text-gold-400" : "text-white/80"}`}
                      >
                        <div className="text-xs uppercase tracking-wider opacity-70">
                          {g.teamA}
                        </div>
                        <div className="font-display text-2xl font-bold tabular-nums">
                          {totalsA}
                        </div>
                      </div>
                      <div className="text-center text-xs font-bold uppercase tracking-wider text-white/40">
                        vs
                      </div>
                      <div
                        className={`text-left ${g.winner === "B" ? "text-gold-400" : "text-white/80"}`}
                      >
                        <div className="text-xs uppercase tracking-wider opacity-70">
                          {g.teamB}
                        </div>
                        <div className="font-display text-2xl font-bold tabular-nums">
                          {totalsB}
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>

          <button
            type="button"
            onClick={() => {
              if (!confirmClear) {
                setConfirmClear(true);
                setTimeout(() => setConfirmClear(false), 3000);
                return;
              }
              clearHistory();
              setConfirmClear(false);
            }}
            className={`mt-4 w-full rounded-xl border px-4 py-2 text-xs transition ${
              confirmClear
                ? "border-red-500 bg-red-500/20 text-red-300"
                : "border-white/10 bg-white/5 text-white/50 hover:bg-white/10"
            }`}
          >
            {confirmClear ? "Confirmer l’effacement" : "Effacer l’historique"}
          </button>
        </>
      )}
    </main>
  );
}
