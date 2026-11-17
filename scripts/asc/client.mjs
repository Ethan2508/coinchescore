// Minimal App Store Connect API client, no dependencies (ES256 JWT signed with node:crypto).
//
// Credentials are never stored in this (public) repo. They are read from, in order:
//   - env ASC_KEY_ID / ASC_ISSUER_ID (and optionally ASC_KEY_PATH),
//   - ~/.appstoreconnect/config.json  {"keyId": "...", "issuerId": "..."}
// and the private key from ~/.appstoreconnect/private_keys/AuthKey_<keyId>.p8.
import { createPrivateKey, sign } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const ASC_DIR = join(homedir(), ".appstoreconnect");

function loadCredentials() {
  let keyId = process.env.ASC_KEY_ID;
  let issuerId = process.env.ASC_ISSUER_ID;
  const configPath = join(ASC_DIR, "config.json");
  if ((!keyId || !issuerId) && existsSync(configPath)) {
    const config = JSON.parse(readFileSync(configPath, "utf8"));
    keyId ??= config.keyId;
    issuerId ??= config.issuerId;
  }
  if (!keyId || !issuerId) {
    throw new Error(`Identifiants App Store Connect introuvables : crée ${configPath} avec {"keyId": "...", "issuerId": "..."}`);
  }
  const keyPath = process.env.ASC_KEY_PATH ?? join(ASC_DIR, "private_keys", `AuthKey_${keyId}.p8`);
  if (!existsSync(keyPath)) throw new Error(`Clé API introuvable : ${keyPath}`);
  return { keyId, issuerId, key: createPrivateKey(readFileSync(keyPath)) };
}

let credentials;
const b64url = (data) => Buffer.from(data).toString("base64url");

function token() {
  credentials ??= loadCredentials();
  const { keyId, issuerId, key } = credentials;
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "ES256", kid: keyId, typ: "JWT" }));
  const payload = b64url(JSON.stringify({ iss: issuerId, iat: now, exp: now + 15 * 60, aud: "appstoreconnect-v1" }));
  const signature = sign("sha256", Buffer.from(`${header}.${payload}`), { key, dsaEncoding: "ieee-p1363" });
  return `${header}.${payload}.${b64url(signature)}`;
}

export async function api(method, path, body) {
  const res = await fetch(`https://api.appstoreconnect.apple.com${path}`, {
    method,
    headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const json = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const details = (json?.errors ?? []).map((e) => `  ${e.code}: ${e.title}${e.detail ? ` — ${e.detail}` : ""}`).join("\n");
    throw new Error(`App Store Connect : ${method} ${path} → HTTP ${res.status}\n${details}`);
  }
  return json;
}

export async function findApp(bundleId) {
  const res = await api("GET", `/v1/apps?filter[bundleId]=${encodeURIComponent(bundleId)}&fields[apps]=name,bundleId`);
  const app = res.data[0];
  if (!app) throw new Error(`Aucune app avec le bundle id ${bundleId} sur App Store Connect.`);
  return app;
}
