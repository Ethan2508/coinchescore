# CoincheScore — Guide de soumission Play Store

## 🔐 CRITIQUE : sauvegarde la keystore AVANT toute chose

Fichier généré : `android/app/coinchescore-release.keystore`  
Backup posé sur ton **Bureau** : `~/Desktop/coinchescore-KEYSTORE-BACKUP.keystore`

**Mot de passe (identique pour keystore et key)** :
```
W8oxlqxju9NtJcg06lhBDZMI
```

**Alias** : `coinchescore`

### À faire ABSOLUMENT
- Copie `coinchescore-KEYSTORE-BACKUP.keystore` sur iCloud Drive / Google Drive / clé USB
- Note le mot de passe dans ton gestionnaire de mots de passe (1Password / Trousseau / Bitwarden)
- Si tu perds ce fichier + mot de passe → **impossible** de mettre à jour l'app sur le Play Store (il faudrait la republier comme une nouvelle app)

Le fichier est déjà **gitignoré**, donc pas de risque de commit accidentel.

---

## 📦 Le fichier à uploader

**`coinchescore-release.aab`** à la racine du projet (5.5 Mo)

Pour re-générer (si tu changes le code plus tard) : `./scripts/build-android-release.sh`

---

## 🎯 Étapes sur Google Play Console

### 1. Créer l'app sur Play Console

1. Va sur [play.google.com/console](https://play.google.com/console)
2. Clique **Créer une application**
3. Remplis :
   - **Nom** : `CoincheScore`
   - **Langue par défaut** : Français (France)
   - **Type** : Application
   - **Gratuite ou payante** : Gratuite
   - Coche les 2 déclarations (règles + politiques US export)
4. **Créer l'application**

### 2. Fiche du Play Store (Store listing)

Menu de gauche → **Grow → Store presence → Main store listing** :

**App name**
```
CoincheScore
```

**Short description** (80 caractères max)
```
Compteur de points coinche et belote. Gratuit, sans pub, hors ligne.
```

**Full description** (4000 caractères max)
```
CoincheScore est le compteur de points le plus simple et le plus rapide pour jouer a la coinche et a la belote. Fait par un joueur, pour les joueurs.

FONCTIONNALITES

- Saisie de manche en 5 secondes
Choisissez le preneur, la couleur d'atout (Pique, Coeur, Carreau, Trefle, Sans atout, Tout atout), le contrat annonce, les points realises (arrondis aux dizaines comme a la table), la belote-rebelote et la coinche. L'application calcule tout automatiquement.

- Tous les contrats
De 80 a 160, Capot (500), Capot bellote (540), Generale (500), Generale bellotee (540). Coinche et Surcoinche gerees avec la regle du forfait 320 + contrat annonce.

- Score cible configurable
1000, 1500, 2000, 3000 ou score personnalise. Detection automatique du vainqueur avec banniere de victoire.

- Historique complet par partie
Toutes les manches jouees avec l'atout, le contrat, la belote, les chutes et les capots. Consultez vos anciennes parties a tout moment.

- Modifier ou supprimer une manche
Trompe sur un score ? Un tap sur la manche, vous corrigez.

- Regles integrees coinche et belote
Un rappel des regles a portee de main pour trancher les debats a la table.

- Zero pub, zero compte, zero tracking
Toutes les donnees restent sur votre telephone. Aucune inscription, aucun acces Internet requis en jeu, aucune publicite.

- Fonctionne hors ligne
Sauvegarde automatique. Fermez l'application, reprenez ou vous en etiez.

Ideal pour les soirees entre amis, en famille, au bistrot ou en tournoi.
```

**Icon 512×512 PNG** : Google Play attend un carré 512×512.
- Le fichier existe dans `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png` (192×192) — trop petit.
- Utilise plutôt `resources/icon.png` (1024×1024) et redimensionne à 512×512 :
```bash
sips -z 512 512 resources/icon.png --out resources/icon-512.png
```

**Feature graphic** (bannière 1024×500) : à créer. Simple sur Canva.com : fond vert foncé, gros logo pique doré, texte "CoincheScore — Coinche & Belote".  
Si tu veux qu'on en génère une propre : demande-moi demain.

**Phone screenshots** (min 2, max 8, ratio 16:9 ou 9:16, entre 320px et 3840px) :  
Tes screenshots iPhone (1284×2778) fonctionnent → uploade-les directement.

**Tablet screenshots** : optionnel, tu peux zapper.

---

### 3. Catégorisation

Menu → **Store presence → Store listing → App category** :
- **Application type** : Games
- **Category** : Cards

---

### 4. Confidentialité de l'app

Menu → **Policy → App content** :

- **Privacy policy URL** :
  ```
  https://coinchescore.vercel.app/privacy
  ```

- **App access** : "All functionality is available without special access"
- **Ads** : "No, my app does not contain ads"
- **Content rating** : réponds au questionnaire → NON à tout → classement PEGI 3 automatique
- **Target audience and content** : 13 ans et +
- **News app** : No
- **COVID-19 tracing** : No
- **Data safety** :
  - Clic **Start** sur la section
  - "Does your app collect or share any of the required user data?" → **No**
  - "Is all of the user data collected by your app encrypted in transit?" → **Yes** (HTTPS système)
  - "Do you provide a way for users to request that their data be deleted?" → **No** (rien à supprimer, tout est local)
  - Save

---

### 5. Distribution (production release)

Menu → **Production → Create new release** :
1. **Upload le fichier** : `coinchescore-release.aab` (à la racine du projet)
   - Play Console va traiter l'AAB (~2-5 min)
   - Confirme si Play te propose de gérer la clé de signature d'app (**Play App Signing**) → clique **Continue** / **Accept**
2. **Release name** : `1.0.0` (auto-rempli)
3. **Release notes (fr-FR)** :
   ```
   Premiere version publique de CoincheScore.
   Compteur de points coinche et belote avec calcul automatique, historique complet, regles integrees. Hors ligne, sans pub.
   ```
4. **Save** → **Review release**
5. **Start rollout to production**

---

### 6. Countries and pricing

Menu → **Grow → Countries/regions** :
- Sélectionne les pays où tu veux distribuer (recommandé : Tous les pays / France + pays francophones)

Menu → **Monetize → Products → Prices** : gratuit, rien à faire.

---

## ⏱️ Délais Google Play

- Review Google : **quelques heures à 3 jours** (souvent moins de 24h)
- L'app apparaît sur le store dès l'approbation

---

## 📱 Comment ré-builder pour une mise à jour

Quand tu voudras publier une v1.1 :

1. Incrémente le **versionCode** et **versionName** dans `android/app/build.gradle` :
   ```gradle
   versionCode 2
   versionName "1.1"
   ```
2. Lance :
   ```bash
   ./scripts/build-android-release.sh
   ```
3. Upload le nouvel `coinchescore-release.aab` dans Play Console → Production → Create new release

---

## ❓ Support

Si Play Console te refuse quelque chose ou si un truc coince, envoie-moi le message d'erreur ou un screenshot et on corrige.

Bonne soumission ! 🃏
