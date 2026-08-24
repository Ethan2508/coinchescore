export type Variant = "coinche" | "belote";

export type Suit = "pique" | "coeur" | "carreau" | "trefle" | "sans-atout" | "tout-atout";

export const SUIT_LABEL: Record<Suit, string> = {
  pique: "♠ Pique",
  coeur: "♥ Cœur",
  carreau: "♦ Carreau",
  trefle: "♣ Trèfle",
  "sans-atout": "SA (sans atout)",
  "tout-atout": "TA (tout atout)",
};

export type TeamId = "A" | "B";

export type Coinche = "none" | "coinche" | "surcoinche";

export interface Hand {
  id: string;
  index: number;
  variant: Variant;
  taker: TeamId;
  suit: Suit;
  /** Coinche only: contract announced (80..160 or 250 for capot) */
  contract?: number;
  /** Points scored by taker team, out of 162 */
  takerPoints: number;
  /** Belote/rebelote holder */
  belote: "none" | TeamId;
  /** Coinche level (coinche only) */
  coinche: Coinche;
  /** Whether this hand was a capot (all tricks taken) */
  capot: boolean;
  scoreA: number;
  scoreB: number;
  chute: boolean;
  createdAt: number;
}

export interface Game {
  id: string;
  variant: Variant;
  teamA: string;
  teamB: string;
  target: number;
  hands: Hand[];
  createdAt: number;
  finishedAt?: number;
  winner?: TeamId;
}
