/**
 * Free, self-hosted live updates (no Capgo Cloud).
 *
 * `ota/latest.json` on the main branch says which web bundle is the newest; the zip itself is a
 * GitHub Release asset. Both are published by `npm run live-update` (scripts/live-update.sh).
 */

export const OTA_MANIFEST_URL =
  process.env.NEXT_PUBLIC_OTA_MANIFEST_URL ??
  "https://raw.githubusercontent.com/Ethan2508/coinchescore/main/ota/latest.json";

/** Version of the bundle we already downloaded and scheduled; kept so a bundle that rolled back is not retried forever. */
export const OTA_ATTEMPT_KEY = "coinchescore:ota-attempt";

export interface OtaManifest {
  version: string;
  url: string;
  /** SHA-256 of the zip, lowercase hex: required by the updater plugin, which verifies it after download. */
  checksum: string;
}

type Semver = [number, number, number];

export function parseSemver(v: string | undefined): Semver | null {
  const m = /^(\d+)\.(\d+)\.(\d+)$/.exec(v?.trim() ?? "");
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
}

function compare(a: Semver, b: Semver): number {
  return a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
}

/**
 * Bundle URLs must be https, except when the manifest itself is served over http (local test builds
 * overriding NEXT_PUBLIC_OTA_MANIFEST_URL); the production manifest is https.
 */
export function parseManifest(
  data: unknown,
  allowHttp = OTA_MANIFEST_URL.startsWith("http://"),
): OtaManifest | null {
  let obj = data;
  if (typeof obj === "string") {
    try {
      obj = JSON.parse(obj);
    } catch {
      return null;
    }
  }
  if (!obj || typeof obj !== "object") return null;
  const { version, url, checksum } = obj as Record<string, unknown>;
  if (typeof version !== "string" || !parseSemver(version)) return null;
  if (typeof url !== "string") return null;
  if (!url.startsWith("https://") && !(allowHttp && url.startsWith("http://"))) return null;
  if (typeof checksum !== "string" || !/^[0-9a-f]{64}$/i.test(checksum)) return null;
  return { version, url, checksum: checksum.toLowerCase() };
}

/**
 * Install `candidate` only if it was built for the same store release line (same major.minor as the
 * native app: a 1.3.x bundle may rely on native code that a 1.2.0 store build doesn't have), is newer
 * than the running bundle, and wasn't already tried (a tried version still not running = rolled back).
 */
export function shouldInstall(
  candidate: string,
  running: string,
  native: string,
  lastAttempt: string | null,
): boolean {
  const c = parseSemver(candidate);
  const r = parseSemver(running);
  const n = parseSemver(native);
  if (!c || !r || !n) return false;
  if (c[0] !== n[0] || c[1] !== n[1]) return false;
  if (compare(c, r) <= 0) return false;
  return candidate !== lastAttempt;
}
