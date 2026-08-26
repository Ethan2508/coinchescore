export type Suit =
  | "pique"
  | "coeur"
  | "carreau"
  | "trefle"
  | "sans-atout"
  | "tout-atout";

export type TeamId = "A" | "B";

export type CoincheLevel = "none" | "coinche" | "surcoinche";

export interface Hand {
  id: string;
  taker: TeamId;
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
