# CoincheScore

Compteur de points gratuit et sans pub pour la **coinche** et la **belote**.

- ⚡ 100% web, installable en PWA (ajouter à l'écran d'accueil sur mobile)
- 💾 Sauvegarde locale (localStorage) — la partie reprend même après fermeture
- 🃏 Coinche complète : contrats 80→160 + capot, belote, coinche/surcoinche
- 🎯 Belote classique (règle des 82 points, dedans, capot)
- 📜 Historique des parties passées

## Démarrer

```bash
npm install
npm run dev
```

Ouvre http://localhost:3000

## Déploiement

Push sur GitHub puis import sur Vercel (aucune config nécessaire).

## Règles implémentées

**Coinche**
- Contrat réussi : preneur = contrat + points faits · défense = points faits
- Chute : preneur = 0 · défense = 160 + contrat
- Capot annoncé (250) réussi = 500 pour le preneur
- Belote/rebelote = +20 (n'aide pas à valider le contrat)
- Coinche = ×2, surcoinche = ×4

**Belote**
- Preneur < 82 points → dedans (0 / 162)
- Preneur ≥ 82 → chaque équipe garde ses points
- Belote/rebelote = +20
- Capot (162) = +90 bonus
