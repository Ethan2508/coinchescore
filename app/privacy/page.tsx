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
          Dernière mise à jour&nbsp;: novembre 2026
        </p>

        <Section title="En bref">
          <p>
            CoincheScore ne collecte aucune donnée personnelle. Toutes les
            informations (noms d&apos;équipes et de joueurs, scores, historique
            des parties) sont stockées{" "}
            <strong>uniquement sur votre appareil</strong>. Nous
            n&apos;utilisons ni compte utilisateur, ni publicité, ni tracking.
            Seule l&apos;application mobile contacte un serveur, pour vérifier
            si une nouvelle version de son contenu est disponible (voir
            ci-dessous).
          </p>
        </Section>

        <Section title="Données stockées localement">
          <p>
            L&apos;application enregistre dans le stockage local de votre
            navigateur ou de votre téléphone&nbsp;:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Le nom des équipes et, si vous les saisissez, des joueurs</li>
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
            analytique, aucun cookie tiers, aucun SDK de suivi. Le seul appel
            réseau est la vérification de mise à jour décrite ci-dessous.
          </p>
        </Section>

        <Section title="Mises à jour de l'application mobile">
          <p>
            Pour recevoir rapidement les corrections et améliorations,
            l&apos;application iOS / Android vérifie à son ouverture, auprès
            de notre prestataire <strong>Capgo</strong>, si une nouvelle
            version de son contenu est disponible, puis la télécharge.
          </p>
          <p>
            Cette vérification transmet uniquement des informations
            techniques&nbsp;: un identifiant aléatoire propre à
            l&apos;installation (non lié à votre identité), la version de
            l&apos;application et le système (iOS ou Android et sa version).{" "}
            <strong>Aucune donnée de jeu</strong> (noms, scores, historique)
            n&apos;est transmise, et aucune statistique d&apos;utilisation
            n&apos;est envoyée. La version web n&apos;effectue pas cette
            vérification.
          </p>
        </Section>

        <Section title="Permissions">
          <p>Aucune permission particulière n&apos;est demandée.</p>
        </Section>

        <Section title="Enfants">
          <p>
            L&apos;application peut être utilisée par tous les âges. Elle ne
            collecte aucune donnée personnelle, donc aucune donnée
            d&apos;enfant n&apos;est traitée.
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
