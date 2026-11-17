# Mises à jour à chaud (gratuites)

Depuis la **v1.2.0 (build 3)**, l'app iOS/Android peut recevoir les modifications du code web (`app/`, `components/`, `lib/`) **sans repasser par l'App Store ni le Play Store**, et **sans aucun service payant** :

- le plugin open source [`@capgo/capacitor-updater`](https://github.com/Cap-go/capacitor-updater) (licence MPL-2.0) est utilisé en mode « No Cloud » : rien n'est envoyé à Capgo ;
- les mises à jour sont hébergées gratuitement sur ce repo GitHub : `ota/latest.json` (sur `main`) indique la dernière version, le zip est joint à une Release `ota-x.y.z`.

Fonctionnement (`components/LiveUpdates.tsx`) :

1. à l'ouverture, l'app confirme qu'elle a bien démarré (`notifyAppReady`). Si une version ne démarre pas sous 10 s, le plugin revient tout seul à la précédente, et cette version n'est plus retentée ;
2. elle lit `ota/latest.json` ; s'il y a une version plus récente **de la même série** (1.2.x pour une app installée en 1.2.0), elle la télécharge ;
3. la nouvelle version s'applique au prochain passage en arrière-plan ou redémarrage : jamais au milieu d'une partie.

Les utilisateurs encore en v1.1 (sans le plugin) ne reçoivent rien : il leur faut d'abord la v1.2.0 depuis les stores.

⚠️ **Le repo doit rester public** : sinon les téléphones ne peuvent plus lire `ota/latest.json` ni télécharger les zips.

## Publier une mise à jour à chaud

Prérequis : GitHub CLI connecté (`gh auth status`), tout commité, sur `main`.

```bash
npm run live-update
```

Le script :

1. pousse le code,
2. build l'export statique (`out/`) et le zippe,
3. crée la Release GitHub `ota-1.2.1` avec le zip,
4. met à jour `package.json` (1.2.0 → 1.2.1 → 1.2.2…) et `ota/latest.json`, commit et push.

Les téléphones la récupèrent à la prochaine ouverture de l'app (GitHub peut mettre jusqu'à 5 min à servir le nouveau `latest.json`).

## Quand faut-il repasser par les stores ?

Dès qu'on touche au natif :

- ajout ou mise à jour d'un plugin Capacitor, ou montée de version de Capacitor ;
- modification de `capacitor.config.ts` ;
- icônes, splash screen, permissions, `Info.plist`, `build.gradle`.

Dans ce cas, passer à la **version mineure suivante** :

1. `npm run version:set -- 1.3.0` (iOS, Android, `package.json` et numéros de build en une fois) ;
2. écrire les nouveautés dans `release-notes/1.3.0.txt`, puis commiter ;
3. publier : `npm run release:ios` et `./scripts/build-android-release.sh`.

Reprendre ensuite les mises à jour à chaud en 1.3.1, 1.3.2…

Les téléphones restés en 1.2.0 ignorent automatiquement les versions 1.3.x, qui pourraient dépendre du nouveau natif.

## À ne jamais faire

- Changer `appId`, `server.androidScheme` ou le hostname dans `capacitor.config.ts` : l'origine change et **tout le `localStorage` (parties, historique) est perdu**.
- Afficher dans l'app des messages du type « mise à jour en cours / téléchargement » (règles Apple sur le code téléchargé).
- Supprimer une Release `ota-*` encore référencée par `ota/latest.json`.
- Passer le repo en privé (voir plus haut).
