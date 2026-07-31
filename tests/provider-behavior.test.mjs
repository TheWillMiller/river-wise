global.window = { customCards: [] };

const registry = new Map();
global.customElements = {
  get: (name) => registry.get(name),
  define: (name, value) => registry.set(name, value),
};

global.HTMLElement = class {
  attachShadow() {
    this.shadowRoot = {
      innerHTML: "",
      querySelector: () => null,
      querySelectorAll: () => [],
    };
    return this.shadowRoot;
  }

  dispatchEvent(event) {
    this.lastEvent = event;
    return true;
  }
};

global.CustomEvent = class {
  constructor(type, options = {}) {
    this.type = type;
    Object.assign(this, options);
  }
};

await import(`file:///${process.cwd().replace(/\\/g, "/")}/river-wise-card.js`);

const RiverWiseCard = registry.get("river-wise-card");
const RiverWiseCardEditor = registry.get("river-wise-card-editor");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const station = {
  uuid: "a6ee8177-107b-47dd-bcfd-30960ccc6e9c",
  number: "2730010",
  shortname: "KÖLN",
  longname: "KÖLN",
  water: { shortname: "RHEIN", longname: "RHEIN" },
  timeseries: [
    {
      shortname: "Q",
      unit: "m³/s",
      currentMeasurement: { timestamp: "2026-07-31T15:00:00+02:00", value: 643 },
    },
    {
      shortname: "W",
      unit: "cm",
      currentMeasurement: {
        timestamp: "2026-07-31T15:15:00+02:00",
        value: 70,
        stateMnwMhw: "low",
        stateNswHsw: "normal",
      },
    },
  ],
};

{
  const card = new RiverWiseCard();
  card.config = {
    provider: "de_pegelonline",
    gauge: station.uuid,
    de_station: station.uuid,
    title: "Cologne Rhine",
    show_forecast: true,
  };
  const measurements = Array.from({ length: 400 }, (_, index) => ({
    timestamp: new Date(Date.UTC(2026, 6, 27, 0, index * 15)).toISOString(),
    value: index / 10,
  }));
  const requested = [];
  card.fetchJson = async (url) => {
    requested.push(url);
    return url.includes("measurements.json") ? measurements : station;
  };
  const debug = {
    fallbackBehavior: [],
    missingFields: [],
  };

  const model = await card.loadDePegelonline(debug);

  assert(requested.length === 2, "Germany provider should request station metadata and measurement history");
  assert(requested.some((url) => url.includes("start=P7D")), "Germany provider should request seven days of history");
  assert(model.provider === "de_pegelonline", "Germany provider should identify its normalized model");
  assert(model.id === "2730010", "Germany model should expose the public station number");
  assert(model.name === "KÖLN" && model.riverName === "RHEIN", "Germany model should preserve station and waterway names");
  assert(model.stage === 70 && model.stageUnit === "cm", "Germany model should use the current W measurement");
  assert(model.flow === 643 && model.flowUnit === "m³/s", "Germany model should expose current Q discharge when available");
  assert(model.category === "Low Water", "Germany model should map the official low-water state");
  assert(model.forecastPoints.length === 0 && model.crest === null, "Germany model should remain observed-only");
  assert(model.observedPoints.length <= 288, "Germany history should be downsampled for bounded rendering");
  assert(model.observedPoints.at(-1).stage === 39.9, "Germany history should preserve the newest measurement");
  assert(model.attribution.includes("PEGELONLINE"), "Germany model should include provider attribution");
}

{
  const card = new RiverWiseCard();
  card.config = { provider: "de_pegelonline" };
  assert(card.deWaterCategory({ stateMnwMhw: "high" }) === "High Water", "high official state should map to High Water");
  assert(card.deWaterCategory({ stateMnwMhw: "normal" }) === "Normal", "normal official state should map to Normal");
  assert(card.deWaterCategory({}) === "Unknown", "missing official state should map to Unknown");
  assert(card.pickDeTimeseries(station.timeseries, "W").unit === "cm", "water-level timeseries selection should use W");
  assert(card.pickDeTimeseries(station.timeseries, "Q").unit === "m³/s", "discharge timeseries selection should use Q");
}

{
  const editor = new RiverWiseCardEditor();
  editor.config = { provider: "de_pegelonline", gauge: station.uuid, de_station: station.uuid };
  editor.deStationOptions = [
    station,
    {
      uuid: "second-station",
      number: "1234567",
      shortname: "HAMBURG",
      longname: "HAMBURG",
      water: { longname: "ELBE" },
      timeseries: [{ shortname: "W", unit: "cm" }],
    },
  ];
  editor.deStationFilter = "rhein";
  editor.deStationLoading = false;
  editor.deStationError = "";

  assert(editor.hasUsableDeWaterLevel(station), "editor should accept PEGELONLINE stations with a W timeseries");
  assert(editor.filteredDeStationOptions().length === 1, "German station filter should match the waterway name");
  assert(editor.filteredDeStationOptions()[0].uuid === station.uuid, "German station filter should preserve the matching station");
  assert(editor.renderDeStationOptions().includes("2730010"), "German station selector should render the public station number");
  assert(editor.renderDeEditor().includes('data-key="de_station"'), "visual editor should render manual German station lookup");
}

console.log("RiverWise provider behavior tests passed");
