export type Suit =
  | "pique"
  | "coeur"
  | "carreau"
  | "trefle"
  | "sans-atout"
  | "tout-atout";

export type TeamId = "A" | "B";

export type CoincheLevel = "none" | "coinche" | "surcoinche";

/** Seat 0 and 2 are partners (team A), seat 1 and 3 are partners (team B). Seating order is clockwise. */
export interface Player {
  id: string;
  name: string;
  seat: 0 | 1 | 2 | 3;
  team: TeamId;
}

export interface BidEntry {
  playerId: string;
  pass: boolean;
  suit?: Suit;
  contract?: number;
}

export interface Hand {
  id: string;
  taker: TeamId;
  takerPlayerId?: string;
  suit: Suit;
  contract: number;
  takerPoints: number;
  belote: "none" | TeamId;
  coinche: CoincheLevel;
  scoreA: number;
  scoreB: number;
  chute: boolean;
  capot: boolean;
  createdAt: number;
  bidding?: BidEntry[];
}

export interface Game {
  id: string;
  teamA: string;
  teamB: string;
  target: number;
  hands: Hand[];
  createdAt: number;
  finishedAt?: number;
  winner?: TeamId;
  players?: Player[];
  dealerSeat?: number;
}

export const SUITS: Suit[] = [
  "pique",
  "coeur",
  "carreau",
  "trefle",
  "sans-atout",
  "tout-atout",
];

export const SUIT_SYMBOL: Record<Suit, string> = {
  pique: "♠",
  coeur: "♥",
  carreau: "♦",
  trefle: "♣",
  "sans-atout": "SA",
  "tout-atout": "TA",
};

export const SUIT_LABEL: Record<Suit, string> = {
  pique: "Pique",
  coeur: "Cœur",
  carreau: "Carreau",
  trefle: "Trèfle",
  "sans-atout": "Sans atout",
  "tout-atout": "Tout atout",
};

export const SUIT_COLOR: Record<Suit, string> = {
  pique: "text-white",
  coeur: "text-red-400",
  carreau: "text-red-400",
  trefle: "text-white",
  "sans-atout": "text-gold-400",
  "tout-atout": "text-gold-400",
};
