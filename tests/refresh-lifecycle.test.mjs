import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const source = readFileSync(new URL("../river-wise-card.js", import.meta.url), "utf8");
const cadence = 15 * 60 * 1000;
const flush = () => new Promise((resolve) => setImmediate(resolve));
const deferred = () => {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
};

function fixture(url) {
  if (url.includes("environment.data.gov.uk")) {
    if (url.includes("/readings")) return { items: [{ dateTime: "2026-10-20T12:00:00Z", value: 2 }] };
    return { items: {
      stationReference: "UK1",
      measures: [{ "@id": "https://environment.data.gov.uk/level", parameter: "level", unitName: "m" }],
    } };
  }
  if (url.includes("pegelonline")) {
    if (url.includes("measurements.json")) return [{ timestamp: "2026-10-20T12:00:00Z", value: 42 }];
    return { uuid: "DE1", number: "DE1", timeseries: [{ shortname: "W", unit: "cm",
      currentMeasurement: { timestamp: "2026-10-20T12:00:00Z", value: 42 } }] };
  }
  return { id: url.split("/gauges/")[1].split("/")[0] };
}

function setup() {
  const timers = new Map(), calls = [], rendered = [], errors = [], registry = new Map();
  let now = 0, nextId = 0;
  let respond = async (url) => fixture(url);
  const context = vm.createContext({
    window: { customCards: [] }, console, AbortController,
    HTMLElement: class {
      isConnected = false;
      attachShadow() { this.shadowRoot = {}; }
    },
    customElements: { get: (name) => registry.get(name), define: (name, value) => registry.set(name, value) },
    setInterval: (fn, interval) => {
      const id = nextId++;
      timers.set(id, { fn, interval, next: now + interval });
      return id;
    },
    clearInterval: (id) => timers.delete(id),
    fetch: async (url, options) => {
      calls.push({ url, ...options });
      const data = await respond(url, options);
      return { ok: true, json: async () => data };
    },
  });
  vm.runInContext(source, context);
  const card = new (registry.get("river-wise-card"))();
  card.renderShell = () => {};
  // Provider normalization has its own suite; capture display configuration here.
  card.normalize = (metadata, observed, forecast, debug) => ({ ...metadata, forecast, debug });
  card.render = (model) => rendered.push({ model, config: { ...card.config } });
  card.renderError = (error) => errors.push(error);
  return {
    card, calls, timers, rendered, errors,
    config: (overrides = {}) => card.setConfig({ gauge: "US1", ...overrides }),
    respond: (fn) => { respond = fn; },
    connect: () => { card.isConnected = true; card.connectedCallback(); },
    disconnect: () => { card.isConnected = false; card.disconnectedCallback(); },
    advance: async (ms) => {
      now += ms;
      for (const timer of timers.values()) {
        while (timer.next <= now) {
          timer.next += timer.interval;
          timer.fn();
        }
      }
      await flush();
    },
  };
}

test("initial load waits for connection; one 15-minute timer refreshes repeatedly", async () => {
  const h = setup();
  h.config();
  assert.equal(h.calls.length, 0);
  h.connect();
  h.card.connectedCallback();
  await flush();
  assert.equal(h.calls.length, 3);
  assert.equal(h.rendered.length, 1);
  assert.equal(h.timers.size, 1);
  await h.advance(cadence - 1);
  assert.equal(h.calls.length, 3);
  await h.advance(1);
  assert.equal(h.calls.length, 6);
  await h.advance(cadence);
  assert.equal(h.rendered.length, 3);
});

test("connection before configuration and repeated hass updates do not duplicate requests", async () => {
  const h = setup();
  h.connect();
  await h.advance(cadence);
  assert.equal(h.calls.length, 0);
  h.config();
  h.card.hass = {};
  h.card.hass = {};
  await flush();
  assert.equal(h.calls.length, 3);
  assert.equal(h.timers.size, 1);
});

test("slow requests skip ticks and manual loads without overlapping", async () => {
  const h = setup(), pending = deferred();
  h.respond(() => pending.promise);
  h.config();
  h.connect();
  await h.advance(3 * cadence);
  await h.card.load();
  assert.equal(h.calls.length, 3);
  pending.resolve({});
  await flush();
  assert.equal(h.rendered.length, 1);
  await h.advance(cadence);
  assert.equal(h.calls.length, 6);
});

