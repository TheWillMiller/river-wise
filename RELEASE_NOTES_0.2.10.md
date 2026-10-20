## RiverWise v0.2.10

RiverWise now refreshes river readings automatically on dashboards left open.

### Highlights

- Fetch fresh data every 15 minutes for US NWPS, UK Environment Agency and Germany PEGELONLINE cards.
- Stop polling and cancel pending requests when a card is removed.
- Refresh immediately when the card returns, including after quick dashboard navigation.
- Prevent overlapping refreshes and stale results or errors after changing a gauge, provider or display configuration.
- Retry at the next interval after a provider error.

### Notes

RiverWise remains beta software. Individual gauges may update less frequently than the refresh interval, and browsers may delay background or suspended-tab timers.

US NOAA/NWS NWPS gauges can show observed and forecast hydrographs where available. UK Environment Agency and Germany PEGELONLINE cards remain observed-only.

### Install

Update RiverWise through HACS and refresh the browser.

Repository: https://github.com/TheWillMiller/river-wise

Release asset: `river-wise-card.js`.
