"use client";

import { useState } from "react";
import Modal from "./Modal";

interface Props {
  open: boolean;
  onClose: () => void;
  target: number;
  onChange: (target: number) => void;
}

const PRESETS = [500, 1000, 1500, 2000, 3000];

export default function TargetModal({
  open,
  onClose,
  target,
  onChange,
}: Props) {
  const [value, setValue] = useState(String(target));

  const commit = () => {
    const n = parseInt(value) || 1000;
    onChange(Math.max(100, Math.min(9999, n)));
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Score &agrave; atteindre">
      <div className="mb-3 flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => {
              onChange(p);
              onClose();
            }}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              target === p
                ? "border-gold-500 bg-gold-500 text-felt-950"
                : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
            }`}
          >
            {p}
          </button>
        ))}
      </div>
      <label className="mb-3 block text-xs font-semibold uppercase tracking-wider text-white/60">
        Personnalis&eacute;
      </label>
      <input
        type="number"
        inputMode="numeric"
        min={100}
        max={9999}
        step={100}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-center font-display text-2xl tabular-nums text-white outline-none focus:border-gold-500"
      />
      <button
        type="button"
        onClick={commit}
        className="mt-4 w-full rounded-2xl bg-gold-500 px-6 py-3 text-base font-bold text-felt-950 transition hover:bg-gold-400 active:scale-95"
      >
        Valider
      </button>
    </Modal>
  );
}
