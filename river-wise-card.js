const RIVER_WISE_STATE_BBOXES = {
  AL: [-88.6, 30.1, -84.8, 35.1],
  AK: [-179.2, 51.2, -129.9, 71.5],
  AZ: [-114.9, 31.2, -109.0, 37.1],
  AR: [-94.7, 33.0, -89.6, 36.6],
  CA: [-124.5, 32.5, -114.1, 42.1],
  CO: [-109.1, 36.9, -102.0, 41.1],
  CT: [-73.8, 40.9, -71.7, 42.1],
  DE: [-75.8, 38.4, -75.0, 39.9],
  DC: [-77.2, 38.8, -76.9, 39.0],
  FL: [-87.7, 24.4, -80.0, 31.1],
  GA: [-85.7, 30.3, -80.8, 35.1],
  HI: [-160.3, 18.8, -154.7, 22.3],
  ID: [-117.3, 42.0, -111.0, 49.1],
  IL: [-91.6, 36.9, -87.0, 42.6],
  IN: [-88.2, 37.7, -84.7, 41.8],
  IA: [-96.7, 40.3, -90.1, 43.6],
  KS: [-102.1, 36.9, -94.6, 40.1],
  KY: [-89.7, 36.4, -81.9, 39.2],
  LA: [-94.1, 28.8, -88.8, 33.1],
  ME: [-71.1, 43.0, -66.8, 47.5],
  MD: [-79.6, 37.8, -75.0, 39.8],
  MA: [-73.6, 41.2, -69.8, 42.9],
  MI: [-90.5, 41.6, -82.1, 48.4],
  MN: [-97.3, 43.4, -89.5, 49.4],
  MS: [-91.7, 30.1, -88.1, 35.1],
  MO: [-95.8, 35.9, -89.0, 40.7],
  MT: [-116.1, 44.3, -104.0, 49.1],
  NE: [-104.1, 39.9, -95.2, 43.1],
  NV: [-120.1, 35.0, -114.0, 42.1],
  NH: [-72.6, 42.6, -70.6, 45.4],
  NJ: [-75.6, 38.9, -73.9, 41.4],
  NM: [-109.1, 31.3, -103.0, 37.1],
  NY: [-79.8, 40.4, -71.8, 45.1],
  NC: [-84.4, 33.8, -75.4, 36.7],
  ND: [-104.1, 45.9, -96.5, 49.1],
  OH: [-84.9, 38.3, -80.5, 41.9],
  OK: [-103.1, 33.6, -94.4, 37.1],
  OR: [-124.7, 41.9, -116.4, 46.4],
  PA: [-80.6, 39.6, -74.6, 42.6],
  RI: [-71.9, 41.1, -71.1, 42.1],
  SC: [-83.4, 32.0, -78.5, 35.3],
  SD: [-104.1, 42.4, -96.4, 45.9],
  TN: [-90.4, 34.9, -81.6, 36.7],
  TX: [-106.7, 25.8, -93.5, 36.6],
  UT: [-114.1, 36.9, -109.0, 42.1],
  VT: [-73.5, 42.7, -71.4, 45.1],
  VA: [-83.8, 36.5, -75.2, 39.5],
  WA: [-124.9, 45.5, -116.9, 49.1],
  WV: [-82.7, 37.2, -77.6, 40.7],
  WI: [-92.9, 42.4, -86.8, 47.1],
  WY: [-111.1, 40.9, -104.0, 45.1],
};

const RIVER_WISE_STATE_NAMES = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  DC: "District of Columbia",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
};

class RiverWiseCard extends HTMLElement {
  setConfig(config) {
    if (!config || !config.gauge) {
      throw new Error("RiverWise requires a gauge id");
    }

    this.config = {
      title: "RiverWise",
      units: "english",
      show_forecast: true,
      show_impacts: true,
      debug: false,
      ...config,
    };

    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
    }

