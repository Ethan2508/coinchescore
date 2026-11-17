"use client";

import { useEffect } from "react";
import {
  OTA_ATTEMPT_KEY,
  OTA_MANIFEST_URL,
  parseManifest,
  shouldInstall,
} from "@/lib/liveUpdate";

/**
 * Native app only (no-op on the web/PWA), runs once per launch:
 * 1. Tells the updater this bundle booted. Without it, the plugin rolls back to the previous bundle
 *    after 10 s, so a broken update can never brick the app.
 * 2. Checks ota/latest.json; if a newer compatible bundle exists, downloads it and schedules it for
 *    the next time the app goes to background or restarts (never interrupts a game in progress).
 * Silent by design: no "update" UI (App Store rules on downloaded code).
 */
export default function LiveUpdates() {
  useEffect(() => {
    const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
    if (!cap?.isNativePlatform?.()) return;
    void run();
  }, []);

  return null;
}

async function run() {
  const [{ CapacitorUpdater }, { CapacitorHttp }] = await Promise.all([
    import("@capgo/capacitor-updater"),
    import("@capacitor/core"),
  ]);

  try {
    await CapacitorUpdater.notifyAppReady();
  } catch {
    // Not fatal for the update check below.
  }

  try {
    const { bundle, native } = await CapacitorUpdater.current();
    // Native HTTP: no CORS constraints, whatever host serves the manifest.
    const res = await CapacitorHttp.get({ url: OTA_MANIFEST_URL });
    if (res.status !== 200) return;
    const manifest = parseManifest(res.data);
    if (!manifest) return;

    let lastAttempt: string | null = null;
    try {
      lastAttempt = localStorage.getItem(OTA_ATTEMPT_KEY);
    } catch {
      // ignore
    }
    if (!shouldInstall(manifest.version, bundle.version, native, lastAttempt)) return;

    const downloaded = await CapacitorUpdater.download({
      url: manifest.url,
      version: manifest.version,
      checksum: manifest.checksum,
    });
    await CapacitorUpdater.next({ id: downloaded.id });
    try {
      localStorage.setItem(OTA_ATTEMPT_KEY, manifest.version);
    } catch {
      // ignore
    }
  } catch {
    // Offline or host unreachable: try again on next launch.
  }
}
