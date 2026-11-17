#!/bin/bash
# Publie une mise à jour à chaud gratuite (voir LIVE_UPDATES.md) :
#   1. build l'export statique et le zippe,
#   2. crée une Release GitHub "ota-x.y.z" avec le zip,
#   3. met à jour ota/latest.json + package.json, commit et push.
# Les téléphones lisent ota/latest.json à l'ouverture de l'app.
set -euo pipefail
cd "$(dirname "$0")/.."

if [ "$(git rev-parse --abbrev-ref HEAD)" != "main" ]; then
  echo "❌ Lance ce script depuis la branche main." >&2
  exit 1
fi
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "❌ Des modifications ne sont pas commitées. Commite-les d'abord." >&2
  exit 1
fi
gh auth status >/dev/null 2>&1 || { echo "❌ GitHub CLI non connecté : lance 'gh auth login'." >&2; exit 1; }

REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
VERSION=$(node -p "const [a,b,c]=require('./package.json').version.split('.').map(Number); [a,b,c+1].join('.')")
TAG="ota-$VERSION"
ZIP="bundle-$VERSION.zip"
WORK=$(mktemp -d)
trap 'rm -rf "${WORK:?}"' EXIT

echo "→ Mise à jour à chaud $VERSION"
echo "→ Push du code..."
git push -q origin main

echo "→ Build..."
npm run build >/dev/null
[ -f out/index.html ] || { echo "❌ out/index.html introuvable après le build." >&2; exit 1; }
(cd out && zip -qr "$WORK/$ZIP" .)
CHECKSUM=$(shasum -a 256 "$WORK/$ZIP" | cut -d' ' -f1)

echo "→ Release GitHub $TAG..."
gh release create "$TAG" "$WORK/$ZIP" \
  --repo "$REPO" \
  --target "$(git rev-parse HEAD)" \
  --title "Mise à jour $VERSION" \
  --notes "Mise à jour à chaud de l'app (contenu web). Publiée par scripts/live-update.sh." \
  --latest=false >/dev/null

echo "→ Publication de ota/latest.json..."
npm version "$VERSION" --no-git-tag-version >/dev/null
mkdir -p ota
cat > ota/latest.json <<EOF
{
  "version": "$VERSION",
  "url": "https://github.com/$REPO/releases/download/$TAG/$ZIP",
  "checksum": "$CHECKSUM"
}
EOF
git add package.json package-lock.json ota/latest.json
git commit -q -m "Live update $VERSION"
git push -q origin main

echo "✅ $VERSION publiée. Les téléphones la récupèrent à la prochaine ouverture (cache GitHub : jusqu'à 5 min)."
