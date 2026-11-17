// App Store Connect steps used by scripts/release-ios.sh.
//
//   node scripts/asc/release.mjs status    --bundle-id app.coinchescore
//   node scripts/asc/release.mjs preflight --bundle-id app.coinchescore --version 1.3.0 --build 4
//   node scripts/asc/release.mjs submit    --bundle-id app.coinchescore --version 1.3.0 --build 4 --notes-file release-notes/1.3.0.txt [--no-submit]
//
// status / preflight are read-only. submit waits for the uploaded build to be processed, declares
// export compliance, creates (or reuses) the version with "release after approval", attaches the
// build, sets "What's new", then submits for review (unless --no-submit).
import { readFileSync } from "node:fs";
import { api, findApp } from "./client.mjs";

const EDITABLE_STATES = new Set([
  "PREPARE_FOR_SUBMISSION",
  "DEVELOPER_REJECTED",
  "REJECTED",
  "METADATA_REJECTED",
  "INVALID_BINARY",
]);
const ACTIVE_SUBMISSION_STATES = new Set(["WAITING_FOR_REVIEW", "IN_REVIEW", "UNRESOLVED_ISSUES"]);

function parseArgs(argv) {
  const [command, ...rest] = argv;
  const opts = { command };
  for (let i = 0; i < rest.length; i++) {
    const key = rest[i].replace(/^--/, "");
    if (key === "no-submit") opts.noSubmit = true;
    else opts[key] = rest[++i];
  }
  return opts;
}

const fail = (msg) => {
  console.error(`❌ ${msg}`);
  process.exit(1);
};

async function findVersion(appId, versionString) {
  const res = await api(
    "GET",
    `/v1/apps/${appId}/appStoreVersions?filter[platform]=IOS&filter[versionString]=${versionString}&fields[appStoreVersions]=versionString,appStoreState,releaseType`,
  );
  return res.data[0];
}

async function findBuild(appId, version, build) {
  const res = await api(
    "GET",
    `/v1/builds?filter[app]=${appId}&filter[version]=${build}&filter[preReleaseVersion.version]=${version}&fields[builds]=version,processingState,usesNonExemptEncryption`,
  );
  return res.data[0];
}

async function activeSubmission(appId) {
  const res = await api("GET", `/v1/reviewSubmissions?filter[app]=${appId}&filter[platform]=IOS&limit=20`);
  return res.data.find((s) => ACTIVE_SUBMISSION_STATES.has(s.attributes.state));
}

async function status(app) {
  const versions = await api(
    "GET",
    `/v1/apps/${app.id}/appStoreVersions?filter[platform]=IOS&limit=3&fields[appStoreVersions]=versionString,appStoreState,releaseType`,
  );
  console.log(`${app.attributes.name} (${app.attributes.bundleId})`);
  for (const v of versions.data) console.log(`  version ${v.attributes.versionString} : ${v.attributes.appStoreState}`);
  const builds = await api(
    "GET",
    `/v1/builds?filter[app]=${app.id}&sort=-uploadedDate&limit=3&fields[builds]=version,processingState,uploadedDate,preReleaseVersion&include=preReleaseVersion&fields[preReleaseVersions]=version`,
  );
  const pre = Object.fromEntries((builds.included ?? []).map((i) => [i.id, i.attributes.version]));
  for (const b of builds.data) {
    console.log(`  build ${pre[b.relationships.preReleaseVersion.data?.id]} (${b.attributes.version}) : ${b.attributes.processingState}`);
  }
}

async function preflight(app, version, build) {
  const existing = await findVersion(app.id, version);
  if (existing && !EDITABLE_STATES.has(existing.attributes.appStoreState)) {
    fail(`La version ${version} est déjà « ${existing.attributes.appStoreState} » sur App Store Connect. Prépare une nouvelle version : npm run version:set -- x.y.0`);
  }
  if (await findBuild(app.id, version, build)) {
    fail(`Le build ${version} (${build}) a déjà été envoyé. Incrémente la version : npm run version:set -- x.y.0`);
  }
  const active = await activeSubmission(app.id);
  if (active) {
    fail(`Une soumission est déjà en cours chez Apple (${active.attributes.state}). Attends sa fin ou annule-la dans App Store Connect.`);
  }
  console.log(`✔ App Store Connect prêt pour ${version} (${build})${existing ? ` — version existante réutilisée (${existing.attributes.appStoreState})` : ""}`);
}

async function waitForBuild(app, version, build) {
  const deadline = Date.now() + 60 * 60 * 1000;
  let last = "";
  while (Date.now() < deadline) {
    const b = await findBuild(app.id, version, build);
    const state = b?.attributes.processingState ?? "pas encore visible";
    if (state !== last) {
      console.log(`  build ${version} (${build}) : ${state}`);
      last = state;
    }
    if (state === "VALID") return b;
    if (state === "INVALID" || state === "FAILED") fail(`Apple a refusé le build (${state}) : regarde le mail reçu et App Store Connect.`);
    await new Promise((r) => setTimeout(r, 30_000));
  }
  fail("Le build n'est toujours pas traité après 60 min. Relance plus tard : node scripts/asc/release.mjs submit …");
}

