# RiverWise / FloodWise / GaugeWise Feasibility

Feasibility result: a sibling Home Assistant custom card is practical as a standalone project using NOAA/NWS National Water Prediction Service JSON APIs. The best working name is `RiverWise`: it keeps the TideWise family feel while being broad enough for ordinary stage/flow gauges, not only flood events.

## Tested Gauge

`MELO1` maps to `Ohio River at Meldahl Dam`.

Live API observations from May 24, 2026:

- Metadata endpoint loaded successfully.
- Current observed stage: `27.61 ft`.
- Current observed flow: `160 kcfs`.
- Current category: `no_flooding`, shown in the card as `Normal`.
- Last observed update: `2026-05-24T14:30:00Z`.
- Flood thresholds were provided by metadata: action `49 ft`, minor `51 ft`, moderate `58 ft`, major `64 ft`.
- Observed hydrograph loaded with `2794` points from `2026-04-24T15:00:00Z` through `2026-05-24T14:30:00Z`.
- Forecast hydrograph loaded with `20` points.
- Forecast crest from the forecast series: `33.8 ft` at `2026-05-26T12:00:00Z`.
- Forecast crest is `17.2 ft` below minor flood stage.
- Flood impacts were provided: `14` impact statements.

## Tested Endpoints

All requested endpoints returned JSON for `MELO1`:

```text
https://api.water.noaa.gov/nwps/v1/gauges/MELO1
https://api.water.noaa.gov/nwps/v1/gauges/MELO1/stageflow
https://api.water.noaa.gov/nwps/v1/gauges/MELO1/stageflow/observed
https://api.water.noaa.gov/nwps/v1/gauges/MELO1/stageflow/forecast
```

The aggregate `stageflow` endpoint returns both `observed` and `forecast`. The split endpoints are simpler for error handling because forecast can fail or be absent without losing observed data.

## CORS

Direct browser fetch appears feasible. A request with an `Origin` header returned:

```text
Access-Control-Allow-Origin: *
Vary: Origin
Content-Type: application/json
```

I could not complete a true in-app browser page fetch because this Codex browser blocks local test URLs, but the NWPS response headers are what a browser needs for a Lovelace custom card. The prototype still includes graceful fetch error handling. If Home Assistant deployment uncovers a stricter environment, fallback options are:

- Home Assistant REST sensors
- A lightweight custom integration backend
- A proxy/helper endpoint

## Data Mapping

Metadata:

- Gauge name: `metadata.name`
- Gauge ID: `metadata.lid`
- Current stage: `metadata.status.observed.primary`
- Stage unit: `metadata.status.observed.primaryUnit`
- Current flow: `metadata.status.observed.secondary`
- Flow unit: `metadata.status.observed.secondaryUnit`
- Last update: `metadata.status.observed.validTime`
- Current NWPS flood category: `metadata.status.observed.floodCategory`
- Forecast peak status: `metadata.status.forecast`
- Flood thresholds: `metadata.flood.categories`
- Flood impacts: `metadata.flood.impacts`

Time series:

- Observed stage points: `observed.data[].primary`
- Observed flow points: `observed.data[].secondary`
- Forecast stage points: `forecast.data[].primary`
- Timestamp: `data[].validTime`
- Generated timestamp: `data[].generatedTime`

NWPS uses negative sentinel values such as `-999` and `-9999` for missing secondary values. The prototype treats values below `-900` as missing.

## Prototype

The standalone prototype is in:

```text
river-wise-card.js
```

Example Home Assistant config:

```yaml
type: custom:river-wise-card
title: Ohio River at Meldahl Dam
gauge: MELO1
units: english
show_forecast: true
show_impacts: true
debug: false
```

Resource registration example:

```yaml
url: /local/river-wise-card.js
type: module
```

## Implemented Prototype Features

- Current gauge status with name, ID, stage, flow, trend, and update time.
- Flood category awareness from NWPS metadata thresholds.
- Observed solid hydrograph line.
- Forecast dashed hydrograph line when available.
- Horizontal action/minor/moderate/major threshold lines.
- Current point marker.
- Forecast crest marker.
- Forecast summary with crest value/time and flood-stage distance.
- Optional collapsible flood impacts.
- Hidden-by-default debug output with endpoint, metadata status, point counts, thresholds, last update, missing fields, and fallback behavior.

## Architecture Notes

This should remain a separate card rather than being folded into TideWise. The shared ideas are visual language, debug ergonomics, and card structure. The data model is different enough to justify a sibling project:

- Tide data is predictable harmonic/prediction data.
- River data mixes observed telemetry, forecast model output, flood thresholds, impact statements, and missing-value sentinels.
- Forecast availability varies by gauge.
- Flow may be absent even when stage is present.

Recommended project shape:

```text
river-wise-card/
  src/
    river-wise-card.ts
    nwps-client.ts
    hydrograph.ts
    flood-category.ts
  test/
    nwps-client.test.ts
    flood-category.test.ts
  dist/
    river-wise-card.js
```

## Acceptance Check

- MELO1 loads current gauge metadata: yes.
- Card shows current river stage: prototype does.
- Card shows flood thresholds if provided: prototype does.
- Card shows observed hydrograph: prototype does.
- Card shows forecast hydrograph if available: prototype does.
- Card identifies current flood category: prototype does.
- Card does not scrape the water.noaa.gov webpage: confirmed, API only.
- Card handles missing forecast data gracefully: prototype catches forecast failure and continues with observed data.

