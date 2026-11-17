#!/bin/bash
# Sortie iOS complète, sans rien cliquer dans App Store Connect :
#   build web → archive Xcode → envoi App Store Connect → attente du traitement par Apple
#   → version + nouveautés (release-notes/<version>.txt) → soumission (publication auto après validation).
#
# Avant : npm run version:set -- x.y.0, remplir release-notes/x.y.0.txt, commiter.
# Usage : npm run release:ios                  (soumet à Apple)
#         npm run release:ios -- --no-submit   (prépare la version sans la soumettre)
# Prérequis : compte Apple connecté dans Xcode, clé API dans ~/.appstoreconnect (voir scripts/asc/client.mjs).
set -euo pipefail
cd "$(dirname "$0")/.."

SUBMIT_FLAG=""
[ "${1:-}" = "--no-submit" ] && SUBMIT_FLAG="--no-submit"

PBX=ios/App/App.xcodeproj/project.pbxproj
VERSION=$(grep -m1 -oE 'MARKETING_VERSION = [^;]+' "$PBX" | awk '{print $3}')
BUILD=$(grep -m1 -oE 'CURRENT_PROJECT_VERSION = [0-9]+' "$PBX" | awk '{print $3}')
TEAM=$(grep -m1 -oE 'DEVELOPMENT_TEAM = [A-Z0-9]+' "$PBX" | awk '{print $3}')
BUNDLE_ID=$(grep -oE 'appId: "[^"]+"' capacitor.config.ts | cut -d'"' -f2)
PKG_VERSION=$(node -p "require('./package.json').version")
NOTES="release-notes/$VERSION.txt"
ASC="node scripts/asc/release.mjs"

echo "→ Sortie iOS $VERSION ($BUILD) — $BUNDLE_ID"

# --- Vérifications -----------------------------------------------------------
[ "$(git rev-parse --abbrev-ref HEAD)" = "main" ] || { echo "❌ Lance ce script depuis main." >&2; exit 1; }
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "❌ Des modifications ne sont pas commitées. Commite-les d'abord." >&2; exit 1
fi
[ "$PKG_VERSION" = "$VERSION" ] || {
  echo "❌ package.json ($PKG_VERSION) ≠ Xcode ($VERSION). Prépare la version avec : npm run version:set -- x.y.0" >&2; exit 1
}
[ -s "$NOTES" ] || { echo "❌ $NOTES manquant ou vide : écris les nouveautés de la version." >&2; exit 1; }
if grep -q "À REMPLIR" "$NOTES"; then echo "❌ $NOTES contient encore « À REMPLIR »." >&2; exit 1; fi
$ASC preflight --bundle-id "$BUNDLE_ID" --version "$VERSION" --build "$BUILD"

WORK=$(mktemp -d)
trap 'rm -rf "${WORK:?}"' EXIT

# --- Build web + archive -------------------------------------------------------
echo "→ Build web et synchronisation iOS..."
npm run build >/dev/null
npx cap sync ios >/dev/null

ARCHIVE_DIR="$HOME/Library/Developer/Xcode/Archives/$(date +%F)"
ARCHIVE="$ARCHIVE_DIR/CoincheScore $VERSION ($BUILD).xcarchive"
mkdir -p "$ARCHIVE_DIR"
echo "→ Archive Xcode (quelques minutes)..."
xcodebuild -project ios/App/App.xcodeproj -scheme App -configuration Release \
  -destination 'generic/platform=iOS' -archivePath "$ARCHIVE" -allowProvisioningUpdates archive \
  >"$WORK/archive.log" 2>&1 || { tail -40 "$WORK/archive.log"; echo "❌ Archive échouée." >&2; exit 1; }
echo "✔ Archive : $ARCHIVE"

# --- Envoi App Store Connect ------------------------------------------------------
cat >"$WORK/ExportOptions.plist" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>method</key><string>app-store-connect</string>
	<key>destination</key><string>upload</string>
	<key>teamID</key><string>$TEAM</string>
	<key>signingStyle</key><string>automatic</string>
	<key>uploadSymbols</key><true/>
	<key>manageAppVersionAndBuildNumber</key><false/>
</dict>
</plist>
EOF
echo "→ Envoi sur App Store Connect..."
xcodebuild -exportArchive -archivePath "$ARCHIVE" -exportOptionsPlist "$WORK/ExportOptions.plist" \
  -exportPath "$WORK/export" -allowProvisioningUpdates >"$WORK/upload.log" 2>&1 \
  || { tail -40 "$WORK/upload.log"; echo "❌ Envoi échoué." >&2; exit 1; }
echo "✔ Build envoyé"

# --- Version + soumission ---------------------------------------------------------
$ASC submit --bundle-id "$BUNDLE_ID" --version "$VERSION" --build "$BUILD" --notes-file "$NOTES" $SUBMIT_FLAG
