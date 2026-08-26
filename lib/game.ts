export interface Row {
  id: string;
  a: string;
  b: string;
}

export interface PastGame {
  id: string;
  teamA: string;
  teamB: string;
  target: number;
  rows: Row[];
  createdAt: number;
  finishedAt: number;
  totalA: number;
  totalB: number;
  winner: "A" | "B" | null;
}

export interface GameState {
  teamA: string;
  teamB: string;
  target: number;
  rows: Row[];
  startedAt: number;
  history: PastGame[];
}

export function emptyRow(): Row {
  return { id: crypto.randomUUID(), a: "", b: "" };
}

export function initialState(): GameState {
  return {
    teamA: "Nous",
    teamB: "Eux",
    target: 1000,
    rows: [emptyRow()],
    startedAt: Date.now(),
    history: [],
  };
}

export function ensureTrailingEmpty(rows: Row[]): Row[] {
  const last = rows[rows.length - 1];
  if (!last || last.a !== "" || last.b !== "") return [...rows, emptyRow()];
  return rows;
}

export function computeTotals(rows: Row[]): { a: number; b: number } {
  return rows.reduce(
    (acc, r) => ({
      a: acc.a + (parseInt(r.a) || 0),
      b: acc.b + (parseInt(r.b) || 0),
    }),
    { a: 0, b: 0 },
  );
}

export function detectWinner(
  totalA: number,
  totalB: number,
  target: number,
): "A" | "B" | null {
  const aReached = totalA >= target;
  const bReached = totalB >= target;
  if (aReached && bReached) return totalA >= totalB ? "A" : "B";
  if (aReached) return "A";
  if (bReached) return "B";
  return null;
}
