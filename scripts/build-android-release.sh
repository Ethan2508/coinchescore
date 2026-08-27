#!/bin/bash
set -e
export PATH="/opt/homebrew/opt/openjdk@21/bin:$PATH"
export JAVA_HOME="/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home"
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"

cd "$(dirname "$0")/.."

echo "→ Building Next.js static export..."
npm run build

echo "→ Syncing to Capacitor..."
npx cap sync android

echo "→ Building signed Android App Bundle..."
cd android
./gradlew bundleRelease

echo ""
echo "✅ AAB généré :"
ls -la app/build/outputs/bundle/release/app-release.aab
cp app/build/outputs/bundle/release/app-release.aab ../coinchescore-release.aab
echo ""
echo "→ Copie: coinchescore-release.aab (à la racine du projet)"
