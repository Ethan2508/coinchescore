#!/bin/bash
# Prépare une nouvelle version pour les stores (iOS + Android) : même version partout et numéros de
# build incrémentés. À faire avant npm run release:ios / ./scripts/build-android-release.sh.
#
# Usage : npm run version:set -- 1.3.0
#
# La série (1.3) doit être nouvelle : les mises à jour à chaud 1.3.x ne doivent jamais atteindre une
# app installée en 1.2.0 (qui n'a pas le nouveau natif). Voir LIVE_UPDATES.md.
set -euo pipefail
cd "$(dirname "$0")/.."

NEW="${1:-}"
[[ "$NEW" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] || { echo "Usage : npm run version:set -- x.y.z (ex. 1.3.0)" >&2; exit 1; }

PBX=ios/App/App.xcodeproj/project.pbxproj
GRADLE=android/app/build.gradle
CUR_PKG=$(node -p "require('./package.json').version")
CUR_IOS=$(grep -m1 -oE 'MARKETING_VERSION = [^;]+' "$PBX" | awk '{print $3}')
IOS_BUILD=$(grep -m1 -oE 'CURRENT_PROJECT_VERSION = [0-9]+' "$PBX" | awk '{print $3}')
ANDROID_CODE=$(grep -oE 'versionCode [0-9]+' "$GRADLE" | awk '{print $2}')

node -e '
  const [nw, pkg, ios] = process.argv.slice(1).map((v) => v.split(".").map(Number));
  const cmp = (a, b) => a[0] - b[0] || a[1] - b[1] || (a[2] ?? 0) - (b[2] ?? 0);
  if (cmp(nw, pkg) <= 0) { console.error(`❌ ${nw.join(".")} doit être supérieure à package.json (${pkg.join(".")}).`); process.exit(1); }
  if (cmp([nw[0], nw[1]], [ios[0], ios[1]]) <= 0) {
    console.error(`❌ Pour une sortie store, change de série : ${ios[0]}.${ios[1]}.x → ${ios[0]}.${ios[1] + 1}.0 (sinon les mises à jour à chaud de la nouvelle version atteindraient les apps en ${ios.join(".")}).`);
    process.exit(1);
  }
' "$NEW" "$CUR_PKG" "$CUR_IOS"

NEW_IOS_BUILD=$((IOS_BUILD + 1))
NEW_ANDROID_CODE=$((ANDROID_CODE + 1))
MAJOR_MINOR=$(echo "$NEW" | cut -d. -f1-2)

npm version "$NEW" --no-git-tag-version >/dev/null
sed -i '' -E "s/MARKETING_VERSION = [^;]+;/MARKETING_VERSION = $NEW;/; s/CURRENT_PROJECT_VERSION = [0-9]+;/CURRENT_PROJECT_VERSION = $NEW_IOS_BUILD;/" "$PBX"
sed -i '' -E "s/versionCode [0-9]+/versionCode $NEW_ANDROID_CODE/; s/versionName \"[^\"]+\"/versionName \"$NEW\"/" "$GRADLE"
sed -i '' -E "s/v[0-9]+\.[0-9]+ · coinche/v$MAJOR_MINOR · coinche/" app/page.tsx

mkdir -p release-notes
NOTES="release-notes/$NEW.txt"
[ -f "$NOTES" ] || printf '• À REMPLIR : nouveautés de la version %s (affichées sur les stores)\n' "$NEW" >"$NOTES"

echo "✔ Version $NEW"
echo "  package.json : $CUR_PKG → $NEW"
echo "  iOS          : $CUR_IOS ($IOS_BUILD) → $NEW ($NEW_IOS_BUILD)"
echo "  Android      : versionCode $ANDROID_CODE → $NEW_ANDROID_CODE, versionName $NEW"
echo "  Accueil      : v$MAJOR_MINOR"
echo ""
echo "Ensuite :"
echo "  1. écris les nouveautés dans $NOTES"
echo "  2. git commit -am \"Bump version to $NEW\" (+ git add $NOTES)"
echo "  3. npm run release:ios   et   ./scripts/build-android-release.sh"
