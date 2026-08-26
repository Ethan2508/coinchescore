"use client";

import { useState } from "react";
import HeaderBar from "@/components/HeaderBar";

type Tab = "coinche" | "belote";

export default function RulesPage() {
  const [tab, setTab] = useState<Tab>("coinche");

  return (
    <main className="mx-auto min-h-[100dvh] max-w-md p-4 sm:p-6">
      <HeaderBar title="Règles" back="/" />

      <div className="mb-4 grid grid-cols-2 gap-1 rounded-xl bg-black/30 p-1">
        {(["coinche", "belote"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-lg px-3 py-2 text-sm font-semibold capitalize transition ${
              tab === t
                ? "bg-gold-500 text-felt-950"
                : "text-white/70 hover:bg-white/5"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "coinche" ? <CoincheRules /> : <BeloteRules />}
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-4">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gold-400">
        {title}
      </h3>
      <div className="text-sm leading-relaxed text-white/80">{children}</div>
    </section>
  );
}

function CoincheRules() {
  return (
    <div>
      <Section title="But du jeu">
        4 joueurs, 2 équipes de 2. Première équipe à atteindre le score fixé
        (généralement 1&nbsp;000, 1&nbsp;500 ou 2&nbsp;000 pts) remporte la
        partie.
      </Section>

      <Section title="Enchères">
        Chaque joueur annonce à son tour un contrat de <strong>80 à 160</strong>{" "}
        (par pas de 10), ou <strong>Capot</strong> (250) ou{" "}
        <strong>Générale</strong> (500), ou passe. Le preneur choisit la
        couleur d’atout (♠ ♥ ♦ ♣, sans atout ou tout atout).
      </Section>

      <Section title="Capot / Générale bellotés">
        Variantes annoncées avec la belote-rebelote (R+D d’atout dans la main
        du preneur)&nbsp;:
        <ul className="mt-1 list-disc space-y-1 pl-5">
          <li>
            <strong>Capot belloté</strong> réussi&nbsp;: 540 pts.
          </li>
          <li>
            <strong>Générale bellotée</strong> réussie&nbsp;: 540 pts.
          </li>
          <li>
            Belote naturelle sur un Capot / Générale non annoncé&nbsp;: 500 +
            20 = 520 pts.
          </li>
        </ul>
      </Section>

      <Section title="Points d’une manche">
        Total de <strong>160 points</strong> répartis entre les 2 équipes
        (arrondi aux dizaines à la table). À l’atout, les cartes valent
        plus&nbsp;:
        <br />
        <span className="text-white/70">
          Valet 20 · 9 14 · As 11 · 10 10 · R 4 · D 3
        </span>
        <br />
        Hors atout&nbsp;:{" "}
        <span className="text-white/70">
          As 11 · 10 10 · R 4 · D 3 · V 2 · 9/8/7 0
        </span>
      </Section>

      <Section title="Résultat">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Contrat réussi</strong> (preneur ≥ contrat)&nbsp;:
            preneur = <em>contrat + points faits</em>, défense = points faits.
          </li>
          <li>
            <strong>Chute</strong>&nbsp;: preneur = 0, défense ={" "}
            <em>160 + contrat</em>.
          </li>
          <li>
            <strong>Capot annoncé et réussi</strong>&nbsp;: 500 pts pour le
            preneur.
          </li>
          <li>
            <strong>Belote / Rebelote</strong> (R+D d’atout dans une même
            main)&nbsp;: +20 pour l’équipe qui les a. Elle compte aussi pour
            valider le contrat, <strong>sauf</strong> si la défense fait
            autant ou plus de points que le preneur (aux dizaines) — dans ce
            cas, la belote ne sauve pas la chute.
          </li>
          <li>
            <strong>Coinche</strong> ×2, <strong>Surcoinche</strong> ×4 sur le
            score final de la manche.
          </li>
        </ul>
      </Section>
    </div>
  );
}

function BeloteRules() {
  return (
    <div>
      <Section title="But du jeu">
        Comme la coinche mais sans enchères. Le preneur doit faire au moins{" "}
        <strong>82 points</strong> pour valider la manche.
      </Section>

      <Section title="Prise">
        Le donneur retourne une carte. Chaque joueur passe ou prend pour choisir
        cette couleur comme atout. Si tout le monde passe, deuxième tour libre
        (autre couleur).
      </Section>

      <Section title="Résultat">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Preneur ≥ 82</strong>&nbsp;: chaque équipe garde ses points
            faits (160 au total).
          </li>
          <li>
            <strong>Preneur &lt; 82</strong> («&nbsp;dedans&nbsp;»)&nbsp;:
            preneur = 0, défense = 160.
          </li>
          <li>
            <strong>Capot</strong> (tous les plis)&nbsp;: +90 pts en bonus.
          </li>
          <li>
            <strong>Belote / Rebelote</strong>&nbsp;: +20 pour l’équipe qui les
            a.
          </li>
        </ul>
      </Section>

      <Section title="Fin de partie">
        Première équipe à atteindre le score fixé (souvent 501 ou 1&nbsp;000
        pts).
      </Section>
    </div>
  );
}
