import type { CoincheLevel, Hand, TeamId } from "./types";

export const HAND_TOTAL = 162;
export const CAPOT_CONTRACT = 250;
export const GENERALE_CONTRACT = 500;

export const CONTRACTS = [
  80, 90, 100, 110, 120, 130, 140, 150, 160, CAPOT_CONTRACT, GENERALE_CONTRACT,
] as const;

export interface ScoreInput {
  taker: TeamId;
  contract: number;
  takerPoints: number;
  belote: "none" | TeamId;
  coinche: CoincheLevel;
}

export interface ScoreResult {
  scoreA: number;
  scoreB: number;
  chute: boolean;
  capot: boolean;
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function multiplier(c: CoincheLevel): number {
  if (c === "coinche") return 2;
  if (c === "surcoinche") return 4;
  return 1;
}

export function computeScore(input: ScoreInput): ScoreResult {
  const takerPts = clamp(input.takerPoints, 0, HAND_TOTAL);
  const defensePts = HAND_TOTAL - takerPts;
  const mult = multiplier(input.coinche);
  const capot = takerPts === HAND_TOTAL;

  let takerScore = 0;
  let defenseScore = 0;
  let chute = false;

  if (input.contract === GENERALE_CONTRACT) {
    if (capot) {
      takerScore = 500;
    } else {
      chute = true;
      defenseScore = 160 + GENERALE_CONTRACT;
    }
  } else if (input.contract === CAPOT_CONTRACT) {
    if (capot) {
      takerScore = 500;
    } else {
      chute = true;
      defenseScore = 160 + CAPOT_CONTRACT;
    }
  } else if (takerPts >= input.contract) {
    takerScore = input.contract + takerPts;
    defenseScore = defensePts;
    if (capot) takerScore += 90;
  } else {
    chute = true;
    defenseScore = 160 + input.contract;
  }

  takerScore *= mult;
  defenseScore *= mult;

  if (input.belote !== "none") {
    if (input.belote === input.taker) takerScore += 20;
    else defenseScore += 20;
  }

  return {
    scoreA: input.taker === "A" ? takerScore : defenseScore,
    scoreB: input.taker === "B" ? takerScore : defenseScore,
    chute,
    capot,
  };
}

export function totalScores(hands: Hand[]): { a: number; b: number } {
  return hands.reduce(
    (acc, h) => ({ a: acc.a + h.scoreA, b: acc.b + h.scoreB }),
    { a: 0, b: 0 },
  );
}

export function detectWinner(
  totalA: number,
  totalB: number,
  target: number,
): TeamId | undefined {
  const aReached = totalA >= target;
  const bReached = totalB >= target;
  if (aReached && bReached) return totalA >= totalB ? "A" : "B";
  if (aReached) return "A";
  if (bReached) return "B";
  return undefined;
}

export function contractLabel(contract: number): string {
  if (contract === CAPOT_CONTRACT) return "Capot";
  if (contract === GENERALE_CONTRACT) return "Générale";
  return String(contract);
}
