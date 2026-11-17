"use client";

import { useEffect } from "react";

/**
 * Tells Capgo (live updates) that this web bundle booted fine. Must run on every native launch:
 * without it, the plugin rolls back to the previous bundle after `appReadyTimeout` (10 s).
 * No-op on the web/PWA.
 */
export default function LiveUpdateReady() {
  useEffect(() => {
    const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
    if (!cap?.isNativePlatform?.()) return;
    void import("@capgo/capacitor-updater")
      .then(({ CapacitorUpdater }) => CapacitorUpdater.notifyAppReady())
      .catch(() => {});
  }, []);

  return null;
}
