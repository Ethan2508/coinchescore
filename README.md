# CoincheScore

Compteur de points gratuit et sans pub pour la **coinche**, sur le web (PWA), iOS et Android.
Version actuelle : **1.2.0**.

## Fonctionnalités

- **Calcul automatique des scores** : contrat, atout, points du preneur, belote, coinche/surcoinche, capot ; aperçu du score avant de valider.
- **Joueurs (optionnel)** : 4 places autour de la table (Nord/Sud contre Est/Ouest), roue pour tirer le premier donneur, rotation du donneur à chaque manche.
- **Sens de jeu** horaire ou anti-horaire, au choix et modifiable en cours de partie.
- **Enchères détaillées (optionnel)** : chaque annonce/passe tour par tour, avec coinche et surcoinche ; le contrat final est rempli automatiquement.
- **Score à atteindre** au choix (500 à 3000 ou libre), modifiable en cours de partie (« Prolonger » après une victoire).
- Modifier, supprimer ou annuler une manche.
- **Historique** des 50 dernières parties, avec le détail des manches et des enchères.
- **Hors ligne et sans compte** : tout est enregistré sur l'appareil (`localStorage`). Une partie en cours reprend après fermeture.
- Mises à jour à chaud gratuites des apps mobiles (voir plus bas).

## Règles de calcul

Une manche vaut **160 points**, comptés aux dizaines.

| Situation | Preneur | Défense |
| --- | --- | --- |
| Contrat (80 à 160) réussi | contrat + points faits | ses points |
| Capot non annoncé (tous les plis) | contrat + 250 | 0 |
| Chute | 0 | 160 + contrat |
| Coinché réussi / chuté | 320 + contrat / 0 | 0 / 320 + contrat |
| Capot ou Générale annoncé réussi | 500 (540 si belloté) | 0 |
| Capot ou Générale annoncé chuté | 0 | 500 |

- **Surcoinche** : double le forfait de la coinche. Pas de coinche sur un Capot ou une Générale.
- **Belote / rebelote** : +20 pour l'équipe qui l'a. Elle aide le preneur à remplir son contrat seulement s'il a fait strictement plus de points que la défense.
- **160 points n'est pas forcément un capot** : la défense peut avoir fait un pli sans points. Le capot se saisit avec son propre bouton.
- **Fin de partie** : la première équipe qui atteint le score cible gagne ; si les deux l'atteignent sur la même manche, la plus haute l'emporte.

Le calcul est dans [`lib/scoring.ts`](lib/scoring.ts). Les règles sont aussi expliquées dans l'app (page « Règles »).

## Stack

- [Next.js 16](https://nextjs.org) (App Router) en **export statique** (`output: "export"`, dossier `out/`), React 19, Tailwind CSS 4.
- [Capacitor 8](https://capacitorjs.com) pour les apps iOS et Android, qui embarquent l'export statique.
- Aucune base de données ni serveur : l'état est dans `localStorage` (`coinchescore:current`, `coinchescore:history`).

```
app/          pages : accueil, nouvelle partie, partie, historique, règles, confidentialité
components/   éditeur de manche, enchères, roue du donneur, sélecteur de score, mises à jour à chaud
lib/          calcul des scores, store (localStorage), joueurs et sens de jeu, mises à jour à chaud
ios/ android/ projets natifs Capacitor
ota/          manifeste des mises à jour à chaud (latest.json, créé à la première publication)
scripts/      build Android signé, publication des mises à jour à chaud, génération des icônes
```

## Démarrer

```bash
npm install
npm run dev
```

Puis ouvrir http://localhost:3000.

## Commandes

| Commande | Rôle |
| --- | --- |
| `npm run dev` | serveur de développement |
| `npm run build` | export statique dans `out/` |
| `npm run ios` / `npm run android` | build, synchronisation Capacitor, puis ouverture dans Xcode / Android Studio |
| `npm run cap:sync` | build + synchronisation des projets natifs |
| `npm run assets` | régénère icônes et splash screens natifs (dessins définis dans `scripts/generate-assets.mjs`) |
| `npm run live-update` | publie une mise à jour à chaud (voir plus bas) |
| `./scripts/build-android-release.sh` | génère l'AAB signé `coinchescore-release.aab` pour le Play Store |

## Publier

- **Web** : l'export statique est hébergé sur Vercel.
- **Android** : `./scripts/build-android-release.sh`, puis envoi de l'AAB dans la Play Console. Il faut la keystore et `android/app/keystore.properties` en local (non versionnés). Voir [ANDROID_STORE_GUIDE.md](ANDROID_STORE_GUIDE.md).
- **iOS** : `npm run ios`, puis Product → Archive dans Xcode.

Pour une nouvelle version store, mettre à jour la version partout : `package.json`, `android/app/build.gradle` (`versionName` / `versionCode`) et Xcode (`MARKETING_VERSION` / `CURRENT_PROJECT_VERSION`).

## Mises à jour à chaud (gratuites)

Les modifications du code web arrivent sur les téléphones **sans repasser par les stores** :

- les apps lisent `ota/latest.json` au démarrage ;
- elles téléchargent le zip joint à une Release GitHub ;
- elles l'appliquent au passage en arrière-plan ;
- si une version ne démarre pas, l'app revient toute seule à la précédente.

Le plugin open source [`@capgo/capacitor-updater`](https://github.com/Cap-go/capacitor-updater) est utilisé sans son service cloud. Pour publier, une seule commande :

```bash
npm run live-update
```

Tout est détaillé dans [LIVE_UPDATES.md](LIVE_UPDATES.md), y compris quand il faut repasser par les stores. ⚠️ **Le repo doit rester public** pour que les téléphones puissent lire les mises à jour.

## Confidentialité

Aucune donnée personnelle collectée, ni compte, ni pub, ni analytics. Seules les apps mobiles se connectent à internet, pour lire le manifeste de mise à jour sur GitHub. Détails dans la page [`/privacy`](app/privacy/page.tsx).
