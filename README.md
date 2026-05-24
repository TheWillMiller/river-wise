# RiverWise

[![GitHub release](https://img.shields.io/github/v/release/TheWillMiller/river-wise)](https://github.com/TheWillMiller/river-wise/releases)
[![Validate](https://img.shields.io/github/actions/workflow/status/TheWillMiller/river-wise/validate.yml?branch=main&label=validate)](https://github.com/TheWillMiller/river-wise/actions/workflows/validate.yml)
[![GitHub stars](https://img.shields.io/github/stars/TheWillMiller/river-wise?label=stars)](https://github.com/TheWillMiller/river-wise/stargazers)

**Latest release:** `v0.2.1`

RiverWise is a Home Assistant dashboard (Lovelace) custom card for river, lake, reservoir, tailwater, and flood gauges.

It displays current stage, flow when available, trend, observed/forecast hydrographs, flood thresholds, crest summaries, and optional flood impact statements using public government water data.

RiverWise currently supports:

- US NOAA/NWS National Water Prediction Service (NWPS)
- UK Environment Agency flood-monitoring stations for England

> **Beta notice:** RiverWise is early beta software. Please expect occasional provider-specific quirks, missing-data fallbacks, and gauge-specific layout issues while testing.

## Screenshots

### Main RiverWise Card

<img src="https://raw.githubusercontent.com/TheWillMiller/river-wise/main/images/river-wise-card.png" alt="RiverWise card showing river stage, hydrograph, flood thresholds, and forecast summary" width="720">

### Visual Editor

<img src="https://raw.githubusercontent.com/TheWillMiller/river-wise/main/images/river-wise-editor.png" alt="RiverWise visual editor showing provider, state, gauge, and display options" width="720">

## Beta Feedback

RiverWise needs real-world gauge testing. If it works for your setup, please consider starring the repo so I can gauge interest and so you can follow development:

[Star RiverWise on GitHub](https://github.com/TheWillMiller/river-wise)

If you run into issues or want to confirm your gauge works, please open one of these quick reports:

- [Beta Install Report](https://github.com/TheWillMiller/river-wise/issues/new?template=beta-install-report.yml)
- [Works For Me / Confirmed Gauge](https://github.com/TheWillMiller/river-wise/issues/new?template=works-for-me-confirmed-gauge.yml)

Helpful details include Home Assistant version, HACS version, RiverWise version, browser/device, provider, gauge or station code, and a screenshot or console error if something broke.

## Features

- Current gauge name, ID, stage, flow, trend, and update time
- Flood category awareness from NWPS metadata where available
- Observed river-stage hydrograph
- Forecast hydrograph for US NWPS gauges where available
- Flood threshold lines and forecast crest marker
- Forecast summary with distance to flood stage
- Optional flood impact statements where NWPS provides them
- Visual editor support
- US state and gauge selector
- Manual US NWPS gauge code lookup
- UK Environment Agency station search and station lookup
- Home Assistant theme-aware styling
- Hidden YAML-only debug output for troubleshooting

## Installation

### Recommended: HACS Custom Repository

RiverWise is not yet listed in the default/searchable HACS store. Until it is accepted into the default HACS list, install it as a custom HACS repository.

1. Open **HACS** in Home Assistant.
2. Open the three-dot menu in the top right.
3. Choose **Custom repositories**.
4. Add this repository URL:

```text
https://github.com/TheWillMiller/river-wise
```

5. For category, choose **Dashboard**.

   If your HACS version uses older wording, choose the dashboard/card/frontend/plugin-style option.

6. Install **RiverWise**.
7. Refresh Home Assistant.

A hard browser refresh is recommended after installing or updating:

- Windows/Linux: `Ctrl + F5`
- Mac: `Cmd + Shift + R`

Then add the card from your dashboard editor:

1. Edit your dashboard.
2. Add a new card.
3. Search for **RiverWise**.
4. Open the visual editor.
5. Choose a provider.
6. Select a gauge or station.
7. Save.

### Manual Install

1. Download or copy `river-wise-card.js`.
2. Place it in your Home Assistant `www` directory.
3. Add it as a dashboard resource:

```yaml
url: /local/river-wise-card.js
type: module
```

4. Refresh Home Assistant and hard-refresh your browser.
5. Add the card to a dashboard.

### Test From GitHub CDN

For quick testing before installing locally, you can add this dashboard resource:

```yaml
url: https://cdn.jsdelivr.net/gh/TheWillMiller/river-wise@v0.2.1/river-wise-card.js
type: module
```

After changing resources, refresh Home Assistant and hard-refresh the browser tab.

> CDN testing is not the preferred long-term install method. HACS is recommended for normal use.

## Quick Start

```yaml
type: custom:river-wise-card
title: Ohio River at Meldahl Dam
provider: us_nwps
gauge: MELO1
gauge_state: OH
units: english
show_forecast: true
show_impacts: true
grid_options:
  rows: full
  columns: 18
```

## UK Example

```yaml
type: custom:river-wise-card
title: Bourton Dickler
provider: uk_ea
gauge: 1029TH
uk_station: 1029TH
units: metric
show_forecast: false
show_impacts: true
grid_options:
  rows: full
  columns: 18
```

## Dashboard Size

RiverWise is a chart card. In Home Assistant section/grid dashboards, give it enough horizontal space:

```yaml
grid_options:
  rows: full
  columns: 18
```

On narrower dashboards, use:

```yaml
grid_options:
  rows: full
  columns: full
```

## Visual Editor

RiverWise includes a Home Assistant visual editor. When adding the card from the dashboard editor, you can:

- Choose US NOAA/NWS NWPS or UK Environment Agency
- Select a US state and gauge
- Search UK Environment Agency stations
- Enter a custom US gauge code or UK station reference
- Set English or metric units
- Enable or disable forecast rendering
- Enable or disable flood impact rendering

US state gauge lists are loaded from the NWPS API using state bounding boxes. If your gauge is not in the dropdown, enter the NWPS gauge code manually and use **Look up code**.

UK station search uses the Environment Agency flood-monitoring API. Enter a place, river name, or station reference, then choose a result.

## Data Providers

### US NOAA/NWS NWPS

RiverWise uses NOAA/NWS NWPS API endpoints directly for US gauges:

```text
https://api.water.noaa.gov/nwps/v1/gauges/{identifier}
https://api.water.noaa.gov/nwps/v1/gauges/{identifier}/stageflow/observed
https://api.water.noaa.gov/nwps/v1/gauges/{identifier}/stageflow/forecast
```

The visual editor loads state gauge lists from:

```text
https://api.water.noaa.gov/nwps/v1/gauges
```

with bounding-box query parameters for the selected state.

### UK Environment Agency

For UK Environment Agency stations, RiverWise uses:

```text
https://environment.data.gov.uk/flood-monitoring/id/stations
https://environment.data.gov.uk/flood-monitoring/id/stations/{id}
https://environment.data.gov.uk/flood-monitoring/id/measures/{id}/readings
```

UK data uses Environment Agency flood and river level data from the real-time flood-monitoring API.

## Provider Limitations

Forecast data is not available for every US NWPS gauge. RiverWise will still render observed data when forecast data is missing.

UK Environment Agency support currently renders observed readings only. The EA real-time API exposes station and measure readings, but not the same NWPS-style forecast crest feed.

Flood impact text is provider-specific. NWPS may provide gauge-specific flood impacts. UK Environment Agency station readings usually do not include NWPS-style impact statements.

## Hidden Debug Panel

For troubleshooting, RiverWise includes hidden debug state. It is not exposed in the visual editor.

Enable it manually only when diagnosing a gauge or provider issue:

```yaml
debug: true
```

Debug output is logged to the browser console and stored on the card element as `_riverWiseDebug`. Remove it again after testing.

## Configuration

| Option | Required | Default | Description |
| --- | --- | --- | --- |
| `type` | Yes |  | Use `custom:river-wise-card`. |
| `title` | No | `RiverWise` | Card title. If a gauge lookup succeeds, the visual editor can update this from provider metadata. |
| `provider` | No | `us_nwps` | Data provider. Use `us_nwps` or `uk_ea`. |
| `gauge` | Yes |  | US NWPS gauge ID or UK station reference. |
| `gauge_state` | No |  | US state abbreviation used by the visual editor gauge dropdown. |
| `uk_station` | No |  | UK Environment Agency station reference. Usually the same value as `gauge` in UK mode. |
| `units` | No | `english` | Display units. Use `english` or `metric`. Provider data availability may vary. |
| `show_forecast` | No | `true` | Show forecast hydrograph when available. US NWPS only for now. |
| `show_impacts` | No | `true` | Show flood impact statements when provider metadata includes them. |
| `debug` | No | `false` | Hidden troubleshooting mode. Not available in the visual editor. |

## Troubleshooting

If RiverWise works for you after troubleshooting, please consider starring the repo or opening a Works For Me / Confirmed Gauge report. If it breaks, a Beta Install Report with your versions and gauge code helps a lot.

### RiverWise does not show in the card picker

1. Confirm RiverWise is installed in HACS.
2. Hard-refresh the browser.
3. Restart Home Assistant if needed.
4. Check that the card resource exists.
5. Open the browser console and look for RiverWise errors.

### HACS shows an old README or old version

HACS may cache repository metadata.

Try:

1. Open HACS.
2. Open RiverWise.
3. Open the three-dot menu.
4. Select **Redownload**.
5. Choose the latest version.
6. Hard-refresh your browser.

If HACS shows a short value like `214b6c2` instead of `v0.2.1`, that is a GitHub commit hash. HACS shows commit hashes when a repository has tags but no full GitHub Release yet. Publishing a full GitHub Release makes HACS show the release version instead.

### Gauge data unavailable

1. Verify the provider.
2. Verify the gauge or station code.
3. Try a known working gauge such as `MELO1` for US NWPS.
4. Confirm your browser/Home Assistant can reach the provider API.
5. Open the browser console and check for network, CORS, or station errors.

### Forecast data unavailable

Forecast data is optional and gauge-specific. If a provider returns no forecast series, RiverWise renders observed data only.

### Visual editor does not show

1. Confirm the latest RiverWise JS is loaded.
2. Hard-refresh the browser.
3. Redownload the latest HACS release.
4. Check the browser console for custom element errors.

## Privacy

RiverWise does not include telemetry, tracking pixels, external analytics, or phone-home behavior.

The card fetches only the public provider data needed to render the configured dashboard card. Adoption tracking is based only on GitHub-native signals such as stars, issues, release activity, and tester reports.

Maintainer notes for GitHub-native adoption signals are in [PROJECT_INSIGHTS.md](PROJECT_INSIGHTS.md).

## Beta Tester Checklist

The full checklist is also available in [BETA_TESTER_CHECKLIST.md](BETA_TESTER_CHECKLIST.md).

If you are testing RiverWise, please report:

- Home Assistant version
- HACS version
- RiverWise version
- Browser/device
- Provider and gauge/station code used
- Whether you installed from HACS custom repository, manual resource, or CDN
- Screenshot of any layout issue
- Browser console errors, if any
- Whether the issue happens after a hard refresh

Basic test steps:

1. Install RiverWise from HACS custom repository.
2. Add the card from the dashboard card picker.
3. Open the visual editor.
4. Select a provider.
5. Select a gauge or station.
6. Save.
7. Refresh the dashboard.
8. Confirm the card still loads.
9. Confirm current stage and hydrograph render.
10. Test on desktop and phone.
11. Screenshot or copy any errors.

## Safety

RiverWise is informational. It is not an emergency alerting, flood warning, dam safety, navigation, boating safety, or life-safety tool.

Always check official forecasts, warnings, local emergency management guidance, road closures, and on-site conditions before making weather, flooding, boating, or travel decisions.

Do not use RiverWise as your only source for flood risk, evacuation, boating, or hazardous-water decisions.

## License

Free for personal and non-commercial use under PolyForm Noncommercial License 1.0.0.

Commercial use requires separate written permission.

## Development

The distributable card is:

```text
river-wise-card.js
```

For HACS default repository submission, RiverWise is a dashboard/custom card. HACS validation/submission uses the `plugin` category internally for dashboard plugins.

Run the local syntax check before opening a pull request:

```bash
npm run check
```

## Roadmap

Planned areas for future releases:

- More provider-specific polish for UK Environment Agency data
- Better international provider discovery
- More complete gauge search and filtering
- Additional theme and mobile layout polish
- Optional threshold/alert customization for gauges without published flood stages

## Contributing

Bug reports, confirmed-gauge reports, and focused feature requests are welcome through GitHub Issues.

For code changes:

1. Keep RiverWise as a dashboard/custom card, not an integration.
2. Preserve existing HACS custom repository install behavior.
3. Keep changes scoped and update `CHANGELOG.md` when behavior changes.
4. Run `npm run check`.
5. Include screenshots for visible UI changes when practical.
