# Mises à jour à chaud (Capgo)

Depuis la **v1.2.0 (build 3)**, l'app iOS/Android embarque [Capgo](https://capgo.app) (`@capgo/capacitor-updater`).
Tout ce qui est dans `app/`, `components/`, `lib/` (le code web) peut être envoyé aux téléphones **sans repasser par l'App Store ni le Play Store** :

- l'app vérifie au passage au premier plan s'il y a une nouvelle version, la télécharge,
- et l'applique la prochaine fois qu'elle passe en arrière-plan.
- Si la nouvelle version ne démarre pas (`notifyAppReady()` non appelé sous 10 s, voir `components/LiveUpdateReady.tsx`), l'app revient automatiquement à la version précédente.

Les utilisateurs encore en v1.1 (sans le plugin) ne reçoivent rien : il leur faut d'abord la v1.2.0 depuis les stores.

## Mise en place (une seule fois)

1. Créer un compte sur https://capgo.app/register (essai 14 jours sans carte ; ensuite plan Solo ≈ 14 $/mois ou 12 $/mois en annuel, 2 000 utilisateurs actifs/mois. Tarifs vérifiés en nov. 2026 sur https://capgo.app/pricing).
2. Créer une clé API : https://console.capgo.app/dashboard/apikeys
3. Dans le projet :
   ```bash
   npx @capgo/cli@latest login <CLE_API>
   npx @capgo/cli@latest app add app.coinchescore --name "CoincheScore" --icon resources/icon-512.png
   npx @capgo/cli@latest channel add production app.coinchescore --default
   ```
   Si l'identifiant `app.coinchescore` est refusé (déjà pris), ajouter `appId: "<id donné par Capgo>"` dans `plugins.CapacitorUpdater` de `capacitor.config.ts` **avant** de publier la 1.2.0 sur les stores.
4. Publier la **1.2.0 (build 3)** sur l'App Store et le Play Store (`./scripts/build-android-release.sh` pour Android, Archive dans Xcode pour iOS).
5. Mettre à jour les déclarations de confidentialité, puisque l'app contacte maintenant un serveur :
   - **App Store Connect → Confidentialité de l'app** : « Identifiants → ID d'appareil », usage *Fonctionnalité de l'app*, **non lié** à l'utilisateur, **pas de suivi**.
   - **Play Console → Sécurité des données** : « Identifiants d'appareil ou autres », collecté, usage *Fonctionnalité de l'app*, non partagé, pas de suivi.
   - La page `/privacy` de l'app est déjà à jour.
6. (Optionnel) Juste après la sortie store, envoyer le bundle 1.2.0 comme référence pour les contrôles de compatibilité du CLI :
   `npm run build && npx @capgo/cli@latest bundle upload --channel production`

## Publier une mise à jour à chaud

```bash
npm run live-update
git commit -am "Live update 1.2.x" && git push
```

Le script incrémente la version de `package.json` (1.2.0 → 1.2.1 → 1.2.2…), build l'export statique (`out/`) et l'envoie sur le canal `production`.
Les téléphones la récupèrent à la prochaine ouverture de l'app.

Règles de version : un bundle doit avoir **le même numéro majeur** que l'app installée depuis le store et **une version plus haute**. C'est pourquoi les versions natives sont au format `x.y.z` (1.2.0) et que `package.json` suit.

## Quand faut-il repasser par les stores ?

Dès qu'on touche au natif :

- ajout ou mise à jour d'un plugin Capacitor, ou montée de version de Capacitor ;
- modification de `capacitor.config.ts` (y compris les options Capgo) ;
- icônes, splash screen, permissions, `Info.plist`, `build.gradle`.

Dans ce cas : passer à la version mineure suivante partout (ex. **1.3.0**, build 4) dans `package.json`, `android/app/build.gradle` (`versionName`/`versionCode`) et Xcode (`MARKETING_VERSION`/`CURRENT_PROJECT_VERSION`), publier sur les stores, puis reprendre les mises à jour à chaud en 1.3.1, 1.3.2…
Pour que les bundles 1.3.x n'arrivent jamais sur des téléphones en 1.2.0 (qui n'auraient pas le nouveau natif) :
`npx @capgo/cli@latest channel set production app.coinchescore --disable-auto-update minor`

## À ne jamais faire

- Changer `appId`, `server.androidScheme` ou le hostname dans `capacitor.config.ts` : l'origine change et **tout le `localStorage` (parties, historique) est perdu**.
- Afficher dans l'app des messages du type « mise à jour en cours / téléchargement » (règles Apple sur le code téléchargé).
- Utiliser `--auto-bump` ou `--auto-set-bundle` du CLI : ils peuvent produire une version inférieure à la version store, ou écrire dans `capacitor.config.ts`.