async function submit(app, version, build, notes, noSubmit) {
  console.log("→ Attente du traitement du build par Apple (souvent 5 à 30 min)...");
  const b = await waitForBuild(app, version, build);

  if (b.attributes.usesNonExemptEncryption === null || b.attributes.usesNonExemptEncryption === undefined) {
    // HTTPS only: exempt (same answer as previous builds)
    await api("PATCH", `/v1/builds/${b.id}`, { data: { type: "builds", id: b.id, attributes: { usesNonExemptEncryption: false } } });
    console.log("✔ Chiffrement déclaré : aucun chiffrement non exempté (HTTPS uniquement)");
  }

  let v = await findVersion(app.id, version);
  if (v && !EDITABLE_STATES.has(v.attributes.appStoreState)) fail(`La version ${version} n'est plus modifiable (${v.attributes.appStoreState}).`);
  if (!v) {
    v = (
      await api("POST", "/v1/appStoreVersions", {
        data: {
          type: "appStoreVersions",
          attributes: { platform: "IOS", versionString: version, releaseType: "AFTER_APPROVAL" },
          relationships: { app: { data: { type: "apps", id: app.id } } },
        },
      })
    ).data;
    console.log(`✔ Version ${version} créée (publication automatique après validation)`);
  } else if (v.attributes.releaseType !== "AFTER_APPROVAL") {
    await api("PATCH", `/v1/appStoreVersions/${v.id}`, { data: { type: "appStoreVersions", id: v.id, attributes: { releaseType: "AFTER_APPROVAL" } } });
  }

  await api("PATCH", `/v1/appStoreVersions/${v.id}/relationships/build`, { data: { type: "builds", id: b.id } });
  console.log(`✔ Build ${version} (${build}) attaché`);

  const locs = (await api("GET", `/v1/appStoreVersions/${v.id}/appStoreVersionLocalizations`)).data;
  for (const l of locs) {
    if (!l.attributes.locale.startsWith("fr")) {
      console.log(`⚠ Langue ${l.attributes.locale} : nouveautés à remplir à la main (le fichier est en français)`);
      continue;
    }
    await api("PATCH", `/v1/appStoreVersionLocalizations/${l.id}`, {
      data: { type: "appStoreVersionLocalizations", id: l.id, attributes: { whatsNew: notes } },
    });
    console.log(`✔ Nouveautés renseignées (${l.attributes.locale})`);
  }

  if (noSubmit) {
    console.log("✔ Version prête, non soumise (--no-submit). Soumets-la depuis App Store Connect.");
    return;
  }

  const res = await api("GET", `/v1/reviewSubmissions?filter[app]=${app.id}&filter[platform]=IOS&limit=20`);
  const submission =
    res.data.find((s) => s.attributes.state === "READY_FOR_REVIEW") ??
    (
      await api("POST", "/v1/reviewSubmissions", {
        data: { type: "reviewSubmissions", attributes: { platform: "IOS" }, relationships: { app: { data: { type: "apps", id: app.id } } } },
      })
    ).data;
  await api("POST", "/v1/reviewSubmissionItems", {
    data: {
      type: "reviewSubmissionItems",
      relationships: {
        reviewSubmission: { data: { type: "reviewSubmissions", id: submission.id } },
        appStoreVersion: { data: { type: "appStoreVersions", id: v.id } },
      },
    },
  });
  const done = (
    await api("PATCH", `/v1/reviewSubmissions/${submission.id}`, {
      data: { type: "reviewSubmissions", id: submission.id, attributes: { submitted: true } },
    })
  ).data;
  console.log(`✔ Soumise à Apple : ${done.attributes.state}. Elle sortira automatiquement après validation (24-48 h en général).`);
}

const opts = parseArgs(process.argv.slice(2));
try {
  if (!opts["bundle-id"]) fail("--bundle-id manquant");
  const app = await findApp(opts["bundle-id"]);
  if (opts.command === "status") {
    await status(app);
  } else {
    if (!/^\d+\.\d+\.\d+$/.test(opts.version ?? "") || !/^\d+$/.test(opts.build ?? "")) fail("--version x.y.z et --build N requis");
    if (opts.command === "preflight") {
      await preflight(app, opts.version, opts.build);
    } else if (opts.command === "submit") {
      const notes = readFileSync(opts["notes-file"], "utf8").trim();
      if (!notes) fail(`${opts["notes-file"]} est vide`);
      if (notes.length > 4000) fail("Les nouveautés dépassent 4000 caractères");
      await submit(app, opts.version, opts.build, notes, opts.noSubmit);
    } else fail(`Commande inconnue : ${opts.command}`);
  }
} catch (e) {
  fail(e.message);
}
