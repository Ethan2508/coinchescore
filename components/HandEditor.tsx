"use client";

import { useState } from "react";
import BiddingRound from "./BiddingRound";
import Modal from "./Modal";
import { computeScore } from "@/lib/store";
import {
  CONTRACTS,
  HAND_STEP,
  HAND_TOTAL,
  contractLabel,
  contractShortLabel,
  isAllTricksContract as checkAllTricks,
  isBelotAnnounced as checkBelotAnnounced,
} from "@/lib/scoring";
import { firstToBidSeat } from "@/lib/players";
import {
  SUITS,
  SUIT_COLOR,
  SUIT_SYMBOL,
  type BidEntry,
  type CoincheLevel,
  type Hand,
  type Player,
  type Suit,
  type TeamId,
} from "@/lib/types";

interface Props {
  open: boolean;
  onClose: () => void;
  teamA: string;
  teamB: string;
  players?: Player[];
  dealerSeat?: number;
  handIndex: number;
  initial?: Hand;
  onSubmit: (hand: Omit<Hand, "id" | "createdAt">) => void;
}

const SEAT_GRID = [
  "col-start-2 row-start-1",
  "col-start-3 row-start-2",
  "col-start-2 row-start-3",
  "col-start-1 row-start-2",
];

export default function HandEditor({
  open,
  onClose,
  teamA,
  teamB,
  players,
  dealerSeat,
  handIndex,
  initial,
  onSubmit,
}: Props) {
  const hasPlayers = !!players && players.length === 4;
  const [biddingMode, setBiddingMode] = useState(false);
  const [bidding, setBidding] = useState<BidEntry[] | undefined>(
    initial?.bidding,
  );
  const [taker, setTaker] = useState<TeamId>(initial?.taker ?? "A");
  const [takerPlayerId, setTakerPlayerId] = useState<string | undefined>(
    initial?.takerPlayerId ?? (hasPlayers ? players![0].id : undefined),
  );
  const [suit, setSuit] = useState<Suit>(initial?.suit ?? "pique");
  const [contract, setContract] = useState<number>(initial?.contract ?? 80);
  const [takerPoints, setTakerPoints] = useState<number>(
    initial?.takerPoints ?? 90,
  );
  const [belote, setBelote] = useState<"none" | TeamId>(
    initial?.belote ?? "none",
  );
  const [coinche, setCoinche] = useState<CoincheLevel>(
    initial?.coinche ?? "none",
  );
  const [allTricksMade, setAllTricksMade] = useState<boolean>(
    initial ? !initial.chute : true,
  );

  const selectPlayer = (p: Player) => {
    setTaker(p.team);
    setTakerPlayerId(p.id);
  };

  const handleBiddingDone = (
    log: BidEntry[],
    last: BidEntry | null,
    resolvedCoinche: CoincheLevel,
  ) => {
    if (!last) {
      onClose();
      return;
    }
    const player = players!.find((p) => p.id === last.playerId)!;
    setBidding(log);
    setTaker(player.team);
    setTakerPlayerId(player.id);
    setSuit(last.suit!);
    setContract(last.contract!);
    setCoinche(resolvedCoinche);
    setBiddingMode(false);
  };

  const isAllTricksContract = checkAllTricks(contract);
  const belotAnnounced = checkBelotAnnounced(contract);
  const effectiveTakerPoints = isAllTricksContract
    ? allTricksMade
      ? HAND_TOTAL
      : 0
    : takerPoints;
  const beloteIncludedInContract = belotAnnounced && allTricksMade;
  const effectiveBelote = beloteIncludedInContract ? "none" : belote;

  const preview = computeScore({
    taker,
    contract,
    takerPoints: effectiveTakerPoints,
    belote: effectiveBelote,
    coinche,
  });

  const submit = () => {
    onSubmit({
      taker,
      takerPlayerId: hasPlayers ? takerPlayerId : undefined,
      suit,
      contract,
      takerPoints: effectiveTakerPoints,
      belote: effectiveBelote,
      coinche,
      scoreA: preview.scoreA,
      scoreB: preview.scoreB,
      chute: preview.chute,
      capot: preview.capot,
      bidding,
    });
    onClose();
  };

  if (open && hasPlayers && biddingMode) {
    return (
      <Modal open onClose={onClose} title="Enchères">
        <BiddingRound
          players={players!}
          startSeat={firstToBidSeat(dealerSeat ?? 0)}
          onDone={handleBiddingDone}
        />
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? `Modifier manche ${handIndex}` : `Manche ${handIndex}`}
    >
      {hasPlayers && !initial && !bidding && (
        <button
          type="button"
          onClick={() => setBiddingMode(true)}
          className="mb-4 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/70 transition hover:bg-white/10"
        >
          🗣️ Enregistrer les enchères en détail
        </button>
      )}

      {bidding && (
        <div className="mb-4 rounded-xl border border-blue-500/30 bg-blue-500/10 p-3">
          <div className="mb-1 text-[10px] uppercase tracking-wider text-blue-300">
            Enchères enregistrées
          </div>
          <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-xs text-blue-200">
            {bidding.map((entry, i) => {
              const p = players?.find((pl) => pl.id === entry.playerId);
              const label = entry.coinche
                ? entry.coinche === "surcoinche"
                  ? "surcoinche"
                  : "coinche"
                : entry.pass
                  ? "passe"
                  : contractShortLabel(entry.contract!);
              return (
                <span key={i}>
                  {p?.name}: {label}
                  {i < bidding.length - 1 ? " ·" : ""}
                </span>
              );
            })}
          </div>
        </div>
      )}

      <Section label="Preneur">
        {hasPlayers ? (
          <div className="grid grid-cols-3 grid-rows-3 place-items-center gap-2">
            {players!.map((p, i) => (
              <button
                key={p.id}
                type="button"
                onClick={() => selectPlayer(p)}
                className={`${SEAT_GRID[i]} flex h-16 w-16 items-center justify-center rounded-full border-2 px-1 text-center text-xs font-semibold transition ${
                  takerPlayerId === p.id
                    ? "border-gold-500 bg-gold-500 text-felt-950"
                    : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
                }`}
              >
                <span className="line-clamp-2 leading-tight">{p.name}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {(["A", "B"] as TeamId[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTaker(t)}
                className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                  taker === t
                    ? "border-gold-500 bg-gold-500 text-felt-950"
                    : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
                }`}
              >
                {t === "A" ? teamA : teamB}
              </button>
            ))}
          </div>
        )}
      </Section>

      <Section label="Atout">
        <div className="grid grid-cols-3 gap-2">
          {SUITS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSuit(s)}
              className={`flex flex-col items-center gap-0.5 rounded-xl border py-3 text-sm font-semibold transition ${
                suit === s
                  ? "border-gold-500 bg-gold-500/15 text-white"
                  : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
              }`}
            >
              <span
                className={`text-2xl leading-none ${
                  suit === s ? SUIT_COLOR[s] : SUIT_COLOR[s]
                }`}
              >
                {SUIT_SYMBOL[s]}
              </span>
            </button>
          ))}
        </div>
      </Section>

      <Section label="Contrat">
        <div className="grid grid-cols-5 gap-1.5">
          {CONTRACTS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => {
                setContract(c);
                if (checkAllTricks(c)) setCoinche("none");
                if (checkBelotAnnounced(c)) setBelote("none");
              }}
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
      </Section>

      {isAllTricksContract && (
        <Section label="Résultat">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setAllTricksMade(true)}
              className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                allTricksMade
                  ? "border-gold-500 bg-gold-500 text-felt-950"
                  : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
              }`}
            >
              Réussi
            </button>
            <button
              type="button"
              onClick={() => setAllTricksMade(false)}
              className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                !allTricksMade
                  ? "border-red-500 bg-red-500/20 text-red-300"
                  : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
              }`}
            >
              Chuté
            </button>
          </div>
        </Section>
      )}

      {!isAllTricksContract && (
        <Section label={`Points du preneur : ${takerPoints} / ${HAND_TOTAL}`}>
          <input
            type="range"
            min={0}
            max={HAND_TOTAL}
            step={HAND_STEP}
            value={takerPoints}
            onChange={(e) => setTakerPoints(Number(e.target.value))}
            className="w-full"
          />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {[0, 50, 80, 90, 100, 110, 120, 140, 160].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setTakerPoints(v)}
                className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-white/70 hover:bg-white/10"
              >
                {v}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-white/40">
            Arrondi aux dizaines · défense = {HAND_TOTAL - takerPoints}
          </p>
        </Section>
      )}

      {beloteIncludedInContract ? (
        <div className="mb-4 rounded-xl border border-blue-500/30 bg-blue-500/10 p-3 text-xs text-blue-200">
          Belote annoncée dans le contrat (+40 déjà inclus dans le score).
        </div>
      ) : (
        <Section label="Belote / rebelote">
          <div className="grid grid-cols-3 gap-2">
            {(["none", "A", "B"] as const).map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setBelote(b)}
                className={`rounded-lg border px-2 py-2 text-xs font-semibold transition ${
                  belote === b
                    ? "border-gold-500 bg-gold-500 text-felt-950"
                    : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
                }`}
              >
                {b === "none" ? "Aucune" : b === "A" ? teamA : teamB}
              </button>
            ))}
          </div>
        </Section>
      )}

      {!isAllTricksContract && (
        <Section label="Coinche">
          <div className="grid grid-cols-3 gap-2">
            {(["none", "coinche", "surcoinche"] as CoincheLevel[]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCoinche(c)}
                className={`rounded-lg border px-2 py-2 text-xs font-semibold capitalize transition ${
                  coinche === c
                    ? "border-gold-500 bg-gold-500 text-felt-950"
                    : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
                }`}
              >
                {c === "none" ? "Aucune" : c}
              </button>
            ))}
          </div>
        </Section>
      )}

      <div className="my-4 rounded-2xl border border-white/10 bg-black/30 p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-white/50">
            Aperçu du score
          </span>
          <div className="flex gap-1">
            {preview.chute && (
              <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-semibold text-red-300">
                Chute
              </span>
            )}
            {preview.capot && !preview.chute && (
              <span className="rounded-full bg-gold-500/20 px-2 py-0.5 text-xs font-semibold text-gold-400">
                Capot
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-white/60">{teamA}</div>
            <div className="font-display text-3xl font-bold text-white tabular-nums">
              +{preview.scoreA}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-white/60">{teamB}</div>
            <div className="font-display text-3xl font-bold text-white tabular-nums">
              +{preview.scoreB}
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={submit}
        className="w-full rounded-2xl bg-gold-500 px-6 py-4 text-base font-bold text-felt-950 shadow-lg shadow-black/30 transition hover:bg-gold-400 active:scale-95"
      >
        {initial ? "Enregistrer" : "Valider la manche"}
      </button>

      <p className="mt-3 text-center text-xs text-white/40">
        {contractLabel(contract)} · {taker === "A" ? teamA : teamB} preneur ·{" "}
        {SUIT_SYMBOL[suit]}
      </p>
    </Modal>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/60">
        {label}
      </div>
      {children}
    </div>
  );
}