test("removal clears even timer id zero, aborts all requests, and rejects late success", async () => {
  const h = setup(), pending = deferred();
  h.respond(() => pending.promise); // Deliberately ignores abort until it resolves.
  h.config();
  h.connect();
  h.disconnect();
  h.disconnect();
  assert.equal(h.timers.size, 0);
  assert(h.calls.every((call) => call.signal.aborted));
  pending.resolve({});
  await flush();
  await h.advance(2 * cadence);
  assert.equal(h.calls.length, 3);
  assert.equal(h.rendered.length, 0);
  assert.equal(h.errors.length, 0);
});

test("late error after removal is ignored", async () => {
  const h = setup(), pending = deferred();
  h.respond(() => pending.promise);
  h.config();
  h.connect();
  h.disconnect();
  pending.reject(new Error("old network error"));
  await flush();
  assert.equal(h.errors.length, 0);
  assert.equal(h.rendered.length, 0);
});

test("reconnection refreshes immediately and resumes one timer", async () => {
  const h = setup();
  h.config();
  h.connect();
  await flush();
  h.disconnect();
  h.connect();
  h.card.connectedCallback();
  await flush();
  assert.equal(h.calls.length, 6);
  assert.equal(h.timers.size, 1);
  await h.advance(cadence);
  assert.equal(h.calls.length, 9);
});

test("reconnection during an aborted batch waits, then refreshes without stale rendering", async () => {
  const h = setup(), pending = deferred();
  h.respond(() => pending.promise);
  h.config();
  h.connect();
  h.disconnect();
  h.respond(async (url) => fixture(url));
  h.connect();
  assert.equal(h.calls.length, 3);
  pending.resolve({});
  await flush();
  assert.equal(h.calls.length, 6);
  assert.equal(h.rendered.length, 1);
  assert.equal(h.timers.size, 1);
});

test("network errors keep the timer alive and the next tick recovers", async () => {
  const h = setup();
  h.respond(async () => { throw new Error("offline"); });
  h.config();
  h.connect();
  await flush();
  assert.equal(h.errors.length, 1);
  h.respond(async (url) => fixture(url));
  await h.advance(cadence);
  assert.equal(h.rendered.length, 1);
  assert.equal(h.timers.size, 1);
});

test("one failed request does not release the batch while other requests are pending", async () => {
  const h = setup(), pending = deferred();
  h.respond((url) => url.includes("stageflow") ? pending.promise : Promise.reject(new Error("offline")));
  h.config();
  h.connect();
  await flush();
  await h.advance(cadence);
  assert.equal(h.calls.length, 3);
  pending.resolve({});
  await flush();
  assert.equal(h.errors.length, 1);
  h.respond(async (url) => fixture(url));
  await h.advance(cadence);
  assert.equal(h.calls.length, 6);
});

test("optional forecast failure still renders observed data and retries next tick", async () => {
  const h = setup();
  h.respond(async (url) => {
    if (url.endsWith("/forecast")) throw new Error("forecast unavailable");
    return fixture(url);
  });
  h.config();
  h.connect();
  await flush();
  assert.equal(h.rendered.length, 1);
  assert.equal(h.rendered[0].model.forecast, null);
  assert.equal(h.errors.length, 0);
  await h.advance(cadence);
  assert.equal(h.calls.filter((call) => call.url.endsWith("/forecast")).length, 2);
});

for (const overrides of [
  { gauge: "US2" },
  { show_forecast: false },
  { units: "metric", title: "Updated title", show_impacts: false, debug: true },
  { provider: "uk_ea", uk_station: "UK2" },
  { provider: "de_pegelonline", de_station: "DE2" },
]) {
  test(`configuration change discards old requests: ${JSON.stringify(overrides)}`, async () => {
    const h = setup(), pending = deferred();
    h.respond(() => pending.promise);
    h.config();
    h.connect();
    h.config(overrides);
    assert(h.calls.every((call) => call.signal.aborted));
    h.respond(async (url) => fixture(url));
    pending.resolve({});
    await flush();
    assert.equal(h.rendered.length, 1);
    assert.equal(h.errors.length, 0);
    for (const [key, value] of Object.entries(overrides)) assert.equal(h.rendered[0].config[key], value);
    const latest = h.calls.slice(3);
    if (overrides.gauge) assert(latest.every((call) => call.url.includes("/US2")));
    if (overrides.uk_station) assert(latest[0].url.includes("/UK2"));
    if (overrides.de_station) assert(latest.every((call) => call.url.includes("/DE2")));
    if (overrides.show_forecast === false) assert.equal(latest.length, 2);
    assert.equal(h.timers.size, 1);
  });
}

