"use client";

import Modal from "./Modal";
import type { PastGame } from "@/lib/game";

interface Props {
  open: boolean;
  onClose: () => void;
  history: PastGame[];
  onClear: () => void;
}

const dtf = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export default function HistoryModal({
  open,
  onClose,
  history,
  onClear,
}: Props) {
  return (
    <Modal open={open} onClose={onClose} title="Historique">
      {history.length === 0 ? (
        <div className="py-10 text-center text-sm text-white/50">
          Aucune partie termin&eacute;e pour l&apos;instant.
          <br />
          Une partie est archiv&eacute;e ici quand tu d&eacute;marres une
          nouvelle partie.
        </div>
      ) : (
        <>
          <ul className="flex flex-col gap-2">
            {history.map((g) => (
              <li
                key={g.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-3"
              >
                <div className="mb-1 flex items-center justify-between text-xs text-white/50">
                  <span>{dtf.format(new Date(g.finishedAt))}</span>
                  <span>Cible: {g.target} pts</span>
                </div>
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                  <div
                    className={`text-right ${g.winner === "A" ? "text-gold-400" : "text-white/80"}`}
                  >
                    <div className="text-xs uppercase tracking-wider opacity-70">
                      {g.teamA}
                    </div>
                    <div className="font-display text-2xl font-bold tabular-nums">
                      {g.totalA}
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
                      {g.totalB}
                    </div>
                  </div>
                </div>
                <div className="mt-1 text-center text-xs text-white/50">
                  {g.rows.length} manche{g.rows.length > 1 ? "s" : ""}
                  {g.winner && (
                    <>
                      {" "}
                      &middot;{" "}
                      <span className="font-semibold text-gold-400">
                        {g.winner === "A" ? g.teamA : g.teamB} gagne
                      </span>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={onClear}
            className="mt-4 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/60 hover:bg-white/10"
          >
            Effacer l&apos;historique
          </button>
        </>
      )}
    </Modal>
  );
}
