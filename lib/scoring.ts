import type { CoincheLevel, Hand, TeamId } from "./types";

export const HAND_TOTAL = 160;
export const HAND_STEP = 10;
export const CAPOT_CONTRACT = 250;
export const CAPOT_BELLOTE_CONTRACT = 251;
export const GENERALE_CONTRACT = 500;
export const GENERALE_BELLOTE_CONTRACT = 501;

export const CONTRACTS = [
  80,
  90,
  100,
  110,
  120,
  130,
  140,
  150,
  160,
  CAPOT_CONTRACT,
  CAPOT_BELLOTE_CONTRACT,
  GENERALE_CONTRACT,
  GENERALE_BELLOTE_CONTRACT,
] as const;

export function isCapotFamily(contract: number): boolean {
  return (
    contract === CAPOT_CONTRACT || contract === CAPOT_BELLOTE_CONTRACT
  );
}

export function isGeneraleFamily(contract: number): boolean {
  return (
    contract === GENERALE_CONTRACT || contract === GENERALE_BELLOTE_CONTRACT
  );
}

export function isAllTricksContract(contract: number): boolean {
  return isCapotFamily(contract) || isGeneraleFamily(contract);
}

export function isBelotAnnounced(contract: number): boolean {
  return (
    contract === CAPOT_BELLOTE_CONTRACT ||
    contract === GENERALE_BELLOTE_CONTRACT
  );
}

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

export function computeScore(input: ScoreInput): ScoreResult {
  const takerPts = clamp(input.takerPoints, 0, HAND_TOTAL);
  const defensePts = HAND_TOTAL - takerPts;
  const allTricks = isAllTricksContract(input.contract);
  const belotAnnounced = isBelotAnnounced(input.contract);
  const coinched = !allTricks && input.coinche !== "none";
  const surMult = input.coinche === "surcoinche" ? 2 : 1;
  const capot = takerPts === HAND_TOTAL;

  let takerScore = 0;
  let defenseScore = 0;
  let chute = false;

  if (isGeneraleFamily(input.contract)) {
    if (capot) {
      takerScore = belotAnnounced ? 540 : 500;
    } else {
      chute = true;
      defenseScore = 160 + GENERALE_CONTRACT;
    }
  } else if (isCapotFamily(input.contract)) {
    if (capot) {
      takerScore = belotAnnounced ? 540 : 500;
    } else {
      chute = true;
      defenseScore = 160 + CAPOT_CONTRACT;
    }
  } else {
    const belotHelpsTaker =
      input.belote === input.taker && takerPts > defensePts;
    const effectiveTakerForContract =
      takerPts + (belotHelpsTaker ? 20 : 0);
    const made = effectiveTakerForContract >= input.contract;

    if (coinched) {
      const coincheScore = (320 + input.contract) * surMult;
      if (made) {
        takerScore = coincheScore;
        defenseScore = 0;
      } else {
        chute = true;
        takerScore = 0;
        defenseScore = coincheScore;
      }
    } else if (made) {
      takerScore = input.contract + takerPts;
      defenseScore = defensePts;
      if (capot) takerScore += 90;
    } else {
      chute = true;
      defenseScore = 160 + input.contract;
    }
  }

  if (input.belote !== "none" && !belotAnnounced) {
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
  if (contract === CAPOT_BELLOTE_CONTRACT) return "Capot belloté";
  if (contract === GENERALE_CONTRACT) return "Générale";
  if (contract === GENERALE_BELLOTE_CONTRACT) return "Générale bellotée";
  return String(contract);
}

export function contractShortLabel(contract: number): string {
  if (contract === CAPOT_CONTRACT) return "Cap";
  if (contract === CAPOT_BELLOTE_CONTRACT) return "Cap.B";
  if (contract === GENERALE_CONTRACT) return "Gén";
  if (contract === GENERALE_BELLOTE_CONTRACT) return "Gén.B";
  return String(contract);
}
