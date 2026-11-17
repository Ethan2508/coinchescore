import type { Direction, Player, TeamId } from "./types";

/** Seats numbered clockwise: 0 (top), 1 (right), 2 (bottom), 3 (left). Opposite seats are partners. */
export const SEAT_LABELS = ["Nord", "Est", "Sud", "Ouest"] as const;

export function makePlayers(names: [string, string, string, string]): Player[] {
  const teams: TeamId[] = ["A", "B", "A", "B"];
  return names.map((name, i) => ({
    id: `p${i}`,
    name: name.trim(),
    seat: i as 0 | 1 | 2 | 3,
    team: teams[i],
  }));
}

export function hasPlayers(players?: Player[]): players is Player[] {
  return !!players && players.length === 4 && players.every((p) => p.name);
}

/** Next seat in turn order. Seats are numbered clockwise, so counterclockwise steps backwards. */
export function nextSeat(current: number, direction: Direction = "clockwise"): number {
  return direction === "clockwise" ? (current + 1) % 4 : (current + 3) % 4;
}

export const DIRECTION_LABEL: Record<Direction, string> = {
  clockwise: "Horaire",
  counterclockwise: "Anti-horaire",
};

export const DIRECTION_SYMBOL: Record<Direction, string> = {
  clockwise: "↻",
  counterclockwise: "↺",
};

export function prevSeat(current: number, direction: Direction = "clockwise"): number {
  return nextSeat(current, direction === "clockwise" ? "counterclockwise" : "clockwise");
}

export function playerAtSeat(players: Player[], seat: number): Player | undefined {
  return players.find((p) => p.seat === seat);
}

/** Player who speaks first in the bidding round: next seat after the dealer in turn order. */
export function firstToBidSeat(dealerSeat: number, direction: Direction = "clockwise"): number {
  return nextSeat(dealerSeat, direction);
}

export function playerLabel(players: Player[] | undefined, playerId: string | undefined, teamA: string, teamB: string, team: TeamId): string {
  if (!playerId || !players) return team === "A" ? teamA : teamB;
  const player = players.find((p) => p.id === playerId);
  if (!player) return team === "A" ? teamA : teamB;
  const teamName = player.team === "A" ? teamA : teamB;
  return `${player.name} (${teamName})`;
}
