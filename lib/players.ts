import type { Player, TeamId } from "./types";

/** Clockwise seat order: 0 (top), 1 (right), 2 (bottom), 3 (left). Opposite seats are partners. */
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

export function nextDealerSeat(current: number): number {
  return (current + 1) % 4;
}

export function playerAtSeat(players: Player[], seat: number): Player | undefined {
  return players.find((p) => p.seat === seat);
}

/** Player who speaks first in the bidding round: next seat clockwise after the dealer. */
export function firstToBidSeat(dealerSeat: number): number {
  return nextDealerSeat(dealerSeat);
}

export function playerLabel(players: Player[] | undefined, playerId: string | undefined, teamA: string, teamB: string, team: TeamId): string {
  if (!playerId || !players) return team === "A" ? teamA : teamB;
  const player = players.find((p) => p.id === playerId);
  if (!player) return team === "A" ? teamA : teamB;
  const teamName = player.team === "A" ? teamA : teamB;
  return `${player.name} (${teamName})`;
}