    this.renderShell();
    this.load();
  }

  set hass(value) {
    this._hass = value;
  }

  getCardSize() {
    return 5;
  }

  static getConfigElement() {
    return document.createElement("river-wise-card-editor");
  }

  static getStubConfig() {
    return {
      title: "Ohio River at Meldahl Dam",
      gauge: "MELO1",
      gauge_state: "OH",
      units: "english",
      show_forecast: true,
      show_impacts: true,
    };
  }

  endpoint(path = "") {
    return `https://api.water.noaa.gov/nwps/v1/gauges/${encodeURIComponent(this.config.gauge)}${path}`;
  }

  async load() {
    const debug = {
      endpoint: this.endpoint(),
      gaugeMetadataReceived: false,
      observedDataCount: 0,
      forecastDataCount: 0,
      floodThresholds: null,
      lastUpdateTime: null,
      missingFields: [],
      fallbackBehavior: [],
    };

    try {
      const metadataPromise = this.fetchJson(this.endpoint());
      const observedPromise = this.fetchJson(this.endpoint("/stageflow/observed"));
      const forecastPromise = this.config.show_forecast
        ? this.fetchJson(this.endpoint("/stageflow/forecast")).catch((error) => {
            debug.fallbackBehavior.push(`Forecast unavailable: ${error.message}`);
            return null;
          })
        : Promise.resolve(null);

      const [metadata, observed, forecast] = await Promise.all([
        metadataPromise,
        observedPromise,
        forecastPromise,
      ]);

      const model = this.normalize(metadata, observed, forecast, debug);
      this.render(model);
    } catch (error) {
      this.renderError(error, debug);
    }
  }

  async fetchJson(url) {
    const response = await fetch(url, { mode: "cors" });
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }
    return response.json();
  }

  normalize(metadata, observed, forecast, debug) {
    const observedPoints = this.normalizePoints(observed && observed.data);
    const forecastPoints = this.normalizePoints(forecast && forecast.data);
    const latest = observedPoints.length ? observedPoints[observedPoints.length - 1] : null;
    const previous = observedPoints.length > 4
      ? observedPoints[observedPoints.length - 5]
      : observedPoints.length > 1
        ? observedPoints[observedPoints.length - 2]
        : null;

    const observedStatus = metadata && metadata.status && metadata.status.observed
      ? metadata.status.observed
      : {};
    const thresholds = metadata && metadata.flood && metadata.flood.categories
      ? metadata.flood.categories
      : {};

    const currentStage = this.validNumber(observedStatus.primary) !== null
      ? this.validNumber(observedStatus.primary)
      : latest
        ? latest.stage
        : null;
    const currentFlow = this.validNumber(observedStatus.secondary);
    const floodStage = this.validNumber(thresholds.minor && thresholds.minor.stage);
    const crest = this.findForecastCrest(forecastPoints);
    const updated = observedStatus.validTime || (latest ? latest.time.toISOString() : null);

    debug.gaugeMetadataReceived = Boolean(metadata && metadata.lid);
    debug.observedDataCount = observedPoints.length;
    debug.forecastDataCount = forecastPoints.length;
    debug.floodThresholds = thresholds;
    debug.lastUpdateTime = updated;

    if (!metadata || !metadata.lid) debug.missingFields.push("metadata.lid");
    if (currentStage === null) debug.missingFields.push("metadata.status.observed.primary");
    if (floodStage === null) debug.missingFields.push("flood.categories.minor.stage");
    if (!observedPoints.length) debug.missingFields.push("observed.data");
    if (this.config.show_forecast && !forecastPoints.length) {
      debug.fallbackBehavior.push("Forecast series missing or empty; rendering observed-only hydrograph.");
    }

    return {
      metadata,
      observed,
      forecast,
      debug,
      name: (metadata && metadata.name) || this.config.title,
      id: (metadata && metadata.lid) || this.config.gauge,
      stage: currentStage,
      stageUnit: observedStatus.primaryUnit || (observed && observed.primaryUnits) || "ft",
      flow: currentFlow,
      flowUnit: observedStatus.secondaryUnit || (observed && observed.secondaryUnits) || "",
      updated,
      trend: this.trend(latest, previous),
      category: this.categoryFor(currentStage, thresholds),
      thresholds,
      floodStage,
      observedPoints,
      forecastPoints,
      crest,
      impacts: metadata && metadata.flood && Array.isArray(metadata.flood.impacts)
        ? metadata.flood.impacts
        : [],
    };
  }

  normalizePoints(data) {
    if (!Array.isArray(data)) return [];

    return data
      .map((point) => ({
        time: new Date(point.validTime),
        stage: this.validNumber(point.primary),
        flow: this.validNumber(point.secondary),
        generatedTime: point.generatedTime,
      }))
      .filter((point) => point.stage !== null && !Number.isNaN(point.time.getTime()));
  }

  validNumber(value) {
    return typeof value === "number" && Number.isFinite(value) && value > -900
      ? value
      : null;
  }

  trend(latest, previous) {
    if (!latest || !previous) {
      return { label: "steady", delta: 0 };
    }

    const delta = latest.stage - previous.stage;
    if (delta > 0.05) return { label: "rising", delta };
    if (delta < -0.05) return { label: "falling", delta };
    return { label: "steady", delta };
  }

  categoryFor(stage, categories) {
    if (stage === null || stage === undefined) return "Unknown";

    const major = this.validNumber(categories && categories.major && categories.major.stage);
    const moderate = this.validNumber(categories && categories.moderate && categories.moderate.stage);
    const minor = this.validNumber(categories && categories.minor && categories.minor.stage);
    const action = this.validNumber(categories && categories.action && categories.action.stage);

    if (major !== null && stage >= major) return "Major Flood";
    if (moderate !== null && stage >= moderate) return "Moderate Flood";
    if (minor !== null && stage >= minor) return "Minor Flood";
    if (action !== null && stage >= action) return "Action";
    return "Normal";
  }

  findForecastCrest(points) {
    if (!points.length) return null;
    return points.reduce((crest, point) => {
      if (!crest || point.stage > crest.stage) return point;
      return crest;
    }, null);
  }

  forecastSummary(model) {
    if (!model.crest) {
      return "Forecast data is not available for this gauge.";
    }

    const crestText = `${this.formatNumber(model.crest.stage, 1)} ${model.stageUnit}`;
    const crestTime = this.formatTime(model.crest.time);

    if (model.floodStage === null) {
      return `Crest expected ${crestTime} at ${crestText}. Flood stage was not provided by NWPS metadata.`;
    }

    const distance = model.floodStage - model.crest.stage;
    const relation = distance >= 0 ? "below" : "above";
    const crestCategory = this.categoryFor(model.crest.stage, model.thresholds);
    const lead = crestCategory === "Normal" ? "Below flood stage" : `${crestCategory} forecast`;

    return `${lead}. Crest expected ${crestTime} at ${crestText}. Forecast crest is ${Math.abs(distance).toFixed(1)} ${model.stageUnit} ${relation} flood stage.`;
  }

  formatTime(value) {
    if (!value) return "Unknown";
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return "Unknown";

    return new Intl.DateTimeFormat(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  }

  formatNumber(value, digits = 1) {
    return value === null || value === undefined || Number.isNaN(Number(value))
      ? "--"
      : Number(value).toFixed(digits);
  }

  renderShell() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          --river-wise-normal: var(--river-wise-color-normal, var(--primary-color, #1d7f76));
          --river-wise-forecast: var(--river-wise-color-forecast, var(--info-color, #2f6fba));
          --river-wise-action: var(--river-wise-color-action, #d7a414);
          --river-wise-minor: var(--river-wise-color-minor, #e57a22);
          --river-wise-moderate: var(--river-wise-color-moderate, #c73535);
          --river-wise-major: var(--river-wise-color-major, #7f4bc4);
          --river-wise-surface: var(--ha-card-background, var(--card-background-color, #fff));
          --river-wise-soft: color-mix(in srgb, var(--primary-text-color) 4%, transparent);
          --river-wise-border: color-mix(in srgb, var(--primary-text-color) 14%, transparent);
        }

        ha-card {
          position: relative;
          overflow: hidden;
          color: var(--primary-text-color);
          background: var(--river-wise-surface);
          border-radius: var(--ha-card-border-radius, 12px);
        }

        ha-card::before {
          content: "";
          display: block;
          height: 4px;
          background: linear-gradient(90deg, var(--river-wise-normal), var(--river-wise-forecast));
        }

        .wrap {
          padding: 18px;
          display: grid;
          gap: 16px;
        }

        .header {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: flex-start;
        }

        h2 {
          margin: 0;
          font-size: 19px;
          line-height: 1.2;
          font-weight: 700;
        }

        .subtle {
          color: var(--secondary-text-color);
          font-size: 12px;
        }

        .stage {
          font-size: 46px;
          font-weight: 700;
          line-height: 1;
          color: var(--river-wise-normal);
        }

        .unit {
          font-size: 16px;
          color: var(--secondary-text-color);
        }

        .pill {
          border-radius: 999px;
          padding: 7px 11px;
          font-size: 12px;
          font-weight: 700;
          background: color-mix(in srgb, var(--river-wise-normal) 16%, transparent);
          color: var(--river-wise-normal);
          white-space: nowrap;
        }

        .pill.action {
          background: color-mix(in srgb, var(--river-wise-action) 20%, transparent);
          color: var(--river-wise-action);
        }

        .pill.minor {
          background: color-mix(in srgb, var(--river-wise-minor) 20%, transparent);
          color: var(--river-wise-minor);
        }

        .pill.moderate {
          background: color-mix(in srgb, var(--river-wise-moderate) 18%, transparent);
          color: var(--river-wise-moderate);
        }

        .pill.major {
          background: color-mix(in srgb, var(--river-wise-major) 18%, transparent);
          color: var(--river-wise-major);
        }

        .stats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
        }

        .stat {
          border: 1px solid var(--river-wise-border);
          border-radius: 8px;
          background: var(--river-wise-soft);
          padding: 11px;
          min-width: 0;
        }

        .label {
          color: var(--secondary-text-color);
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: .04em;
        }

        .value {
          margin-top: 3px;
          font-size: 14px;
          font-weight: 650;
          overflow-wrap: anywhere;
        }

        .legend {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          color: var(--secondary-text-color);
          font-size: 12px;
          align-items: center;
        }

        .legend-item {
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }

        .legend-swatch {
          width: 22px;
          height: 0;
          border-top: 3px solid var(--river-wise-normal);
        }

        .legend-swatch.forecast-line {
          border-top-color: var(--river-wise-forecast);
          border-top-style: dashed;
        }

        svg {
          display: block;
          width: 100%;
          height: 260px;
          overflow: visible;
        }

        .axis,
        .grid {
          stroke: var(--river-wise-border);
          stroke-width: 1;
        }

        .threshold {
          stroke-width: 1.4;
          stroke-dasharray: 4 4;
        }

        .threshold.out-of-range {
          opacity: .9;
        }

        .axis-label {
          fill: var(--secondary-text-color);
          font-size: 10px;
        }

        .observed {
          fill: none;
          stroke: var(--river-wise-normal);
          stroke-width: 2.4;
        }

        .forecast {
          fill: none;
          stroke: var(--river-wise-forecast);
          stroke-width: 2.4;
          stroke-dasharray: 7 5;
        }

        .summary {
          border-left: 4px solid var(--river-wise-forecast);
          background: color-mix(in srgb, var(--river-wise-forecast) 8%, transparent);
          border-radius: 0 8px 8px 0;
          padding: 10px 12px;
          line-height: 1.35;
        }

        details {
          border-top: 1px solid var(--river-wise-border);
          padding-top: 10px;
        }

        summary {
          cursor: pointer;
          font-weight: 650;
        }

        .impact {
          margin-top: 8px;
          font-size: 13px;
          line-height: 1.35;
        }

        @media (max-width: 420px) {
          .stats {
            grid-template-columns: 1fr;
          }

          .stage {
            font-size: 36px;
          }
        }
      </style>
      <ha-card>
        <div class="wrap">Loading river gauge...</div>
      </ha-card>
    `;
  }

  render(model) {
    this._riverWiseDebug = model.debug;
    if (this.config.debug) {
      console.debug("RiverWise debug", model.debug);
    }

    const categoryClass = model.category.toLowerCase().replace(" flood", "");
    const flowText = model.flow === null
      ? "Unavailable"
      : `${this.formatNumber(model.flow, 0)} ${model.flowUnit}`;

    this.shadowRoot.querySelector(".wrap").innerHTML = `
      <div class="header">
        <div>
          <h2>${this.escape(this.config.title || model.name)}</h2>
          <div class="subtle">${this.escape(model.name)} &middot; ${this.escape(model.id)}</div>
        </div>
        <div class="pill ${this.escape(categoryClass)}">${this.escape(model.category)}</div>
      </div>

      <div>
        <span class="stage">${this.formatNumber(model.stage, 2)}</span>
        <span class="unit">${this.escape(model.stageUnit)}</span>
      </div>

      <div class="stats">
        <div class="stat">
          <div class="label">Flow</div>
          <div class="value">${this.escape(flowText)}</div>
        </div>
        <div class="stat">
          <div class="label">Trend</div>
          <div class="value">${this.escape(model.trend.label)}</div>
        </div>
        <div class="stat">
          <div class="label">Updated</div>
          <div class="value">${this.escape(this.formatTime(model.updated))}</div>
        </div>
      </div>

      ${this.renderHydrograph(model)}
      <div class="summary">${this.escape(this.forecastSummary(model))}</div>
      ${this.renderImpacts(model)}
    `;
  }

  renderHydrograph(model) {
    const observed = model.observedPoints.slice(Math.max(0, model.observedPoints.length - 288));
    const forecast = model.forecastPoints;
    const points = observed.concat(forecast);

    if (!points.length) {
      return `<div class="subtle">No hydrograph data available.</div>`;
    }

    const width = 640;
    const height = 260;
    const pad = { left: 42, right: 18, top: 18, bottom: 34 };
    const thresholds = this.thresholdList(model.thresholds);
    const stages = points.map((point) => point.stage);
    const minStage = Math.floor(Math.min(...stages) - 1);
    const maxStage = Math.ceil(Math.max(...stages) + 1);
    const minTime = Math.min(...points.map((point) => point.time.getTime()));
    const maxTime = Math.max(...points.map((point) => point.time.getTime()));
    const innerWidth = width - pad.left - pad.right;
    const innerHeight = height - pad.top - pad.bottom;

    const x = (time) => pad.left + ((time.getTime() - minTime) / (maxTime - minTime || 1)) * innerWidth;
    const y = (stage) => height - pad.bottom - ((stage - minStage) / (maxStage - minStage || 1)) * innerHeight;
    const path = (series) => series
      .map((point, index) => `${index ? "L" : "M"}${x(point.time).toFixed(1)} ${y(point.stage).toFixed(1)}`)
      .join(" ");

    const current = observed.length ? observed[observed.length - 1] : null;
    const crest = model.crest;
    const tickTimes = [points[0], points[Math.floor(points.length / 2)], points[points.length - 1]].filter(Boolean);
    const yTicks = [maxStage, (minStage + maxStage) / 2, minStage];
    const thresholdColor = {
      action: "#d7a414",
      minor: "#e57a22",
      moderate: "#c73535",
      major: "#7f4bc4",
    };
    const thresholdY = (item, index) => {
      if (item.stage > maxStage) return pad.top + index * 14;
      if (item.stage < minStage) return height - pad.bottom - index * 14;
      return y(item.stage);
    };
    const thresholdLabel = (item) => {
      const suffix = item.stage > maxStage ? " above view" : item.stage < minStage ? " below view" : "";
      return `${item.key} ${this.formatNumber(item.stage, 0)} ft${suffix}`;
    };

    return `
      <div class="legend">
        <span class="legend-item"><span class="legend-swatch"></span>Observed</span>
        ${forecast.length ? `<span class="legend-item"><span class="legend-swatch forecast-line"></span>Forecast</span>` : ""}
      </div>
      <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Observed and forecast river stage hydrograph">
        ${[0, 0.5, 1].map((n) => {
          const lineY = pad.top + n * innerHeight;
          return `<line class="grid" x1="${pad.left}" x2="${width - pad.right}" y1="${lineY}" y2="${lineY}"></line>`;
        }).join("")}
        ${yTicks.map((tick) => `
          <text class="axis-label" x="${pad.left - 7}" y="${y(tick) + 3}" text-anchor="end">${this.formatNumber(tick, 0)}</text>
        `).join("")}

        ${thresholds.map((item, index) => {
          const lineY = thresholdY(item, index);
          const outOfRange = item.stage > maxStage || item.stage < minStage;
          return `
          <line class="threshold ${outOfRange ? "out-of-range" : ""}" x1="${pad.left}" x2="${width - pad.right}" y1="${lineY}" y2="${lineY}" stroke="${thresholdColor[item.key]}"></line>
          <text x="${width - pad.right - 4}" y="${lineY - 4}" text-anchor="end" font-size="10" fill="${thresholdColor[item.key]}">${this.escape(thresholdLabel(item))}</text>
          `;
        }).join("")}

        ${observed.length ? `<path class="observed" d="${path(observed)}"></path>` : ""}
        ${forecast.length ? `<path class="forecast" d="${path(forecast)}"></path>` : ""}
        ${current ? `<circle cx="${x(current.time)}" cy="${y(current.stage)}" r="4" fill="#14786f"></circle>` : ""}
        ${crest ? `<circle cx="${x(crest.time)}" cy="${y(crest.stage)}" r="4" fill="#2f6fba" stroke="white" stroke-width="2"></circle>` : ""}

        <line class="axis" x1="${pad.left}" x2="${width - pad.right}" y1="${height - pad.bottom}" y2="${height - pad.bottom}"></line>
        ${tickTimes.map((point) => `
          <text x="${x(point.time)}" y="${height - 8}" text-anchor="middle" font-size="10" fill="currentColor">${this.escape(new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(point.time))}</text>
        `).join("")}
      </svg>
    `;
  }

  thresholdList(thresholds) {
    return ["action", "minor", "moderate", "major"]
      .map((key) => ({
        key,
        stage: this.validNumber(thresholds && thresholds[key] && thresholds[key].stage),
      }))
      .filter((item) => item.stage !== null);
  }

  renderImpacts(model) {
    if (!this.config.show_impacts || !model.impacts.length) {
      return "";
    }

    return `
      <details>
        <summary>Flood impacts</summary>
        ${model.impacts.map((impact) => `
          <div class="impact">
            <strong>At ${this.formatNumber(impact.stage, 0)} ${this.escape(model.stageUnit)}:</strong>
            ${this.escape(impact.statement)}
          </div>
        `).join("")}
      </details>
    `;
  }

  renderDebug(debug) {
    this._riverWiseDebug = debug;
    if (this.config.debug) {
      console.debug("RiverWise debug", debug);
    }
    return "";
  }

  renderError(error, debug) {
    this._riverWiseDebug = debug;
    if (this.config.debug) {
      console.debug("RiverWise debug", debug);
    }

    this.shadowRoot.querySelector(".wrap").innerHTML = `
      <div class="header">
        <h2>${this.escape(this.config.title)}</h2>
      </div>
      <div>Unable to load NWPS gauge data: ${this.escape(error.message)}</div>
    `;
  }

  escape(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    }[char]));
  }
}

class RiverWiseCardEditor extends HTMLElement {
  setConfig(config) {
    this.config = {
      title: "Ohio River at Meldahl Dam",
      gauge: "MELO1",
      gauge_state: "OH",
      units: "english",
      show_forecast: true,
      show_impacts: true,
      ...config,
    };

    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
    }

    if (typeof this.lookupLoading !== "boolean") this.lookupLoading = false;
    if (typeof this.lookupError !== "string") this.lookupError = "";
    if (typeof this.lookupName !== "string") this.lookupName = "";
    if (!Array.isArray(this.stateGaugeOptions)) this.stateGaugeOptions = [];
    if (typeof this.stateGaugeLoading !== "boolean") this.stateGaugeLoading = false;
    if (typeof this.stateGaugeError !== "string") this.stateGaugeError = "";
    this.render();
    if (this.config.gauge_state && this.lastStateLoaded !== this.config.gauge_state && !this.stateGaugeLoading) {
      this.loadStateGaugeOptions(this.config.gauge_state);
    }
  }

  set hass(value) {
    this._hass = value;
  }

  stateGaugeUrl(state) {
    const bbox = RIVER_WISE_STATE_BBOXES[state];
    if (!bbox) return "";
    const params = new URLSearchParams({
      "bbox.xmin": bbox[0],
      "bbox.ymin": bbox[1],
      "bbox.xmax": bbox[2],
      "bbox.ymax": bbox[3],
      srid: "EPSG_4326",
    });
    return `https://api.water.noaa.gov/nwps/v1/gauges?${params.toString()}`;
  }

  async loadStateGaugeOptions(state) {
    const selectedState = String(state || "").toUpperCase();
    if (!selectedState || !RIVER_WISE_STATE_BBOXES[selectedState]) return;

    this.stateGaugeLoading = true;
    this.stateGaugeError = "";
    this.lastStateLoaded = selectedState;
    this.render();

    try {
      const response = await fetch(this.stateGaugeUrl(selectedState), { mode: "cors" });
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const gauges = Array.isArray(data.gauges) ? data.gauges : [];
      this.stateGaugeOptions = gauges
        .filter((gauge) => gauge && gauge.lid && gauge.name)
        .sort((a, b) => String(a.name).localeCompare(String(b.name)));
    } catch (error) {
      this.stateGaugeOptions = [];
      this.stateGaugeError = error.message;
    } finally {
      this.stateGaugeLoading = false;
      this.render();
    }
  }

  async lookupGaugeName(gaugeId) {
    const id = String(gaugeId || "").trim().toUpperCase();
    if (!id) return;

    this.lookupLoading = true;
    this.lookupError = "";
    this.lookupName = "";
    this.render();

    try {
      const response = await fetch(`https://api.water.noaa.gov/nwps/v1/gauges/${encodeURIComponent(id)}`, { mode: "cors" });
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }

      const metadata = await response.json();
      this.lookupName = metadata && metadata.name ? metadata.name : "";

      if (this.lookupName) {
        this.commitConfig({
          ...this.config,
          gauge: id,
          title: this.lookupName,
          gauge_state: metadata && metadata.state && metadata.state.abbreviation
            ? metadata.state.abbreviation
            : this.config.gauge_state,
        }, false);
      }
    } catch (error) {
      this.lookupError = error.message;
    } finally {
      this.lookupLoading = false;
      this.render();
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        .editor {
          display: grid;
          gap: 14px;
          padding: 4px 0;
        }

        .row {
          display: grid;
          gap: 6px;
        }

        label {
          color: var(--secondary-text-color);
          font-size: 12px;
          font-weight: 500;
        }

        input,
        select {
          box-sizing: border-box;
          width: 100%;
          border: 1px solid var(--divider-color);
          border-radius: 6px;
          background: var(--card-background-color);
          color: var(--primary-text-color);
          font: inherit;
          padding: 10px;
        }

        .toggle {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          border-top: 1px solid var(--divider-color);
          padding-top: 10px;
        }

        .toggle span {
          font-weight: 500;
        }

        input[type="checkbox"] {
          width: 20px;
          height: 20px;
          accent-color: var(--primary-color);
        }

        button {
          border: 0;
          border-radius: 6px;
          background: var(--primary-color);
          color: var(--text-primary-color);
          font: inherit;
          font-weight: 600;
          padding: 10px 12px;
          cursor: pointer;
        }

        button:disabled {
          opacity: .55;
          cursor: default;
        }

        .hint {
          color: var(--secondary-text-color);
          font-size: 12px;
          line-height: 1.35;
        }

        .hint-block {
          color: var(--secondary-text-color);
          font-size: 12px;
          line-height: 1.35;
          margin-top: 2px;
        }

        .error {
          color: var(--error-color, #db4437);
        }

      </style>

      <div class="editor">
        <div class="row">
          <label for="title">Title</label>
          <input id="title" data-key="title" value="${this.escape(this.config.title)}" placeholder="Ohio River at Meldahl Dam">
        </div>

        <div class="row">
          <label for="gauge-state">State</label>
          <select id="gauge-state" data-key="gauge_state">
            ${this.renderStateOptions()}
          </select>
          <div class="hint-block">Choose a state to load NOAA/NWS gauges for that state.</div>
        </div>

        <div class="row">
          <label for="gauge-select">Gauge</label>
          <select id="gauge-select" data-key="gauge_select" ${this.stateGaugeLoading ? "disabled" : ""}>
            ${this.renderGaugeOptions()}
          </select>
          <div class="hint-block">
            ${this.stateGaugeLoading ? "Loading gauges..." : `${this.stateGaugeOptions.length} gauges loaded.`}
            ${this.stateGaugeError ? `<br><span class="error">Gauge list failed: ${this.escape(this.stateGaugeError)}</span>` : ""}
          </div>
        </div>

        <div class="row">
          <label for="gauge">Manual gauge code</label>
          <input id="gauge" data-key="gauge" value="${this.escape(this.config.gauge)}" placeholder="MELO1">
          <button type="button" id="lookup-gauge" ${this.lookupLoading ? "disabled" : ""}>${this.lookupLoading ? "Looking up..." : "Look up code"}</button>
          <div class="hint-block">
            Optional: paste a known NWPS code here. The title will update from NOAA when the code is found.
            ${this.lookupName ? `<br>Found: ${this.escape(this.lookupName)}` : ""}
            ${this.lookupError ? `<br><span class="error">Gauge lookup failed: ${this.escape(this.lookupError)}</span>` : ""}
          </div>
        </div>

        <div class="row">
          <label for="units">Units</label>
          <select id="units" data-key="units">
            <option value="english" ${this.config.units === "english" ? "selected" : ""}>English</option>
            <option value="metric" ${this.config.units === "metric" ? "selected" : ""}>Metric</option>
          </select>
        </div>

        ${this.renderToggle("show_forecast", "Show forecast hydrograph")}
        ${this.renderToggle("show_impacts", "Show flood impacts")}
      </div>
    `;

    this.shadowRoot.querySelectorAll("select[data-key], input[type='checkbox'][data-key]").forEach((input) => {
      input.addEventListener("change", (event) => this.valueChanged(event));
    });

    this.shadowRoot.querySelectorAll("input[data-key]:not([type='checkbox'])").forEach((input) => {
      input.addEventListener("change", (event) => this.valueChanged(event));
      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.currentTarget.blur();
        }
      });
    });

    const lookupButton = this.shadowRoot.querySelector("#lookup-gauge");
    if (lookupButton) {
      lookupButton.addEventListener("click", () => this.lookupGaugeName(this.config.gauge));
    }
  }

  renderStateOptions() {
    const selected = String(this.config.gauge_state || "").toUpperCase();
    return Object.keys(RIVER_WISE_STATE_NAMES)
      .map((state) => `
        <option value="${this.escape(state)}" ${state === selected ? "selected" : ""}>
          ${this.escape(RIVER_WISE_STATE_NAMES[state])}
        </option>
      `)
      .join("");
  }

  renderGaugeOptions() {
    const selectedGauge = String(this.config.gauge || "").toUpperCase();
    const hasSelected = this.stateGaugeOptions.some((gauge) => String(gauge.lid).toUpperCase() === selectedGauge);
    const options = [];

    if (!hasSelected && selectedGauge) {
      options.push(`<option value="${this.escape(selectedGauge)}" selected>${this.escape(selectedGauge)} - current gauge</option>`);
    }

    if (!this.stateGaugeOptions.length) {
      options.push(`<option value="${this.escape(selectedGauge)}" selected>${this.stateGaugeLoading ? "Loading gauges..." : "Choose a state first"}</option>`);
    }

    this.stateGaugeOptions.forEach((gauge) => {
      const lid = String(gauge.lid).toUpperCase();
      const selected = lid === selectedGauge ? "selected" : "";
      options.push(`
        <option value="${this.escape(lid)}" data-name="${this.escape(gauge.name)}" ${selected}>
          ${this.escape(gauge.name)} (${this.escape(lid)})
        </option>
      `);
    });

    return options.join("");
  }

  renderToggle(key, label) {
    return `
      <label class="toggle">
        <span>${this.escape(label)}</span>
        <input type="checkbox" data-key="${this.escape(key)}" ${this.config[key] ? "checked" : ""}>
      </label>
    `;
  }

  valueChanged(event) {
    const target = event.currentTarget;
    const key = target.dataset.key;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const config = { ...this.config };

    if (key === "gauge") {
      config.gauge = String(value).trim().toUpperCase();
    } else if (key === "gauge_state") {
      config.gauge_state = String(value).trim().toUpperCase();
    } else if (key === "gauge_select") {
      config.gauge = String(value).trim().toUpperCase();
      const selectedOption = target.selectedOptions && target.selectedOptions[0];
      const selectedName = selectedOption ? selectedOption.dataset.name : "";
      if (selectedName) {
        config.title = selectedName;
      }
    } else {
      config[key] = value;
    }

    this.commitConfig(config);
    if (key === "gauge") {
      this.lookupGaugeName(config.gauge);
    } else if (key === "gauge_state") {
      this.stateGaugeOptions = [];
      this.loadStateGaugeOptions(config.gauge_state);
    }
  }

  commitConfig(config, rerender = true) {
    this.config = config;
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config },
      bubbles: true,
      composed: true,
    }));
    if (rerender) {
      this.render();
    }
  }

  escape(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    }[char]));
  }
}

if (!customElements.get("river-wise-card")) {
  customElements.define("river-wise-card", RiverWiseCard);
}

if (!customElements.get("river-wise-card-editor")) {
  customElements.define("river-wise-card-editor", RiverWiseCardEditor);
}