test("rapid config edits coalesce into the newest config and suppress stale errors", async () => {
  const h = setup(), pending = deferred();
  h.respond(() => pending.promise);
  h.config();
  h.connect();
  h.config({ gauge: "US2" });
  h.config({ gauge: "US3" });
  h.respond(async (url) => fixture(url));
  pending.reject(new Error("stale error"));
  await flush();
  assert.equal(h.errors.length, 0);
  assert.equal(h.calls.length, 6);
  assert(h.calls.slice(3).every((call) => call.url.includes("/US3")));
  assert.equal(h.rendered.length, 1);
});

test("detached configuration changes wait until reconnection", async () => {
  const h = setup();
  h.config();
  h.connect();
  await flush();
  h.disconnect();
  h.config({ gauge: "US2" });
  await h.advance(cadence);
  assert.equal(h.calls.length, 3);
  h.connect();
  await flush();
  assert.equal(h.rendered.at(-1).model.id, "US2");
});

test("abort-aware fetches settle and immediately load the new configuration", async () => {
  const h = setup();
  h.respond((url, { signal }) => new Promise((resolve, reject) => {
    signal.addEventListener("abort", () => reject(signal.reason), { once: true });
  }));
  h.config();
  h.connect();
  h.respond(async (url) => fixture(url));
  h.config({ gauge: "US2" });
  await flush();
  assert.equal(h.calls.length, 6);
  assert.equal(h.rendered.length, 1);
  assert.equal(h.rendered[0].model.id, "US2");
  assert.equal(h.errors.length, 0);
});

for (const config of [
  { provider: "uk_ea", uk_station: "UK1" },
  { provider: "de_pegelonline", de_station: "DE1" },
]) {
  test(`${config.provider} refreshes through its real provider adapter`, async () => {
    const h = setup();
    h.config(config);
    h.connect();
    await flush();
    assert.equal(h.rendered.length, 1);
    assert.equal(h.rendered[0].model.stage, config.provider === "uk_ea" ? 2 : 42);
    await h.advance(cadence);
    assert.equal(h.rendered.length, 2);
    assert.equal(h.calls.length, 4);
    h.disconnect();
    await h.advance(cadence);
    assert.equal(h.calls.length, 4);
  });
}

test("aborted UK metadata cannot start a chained readings request", async () => {
  const h = setup(), pending = deferred();
  h.respond(() => pending.promise);
  h.config({ provider: "uk_ea" });
  h.connect();
  h.disconnect();
  pending.resolve(fixture("https://environment.data.gov.uk/station"));
  await flush();
  assert.equal(h.calls.length, 1);
  assert.equal(h.rendered.length, 0);
});

test("fetchJson handles HTTP and JSON errors and passes the abort signal", async () => {
  const h = setup();
  const controller = new AbortController();
  const bad = vm.runInNewContext("({ ok: false, status: 503, statusText: 'Unavailable' })");
  // A separate VM lets this test exercise real HTTP response handling directly.
  const registry = new Map();
  const context = vm.createContext({
    window: { customCards: [] }, HTMLElement: class {}, console,
    customElements: { get: (key) => registry.get(key), define: (key, value) => registry.set(key, value) },
    fetch: async () => bad,
  });
  vm.runInContext(source, context);
  const card = new (registry.get("river-wise-card"))();
  await assert.rejects(card.fetchJson("https://example.test", controller.signal), /503 Unavailable/);
  context.fetch = async () => ({ ok: true, json: async () => { throw new Error("invalid JSON"); } });
  await assert.rejects(card.fetchJson("https://example.test", controller.signal), /invalid JSON/);
  controller.abort();
  await assert.rejects(h.card.fetchJson("https://example.test", controller.signal), { name: "AbortError" });
  assert.equal(h.calls.length, 0);
});
