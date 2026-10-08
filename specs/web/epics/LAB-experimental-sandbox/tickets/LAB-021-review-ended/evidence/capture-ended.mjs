// LAB-21's capture: every ended.md ?state= key at 390, 834 and 1440, light and dark,
// and the real sent and not-sent pages, through Chrome's DevTools protocol (Node 22, no
// dependency). The harness is LAB-7's capture-gate.mjs.
// Serve a scratch copy of the app on :3021 with the local database and a synthetic
// SANDBOX_SECRET_LOCAL, whose team.ts returns a synthetic admin for the cookie
// lab21_team=admin and whose registry adds the closed slug lab21-capture; seed two
// reviewers on it with the codes below. Then:
//   node capture-ended.mjs <fresh-out-dir> states|not-sent|sent
import { spawn } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

const OUT = process.argv[2];
const BASE = "http://localhost:3021";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9421;
mkdirSync(OUT, { recursive: true });

const chrome = spawn(CHROME, [
  "--headless=new",
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${path.join(OUT, "profile")}`,
  "--no-first-run",
  "--hide-scrollbars",
  "about:blank",
]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function connect() {
  for (let i = 0; i < 50; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, {
        method: "PUT",
      });
      return (await res.json()).webSocketDebuggerUrl;
    } catch {
      await sleep(200);
    }
  }
  throw new Error("chrome did not start");
}

const ws = new WebSocket(await connect());
await new Promise((r) => ws.addEventListener("open", r, { once: true }));
let id = 0;
const pending = new Map();
const listeners = [];
ws.addEventListener("message", (event) => {
  const msg = JSON.parse(event.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error
      ? reject(new Error(JSON.stringify(msg.error)))
      : resolve(msg.result);
  } else if (msg.method) for (const l of listeners) l(msg);
});
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const n = ++id;
    pending.set(n, { resolve, reject });
    ws.send(JSON.stringify({ id: n, method, params }));
  });
const waitFor = (method) =>
  new Promise((resolve) => {
    const l = (msg) => {
      if (msg.method === method) {
        listeners.splice(listeners.indexOf(l), 1);
        resolve(msg);
      }
    };
    listeners.push(l);
  });

await send("Page.enable");
await send("Runtime.enable");

async function setView(width, theme) {
  await send("Emulation.setDeviceMetricsOverride", {
    width,
    height: 900,
    deviceScaleFactor: 1,
    mobile: width < 768,
  });
  await send("Emulation.setEmulatedMedia", {
    features: [
      { name: "prefers-color-scheme", value: theme },
      { name: "prefers-reduced-motion", value: "reduce" },
    ],
  });
}

async function go(url) {
  const loaded = waitFor("Page.loadEventFired");
  await send("Page.navigate", { url });
  await Promise.race([loaded, sleep(15000)]);
  await sleep(1200);
}

async function evaluate(expression) {
  const r = await send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  return r.result.value;
}

async function shoot(file, width) {
  const { cssContentSize } = await send("Page.getLayoutMetrics");
  const height = Math.ceil(cssContentSize.height);
  await send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width < 768,
  });
  await sleep(300);
  const { data } = await send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: true,
  });
  writeFileSync(file, Buffer.from(data, "base64"));
  await send("Emulation.setDeviceMetricsOverride", {
    width,
    height: 900,
    deviceScaleFactor: 1,
    mobile: width < 768,
  });
  return height;
}

const SLUG = "lab21-capture";
const STATES = [
  "ended-success",
  "ended-empty",
  "ended-partial",
  "ended-draft",
  "ended-draft-partial",
];
const WIDTHS = [390, 834, 1440];
const THEMES = ["light", "dark"];
const mode = process.argv[3] ?? "states";

const openDisclosure = `(async () => {
  const b = [...document.querySelectorAll('main button')].find((b) => b.textContent === 'Show them');
  if (b) { b.click(); await new Promise((r) => setTimeout(r, 300)); }
  return !!b; })()`;

async function enter(email, code) {
  await go(`${BASE}/experimental/${SLUG}`);
  await evaluate(`(() => {
    const set = (id, v) => { const el = document.getElementById(id); const proto = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value'); proto.set.call(el, v); el.dispatchEvent(new Event('input', { bubbles: true })); };
    set('gate-email', ${JSON.stringify(email)}); set('gate-code', ${JSON.stringify(code)}); return true; })()`);
  const loaded = waitFor("Page.loadEventFired");
  await evaluate(`document.querySelector('form[novalidate] button[type=submit]').click(), true`);
  await Promise.race([loaded, sleep(8000)]);
  await sleep(2500);
}

const pageText = () => evaluate(`document.querySelector('main').innerText`);
const psql = (sql) =>
  spawnSync("psql", ["postgresql://127.0.0.1:5432/pem_local", "-tAc", sql], {
    encoding: "utf8",
  }).stdout.trim();

if (mode === "states") {
  await send("Network.enable");
  await send("Network.setCookie", { name: "lab21_team", value: "admin", url: BASE });
  // The keys with comments are shot twice: as a reviewer lands (closed), then opened.
  const ROWS = STATES.flatMap((state) =>
    state.endsWith("partial")
      ? [{ state, open: false }, { state, open: true }]
      : [{ state, open: false }],
  );
  const rowName = (r) => `${r.state}${r.state.endsWith("partial") ? (r.open ? " (opened)" : " (closed)") : ""}`;
  const expanded = `document.querySelector('main button[aria-expanded]')?.getAttribute('aria-expanded') ?? null`;
  const shots = [];
  for (const row of ROWS)
    for (const width of WIDTHS)
      for (const theme of THEMES) {
        await setView(width, theme);
        await go(`${BASE}/experimental/${SLUG}?state=${row.state}`);
        if (row.open) await evaluate(openDisclosure);
        const file = path.join(OUT, `${row.state}-${row.open ? "open" : "closed"}-${width}-${theme}.png`);
        const height = await shoot(file, width);
        shots.push({ row: rowName(row), state: row.state, width, theme, file, height, ariaExpanded: await evaluate(expanded), text: await pageText() });
      }
  writeFileSync(path.join(OUT, "shots.json"), JSON.stringify(shots, null, 2));
  const scale = { 390: 0.5, 834: 0.3, 1440: 0.2 };
  const cells = (s) =>
    shots
      .filter((x) => x.row === s)
      .map(
        (x) =>
          `<figure><figcaption>${x.width} ${x.theme}</figcaption><img src="data:image/png;base64,${readFileSync(x.file).toString("base64")}" style="width:${x.width * scale[x.width]}px"></figure>`,
      )
      .join("");
  const html = `<!doctype html><meta charset=utf-8><style>body{margin:16px;font:14px system-ui;background:#fff;color:#111}h2{margin:24px 0 8px;font-size:16px}.row{display:flex;gap:12px;align-items:flex-start}figure{margin:0}figcaption{font-size:11px;color:#555;margin-bottom:4px}img{border:1px solid #ccc;display:block}</style>${ROWS.map(rowName).map((s) => `<h2>?state=${s}</h2><div class=row>${cells(s)}</div>`).join("")}`;
  writeFileSync(path.join(OUT, "sheet.html"), html);
  await setView(1500, "light");
  await go(`file://${path.join(OUT, "sheet.html")}`);
  await shoot(path.join(OUT, "ended-states.png"), 1500);
} else if (mode === "not-sent") {
  // A reviewer who never sent, entering a live code on the closed slug.
  await setView(390, "light");
  await enter("never-sent@example.com", "8HRT 3MPQ 6VWX 2KDA");
  const text = await pageText();
  writeFileSync(path.join(OUT, "not-sent.json"), JSON.stringify({ url: await evaluate("location.href"), text }, null, 2));
  await shoot(path.join(OUT, "ended-not-sent.png"), 390);
} else if (mode === "sent") {
  // A reviewer who sent on 3 October, with two queued comments and a draft left in this browser.
  await setView(390, "light");
  await enter("sent@example.com", "7KQM 29XH PATR 4WDN");
  const reviewer = psql(`select id from public.sandbox_reviewers where slug = '${SLUG}' and label = 'LAB-21 sent'`);
  const access = psql(`select id from public.sandbox_accesses where reviewer_id = '${reviewer}' order by created_at desc limit 1`);
  psql(`delete from public.sandbox_review_versions where reviewer_id = '${reviewer}'`);
  psql(`insert into public.sandbox_review_versions (id, reviewer_id, access_id, slug, number, core_version, answers, triage, created_at) values (gen_random_uuid(), '${reviewer}', '${access}', '${SLUG}', 1, 'v1', '{"overall":"very"}', '{}', '2026-10-03T12:00:00Z')`);
  const entry = (id, body) => ({ id, number: 1, design: "circle", kind: null, body, anchor: { marked: "plans", x: 0.5, y: 0.5 }, viewportW: 390, viewportH: 844, clientCreatedAt: "2026-10-02T10:00:00.000Z" });
  const keys = {
    queue: `sandbox:pin-queue:${SLUG}:${reviewer}`,
    draft: `sandbox:review-draft:${SLUG}:${reviewer}`,
    otherQueue: `sandbox:pin-queue:pricing-2026:${reviewer}`,
  };
  // Written from another page of the origin: leaving the ended page clears its queue.
  await go(`${BASE}/`);
  await evaluate(`(() => {
    localStorage.setItem(${JSON.stringify(keys.queue)}, ${JSON.stringify(JSON.stringify([entry("00000000-0000-4000-8000-000000000e01", "The price under Pro wraps onto two lines at this width."), entry("00000000-0000-4000-8000-000000000e02", "Is the yearly toggle meant to keep my place in the table?")]))});
    localStorage.setItem(${JSON.stringify(keys.otherQueue)}, ${JSON.stringify(JSON.stringify([entry("00000000-0000-4000-8000-000000000e03", "On another experiment.")]))});
    localStorage.setItem(${JSON.stringify(keys.draft)}, '{"answers":{},"triage":{"comments":{}}}');
    return true; })()`);
  await go(`${BASE}/experimental/${SLUG}`);
  const has = (k) => evaluate(`localStorage.getItem(${JSON.stringify(k)}) !== null`);
  const onArrival = { queue: await has(keys.queue), draft: await has(keys.draft), otherQueue: await has(keys.otherQueue) };
  const textClosed = await pageText();
  await evaluate(openDisclosure);
  const text = await pageText();
  await shoot(path.join(OUT, "ended-sent.png"), 390);
  // Leave (pagehide), then come back.
  await send("Page.navigate", { url: "about:blank" });
  await sleep(1000);
  await go(`${BASE}/experimental/${SLUG}`);
  const afterLeaving = { queue: await has(keys.queue), draft: await has(keys.draft), otherQueue: await has(keys.otherQueue) };
  const textAfter = await pageText();
  writeFileSync(path.join(OUT, "sent.json"), JSON.stringify({ onArrival, textClosed, text, afterLeaving, textAfter }, null, 2));
}

ws.close();
chrome.kill();
process.exit(0);
