// LAB-7's capture: every gate ?state= at 390, 834 and 1440, light and dark, plus the
// notice and a real lock, through Chrome's DevTools protocol (Node 22, no dependency).
// Serve the app on :3008 with a local database and a synthetic SANDBOX_SECRET_LOCAL, then:
//   node capture-gate.mjs <out-dir> states|notice|throttled
// The throttled run needs a fresh <out-dir>: its Chrome profile holds the browser key.
import { spawn } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const OUT = process.argv[2];
const BASE = "http://localhost:3008";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9339;
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
  await loaded;
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

const STATES = [
  "gate-empty",
  "gate-loading",
  "gate-error",
  "gate-partial",
  "gate-offline",
  "gate-success",
  "gate-throttled",
  "gate-revoked",
  "gate-signed-in",
  "gate-server-error",
];
const WIDTHS = [390, 834, 1440];
const THEMES = ["light", "dark"];
const mode = process.argv[3] ?? "states";

if (mode === "states") {
  const shots = [];
  for (const state of STATES)
    for (const width of WIDTHS)
      for (const theme of THEMES) {
        await setView(width, theme);
        await go(`${BASE}/experimental/pricing-2026?state=${state}`);
        const file = path.join(OUT, `${state}-${width}-${theme}.png`);
        const height = await shoot(file, width);
        shots.push({ state, width, theme, file, height });
      }
  writeFileSync(path.join(OUT, "shots.json"), JSON.stringify(shots, null, 2));
  // Contact sheet: one row per state, six columns.
  const scale = { 390: 0.5, 834: 0.3, 1440: 0.2 };
  const cells = (s) =>
    shots
      .filter((x) => x.state === s)
      .map(
        (x) =>
          `<figure><figcaption>${x.width} ${x.theme}</figcaption><img src="data:image/png;base64,${readFileSync(x.file).toString("base64")}" style="width:${x.width * scale[x.width]}px"></figure>`,
      )
      .join("");
  const html = `<!doctype html><meta charset=utf-8><style>body{margin:16px;font:14px system-ui;background:#fff;color:#111}h2{margin:24px 0 8px;font-size:16px}.row{display:flex;gap:12px;align-items:flex-start}figure{margin:0}figcaption{font-size:11px;color:#555;margin-bottom:4px}img{border:1px solid #ccc;display:block}</style>${STATES.map((s) => `<h2>?state=${s}</h2><div class=row>${cells(s)}</div>`).join("")}`;
  writeFileSync(path.join(OUT, "sheet.html"), html);
  await setView(1500, "light");
  await go(`file://${path.join(OUT, "sheet.html")}`);
  await shoot(path.join(OUT, "gate-states.png"), 1500);
} else if (mode === "notice") {
  await setView(1440, "light");
  await go(`${BASE}/experimental/pricing-2026`);
  await shoot(path.join(OUT, "gate-notice.png"), 1440);
} else if (mode === "throttled") {
  await setView(390, "light");
  await go(`${BASE}/experimental/no-such-review`);
  const fill = `(() => {
    const set = (id, v) => { const el = document.getElementById(id); const proto = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value'); proto.set.call(el, v); el.dispatchEvent(new Event('input', { bubbles: true })); };
    set('gate-email', 'ana@example.com'); set('gate-code', '7KQM 29XH PATR 4WDX'); return true; })()`;
  await evaluate(fill);
  const tries = [];
  for (let i = 0; i < 6; i++) {
    await evaluate(
      `document.querySelector('form[novalidate] button[type=submit]').click(), true`,
    );
    await sleep(2500);
    tries.push(
      await evaluate(
        `document.getElementById('gate-code-error')?.textContent ?? ''`,
      ),
    );
  }
  const state = await evaluate(
    `({ email: document.getElementById('gate-email').value, code: document.getElementById('gate-code').value, disabled: document.querySelector('form[novalidate] button[type=submit]').disabled, time: document.querySelector('time')?.getAttribute('datetime') })`,
  );
  writeFileSync(
    path.join(OUT, "throttled.json"),
    JSON.stringify({ tries, state }, null, 2),
  );
  await shoot(path.join(OUT, "gate-throttled.png"), 390);
}

ws.close();
chrome.kill();
process.exit(0);
