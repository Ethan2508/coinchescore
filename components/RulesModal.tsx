"use client";

import { useState } from "react";
import Modal from "./Modal";

interface Props {
  open: boolean;
  onClose: () => void;
}

type Tab = "coinche" | "belote";

export default function RulesModal({ open, onClose }: Props) {
  const [tab, setTab] = useState<Tab>("coinche");

  return (
    <Modal open={open} onClose={onClose} title="R&egrave;gles">
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
    </Modal>
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
    <section className="mb-4">
      <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-gold-400">
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
        Atteindre le score fix&eacute; (souvent 1&nbsp;000, 1&nbsp;500 ou
        2&nbsp;000 points) en cumulant les points de plusieurs manches.
        4&nbsp;joueurs, 2&nbsp;&eacute;quipes.
      </Section>

      <Section title="Enchères">
        Les joueurs annoncent un contrat de <strong>80 &agrave; 160</strong>{" "}
        (par pas de 10) puis <strong>Capot</strong> (250) et{" "}
        <strong>G&eacute;n&eacute;rale</strong> (500). Le preneur choisit la
        couleur d&apos;atout.
      </Section>

      <Section title="Points d'une manche">
        Total de <strong>162 points</strong> (avec le 10 de der).
        <br />
        L&apos;atout compte plus&nbsp;:{" "}
        <span className="text-white/70">
          Valet 20, 9 14, As 11, 10 10, R 4, D 3, V 2 (non-atout)
        </span>
        .
      </Section>

      <Section title="R&eacute;sultat">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Contrat r&eacute;ussi</strong> (preneur &ge; contrat)&nbsp;:
            preneur gagne <em>contrat + points faits</em>, d&eacute;fense garde
            ses points.
          </li>
          <li>
            <strong>Chute</strong>&nbsp;: preneur =&nbsp;0, d&eacute;fense
            =&nbsp;<em>160&nbsp;+ contrat</em>.
          </li>
          <li>
            <strong>Capot annonc&eacute; et r&eacute;ussi</strong>&nbsp;:
            500&nbsp;pts au preneur.
          </li>
          <li>
            <strong>Belote/Rebelote</strong> (R+D d&apos;atout)&nbsp;: +20 pour
            l&apos;&eacute;quipe qui les a.
          </li>
          <li>
            <strong>Coinche</strong> &times;2, <strong>Surcoinche</strong>{" "}
            &times;4 sur le score final de la manche.
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
        M&ecirc;me principe que la coinche mais sans ench&egrave;res. Le
        preneur doit r&eacute;aliser au moins <strong>82&nbsp;points</strong>{" "}
        pour valider la manche.
      </Section>

      <Section title="Prise">
        Le donneur retourne la premi&egrave;re carte. Chaque joueur passe ou{" "}
        <strong>prend</strong> pour choisir cette couleur comme atout. Si tout
        le monde passe, deuxi&egrave;me tour libre.
      </Section>

      <Section title="Points d'une manche">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Preneur r&eacute;ussit</strong> (&ge; 82)&nbsp;: chaque
            &eacute;quipe garde ses points faits (total 162).
          </li>
          <li>
            <strong>Preneur &laquo;&nbsp;dedans&nbsp;&raquo;</strong> (&lt; 82)&nbsp;:
            preneur = 0, d&eacute;fense = 162.
          </li>
          <li>
            <strong>Capot</strong> (tous les plis)&nbsp;: +90 pts en bonus.
          </li>
          <li>
            <strong>Belote/Rebelote</strong>&nbsp;: +20 pour l&apos;&eacute;quipe
            qui les a.
          </li>
        </ul>
      </Section>

      <Section title="Fin de partie">
        Premi&egrave;re &eacute;quipe &agrave; atteindre le score fix&eacute;
        (souvent 501 ou 1&nbsp;000).
      </Section>
    </div>
  );
}
