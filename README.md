# RiverWise Card

RiverWise is a Home Assistant custom dashboard card for NOAA/NWS National Water Prediction Service gauges. It can show river, lake, reservoir, tailwater, and flood gauge data using NWPS JSON APIs.

## Features

- Current gauge name, ID, stage, flow, trend, and update time
- Flood category awareness from NWPS metadata
- Observed and forecast hydrograph
- Flood threshold lines and forecast crest marker
- Forecast summary with distance to flood stage
- Optional flood impact statements
- Visual editor with state and gauge selectors
- Home Assistant theme-aware styling
- Behind-the-scenes debug state for troubleshooting

## Installation

Copy `river-wise-card.js` into your Home Assistant `www` folder:

```text
/config/www/river-wise-card.js
```

Add it as a dashboard resource:

```text
/local/river-wise-card.js
```

Resource type:

```text
JavaScript module
```

After replacing the file, bump the resource URL to clear frontend cache:

```text
/local/river-wise-card.js?v=1
```

## Example YAML

```yaml
type: custom:river-wise-card
title: Ohio River at Meldahl Dam
gauge: MELO1
gauge_state: OH
units: english
show_forecast: true
show_impacts: true
```

## API

RiverWise uses NOAA/NWS NWPS API endpoints directly:

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

## Notes

Forecast data is not available for every gauge. RiverWise will still render observed data when forecast data is missing.

