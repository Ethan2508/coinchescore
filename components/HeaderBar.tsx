"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

interface Props {
  title: string;
  back?: string | true;
  right?: React.ReactNode;
}

export default function HeaderBar({ title, back, right }: Props) {
  const router = useRouter();
  const showBack = back !== undefined;

  return (
    <header className="mb-4 flex items-center gap-3">
      {showBack &&
        (typeof back === "string" ? (
          <Link
            href={back}
            aria-label="Retour"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
          >
            ‹
          </Link>
        ) : (
          <button
            type="button"
            aria-label="Retour"
            onClick={() => router.back()}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-lg text-white/80 hover:bg-white/10"
          >
            ‹
          </button>
        ))}
      <h1 className="flex-1 truncate font-display text-xl font-bold sm:text-2xl">
        {title}
      </h1>
      {right}
    </header>
  );
}
