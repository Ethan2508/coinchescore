import type { Coinche, Hand, TeamId, Variant } from "./types";

export const COINCHE_CONTRACTS = [
  80, 90, 100, 110, 120, 130, 140, 150, 160, 250,
] as const;

export const CAPOT_CONTRACT = 250;
export const HAND_TOTAL = 162;

export interface HandInput {
  variant: Variant;
  taker: TeamId;
  takerPoints: number;
  belote: "none" | TeamId;
  contract?: number;
  coinche?: Coinche;
}

export interface HandResult {
  scoreA: number;
  scoreB: number;
  chute: boolean;
  capot: boolean;
}

function multiplier(c: Coinche | undefined): number {
  if (c === "coinche") return 2;
  if (c === "surcoinche") return 4;
  return 1;
}

export function computeCoinche(input: HandInput): HandResult {
  const contract = input.contract ?? 80;
  const takerPts = clamp(input.takerPoints, 0, HAND_TOTAL);
  const defensePts = HAND_TOTAL - takerPts;
  const mult = multiplier(input.coinche);

  let takerScore = 0;
  let defenseScore = 0;
  let chute = false;
  const capot = takerPts === HAND_TOTAL;

  if (contract === CAPOT_CONTRACT) {
    if (capot) {
      takerScore = 500;
      defenseScore = 0;
    } else {
      chute = true;
      takerScore = 0;
      defenseScore = 160 + CAPOT_CONTRACT;
    }
  } else if (takerPts >= contract) {
    takerScore = contract + takerPts;
    defenseScore = defensePts;
    if (capot) takerScore += 90;
  } else {
    chute = true;
    takerScore = 0;
    defenseScore = 160 + contract;
  }

  takerScore *= mult;
  defenseScore *= mult;

  if (input.belote !== "none") {
    if (input.belote === input.taker) takerScore += 20;
    else defenseScore += 20;
  }

  return withTeams(input.taker, takerScore, defenseScore, chute, capot);
}

export function computeBelote(input: HandInput): HandResult {
  const takerPts = clamp(input.takerPoints, 0, HAND_TOTAL);
  const defensePts = HAND_TOTAL - takerPts;
  const capot = takerPts === HAND_TOTAL;

  let takerScore: number;
  let defenseScore: number;
  let chute = false;

  if (takerPts < 82) {
    chute = true;
    takerScore = 0;
    defenseScore = HAND_TOTAL;
  } else {
    takerScore = takerPts;
    defenseScore = defensePts;
    if (capot) takerScore += 90;
  }

  if (input.belote !== "none") {
    if (input.belote === input.taker) takerScore += 20;
    else defenseScore += 20;
  }

  return withTeams(input.taker, takerScore, defenseScore, chute, capot);
}

export function computeHand(input: HandInput): HandResult {
  return input.variant === "coinche" ? computeCoinche(input) : computeBelote(input);
}

function withTeams(
  taker: TeamId,
  takerScore: number,
  defenseScore: number,
  chute: boolean,
  capot: boolean,
): HandResult {
  return {
    scoreA: taker === "A" ? takerScore : defenseScore,
    scoreB: taker === "B" ? takerScore : defenseScore,
    chute,
    capot,
  };
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export function totals(hands: Hand[]): { A: number; B: number } {
  return hands.reduce(
    (acc, h) => ({ A: acc.A + h.scoreA, B: acc.B + h.scoreB }),
    { A: 0, B: 0 },
  );
}

export function detectWinner(
  hands: Hand[],
  target: number,
): TeamId | undefined {
  const t = totals(hands);
  const aReached = t.A >= target;
  const bReached = t.B >= target;
  if (aReached && bReached) return t.A >= t.B ? "A" : "B";
  if (aReached) return "A";
  if (bReached) return "B";
  return undefined;
}
