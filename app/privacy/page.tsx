import HeaderBar from "@/components/HeaderBar";

export const metadata = {
  title: "Politique de confidentialité — CoincheScore",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto min-h-[100dvh] max-w-md p-4 sm:p-6">
      <HeaderBar title="Confidentialité" back="/" />

      <div className="prose prose-invert max-w-none text-sm leading-relaxed text-white/80">
        <p className="mb-3 text-xs text-white/50">
          Dernière mise à jour&nbsp;: août 2026
        </p>

        <Section title="En bref">
          <p>
            CoincheScore ne collecte aucune donnée personnelle. Toutes les
            informations (noms d&apos;équipes, scores, historique des parties)
            sont stockées <strong>uniquement sur votre appareil</strong>. Nous
            n&apos;utilisons ni compte utilisateur, ni serveur, ni publicité,
            ni tracking.
          </p>
        </Section>

        <Section title="Données stockées localement">
          <p>
            L&apos;application enregistre dans le stockage local de votre
            navigateur ou de votre téléphone&nbsp;:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Le nom des équipes</li>
            <li>Le score cible de la partie</li>
            <li>Les manches (contrat, atout, points, belote, coinche)</li>
            <li>L&apos;historique des parties archivées</li>
          </ul>
          <p className="mt-2">
            Ces données <strong>ne quittent jamais votre appareil</strong>.
            Elles peuvent être effacées à tout moment via la fonction
            «&nbsp;Effacer l&apos;historique&nbsp;» dans l&apos;application, ou
            en supprimant les données du site / de l&apos;application depuis
            les réglages de votre navigateur ou de votre téléphone.
          </p>
        </Section>

        <Section title="Aucun tracking, aucune publicité">
          <p>
            L&apos;application ne contient&nbsp;: aucune publicité, aucune
            analytique, aucun cookie tiers, aucun SDK de suivi, aucun appel
            réseau externe pendant le jeu.
          </p>
        </Section>

        <Section title="Permissions">
          <p>Aucune permission particulière n&apos;est demandée.</p>
        </Section>

        <Section title="Enfants">
          <p>
            L&apos;application peut être utilisée par tous les âges. Elle ne
            collecte aucune donnée, donc aucune donnée d&apos;enfant
            n&apos;est traitée.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Pour toute question concernant cette politique&nbsp;:{" "}
            <a
              href="mailto:contact@coinchescore.app"
              className="text-gold-400 underline"
            >
              contact@coinchescore.app
            </a>
          </p>
        </Section>
      </div>
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
    <section className="mb-6">
      <h2 className="mb-2 font-display text-base font-bold text-gold-400">
        {title}
      </h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}
