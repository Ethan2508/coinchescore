"use client";

import { useState } from "react";

export const TARGET_PRESETS = [500, 1000, 1500, 2000, 3000];
export const MIN_TARGET = 100;
export const MAX_TARGET = 9999;

interface Props {
  value: number;
  /** Called only with valid targets (MIN_TARGET..MAX_TARGET). */
  onChange: (target: number) => void;
}

export default function TargetPicker({ value, onChange }: Props) {
  // Free-text draft so the field can be cleared while typing without snapping back.
  const [text, setText] = useState(String(value));

  const pick = (n: number) => {
    setText(String(n));
    onChange(n);
  };

  const n = Number(text);
  const invalid = text !== "" && !(n >= MIN_TARGET && n <= MAX_TARGET);

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        {TARGET_PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => pick(p)}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
              value === p
                ? "border-gold-500 bg-gold-500 text-felt-950"
                : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            {p}
          </button>
        ))}
      </div>
      <input
        type="number"
        inputMode="numeric"
        aria-label="Score à atteindre"
        value={text}
        min={MIN_TARGET}
        max={MAX_TARGET}
        step={100}
        onChange={(e) => {
          setText(e.target.value);
          const next = Number(e.target.value);
          if (next >= MIN_TARGET && next <= MAX_TARGET) onChange(next);
        }}
        className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-base text-white outline-none focus:border-gold-500"
      />
      {invalid && (
        <p className="mt-2 text-xs text-yellow-300/80">
          Entre {MIN_TARGET} et {MAX_TARGET} points.
        </p>
      )}
    </div>
  );
}
