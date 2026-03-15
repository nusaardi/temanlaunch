const args = process.argv.slice(2);

function readArg(flag, fallback = "") {
  const index = args.indexOf(flag);
  if (index === -1) return fallback;
  return args[index + 1] || fallback;
}

function normalizeBaseUrl(value, fallback) {
  const raw = String(value || fallback || "").trim();
  if (!raw) return "";
  return raw.replace(/\/+$/, "");
}

function pass(label, detail) {
  console.log(`PASS  ${label}${detail ? `  ${detail}` : ""}`);
}

function fail(label, detail) {
  console.error(`FAIL  ${label}${detail ? `  ${detail}` : ""}`);
}

function info(label, detail) {
  console.log(`INFO  ${label}${detail ? `  ${detail}` : ""}`);
}

async function checkWeb(webUrl) {
  const response = await fetch(webUrl);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const html = await response.text();
  if (!/TemanLaunch/i.test(html)) {
    throw new Error("Brand marker `TemanLaunch` tidak ditemukan di HTML.");
  }
  return { status: response.status };
}

async function checkApi(apiUrl) {
  const response = await fetch(`${apiUrl}/api/health`);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const data = await response.json();
  if (String(data?.status || "").toLowerCase() !== "ok") {
    throw new Error(`status API bukan ok (${data?.status || "unknown"})`);
  }
  if (String(data?.database || "").toLowerCase() !== "connected") {
    throw new Error(`database belum connected (${data?.database || "unknown"})`);
  }
  return data;
}

async function main() {
  const webUrl = normalizeBaseUrl(
    readArg("--web", process.env.TEMANLAUNCH_WEB_URL),
    "http://127.0.0.1:4173",
  );
  const apiUrl = normalizeBaseUrl(
    readArg("--api", process.env.TEMANLAUNCH_API_URL),
    "http://127.0.0.1:3001",
  );

  info("Preflight", `web=${webUrl} api=${apiUrl}`);

  let failed = false;

  try {
    const web = await checkWeb(webUrl);
    pass("Web reachable", `status ${web.status}`);
  } catch (error) {
    failed = true;
    fail("Web reachable", error.message);
  }

  try {
    const api = await checkApi(apiUrl);
    pass("API health", `${api.app || "API"} · db=${api.database} · provider=${api.defaultProvider || "unknown"}`);
  } catch (error) {
    failed = true;
    fail("API health", error.message);
  }

  if (failed) {
    console.error("\nPreflight belum aman. Gunakan Demo Workspace sebagai jalur cadangan sebelum tampil.");
    process.exitCode = 1;
    return;
  }

  console.log("\nPreflight aman. TemanLaunch siap dipakai untuk live demo.");
}

main().catch((error) => {
  console.error(`FAIL  Preflight crash  ${error.message}`);
  process.exitCode = 1;
});
