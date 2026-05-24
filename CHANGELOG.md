# Changelog

## Unreleased

## 0.2.4

### Fixed

- Fixed the UK station dropdown not loading results after the stricter v0.2.3 station filtering.
- Prevented placeholder rows such as "Load station list" from behaving like selectable stations.

### Changed

- UK station list filtering now keeps stations with a real level measure and real unit, while the selected card still validates readings when it loads.
- The UK reload button now reloads using the current filter text.

## 0.2.3

### Changed

- UK Environment Agency station dropdown now filters out stations without a current usable level reading.
- UK measure selection now prefers current, unit-bearing stage measures over stale or unitless measures.

### Fixed

- Fixed UK stations whose `measures` metadata is returned as a single object instead of an array.
- Fixed several UK stations rendering no hydrograph or no stage because RiverWise selected an old `---` unit measure first.

## 0.2.2

### Changed

- Reworked the UK Environment Agency visual editor into a loaded station dropdown with a live filter.
- UK station filtering now matches station name, river, town, and station code.

### Fixed

- Fixed the UK station search button reading stale text when a user typed a search and clicked immediately.

## 0.2.1

### Added

- Added repository packaging for HACS/custom repository use, including changelog, issue templates, examples, license, beta tester checklist, project insights, and frontend syntax check workflow.

### Changed

- Expanded README documentation for installation, configuration, data providers, troubleshooting, safety, privacy, and contribution guidance.
- Removed the single-country HACS metadata value because RiverWise now supports both US and UK providers.

## 0.2.0

### Added

- Added UK Environment Agency provider support.
- Added UK station search and manual station lookup in the visual editor.
- Added observed UK water-level hydrographs.
- Added UK-specific summary text and data attribution notes.

### Changed

- Preserved existing US NOAA/NWS NWPS support while adding the UK provider path.

### Notes

- US NOAA/NWS NWPS gauges support observed and forecast stage where the NWPS API provides them.
- UK Environment Agency stations currently render observed readings only. The EA real-time flood-monitoring API does not expose the same forecast crest feed as NWPS.

## 0.1.1

### Added

- Added visual editor state and gauge selection for NOAA/NWS NWPS gauges.
- Added manual gauge code lookup that updates the title from NWPS metadata.
- Added HACS loading metadata and card-picker registration.
- Added screenshots for the card and visual editor.

### Changed

- Improved chart readability, threshold labeling, and Home Assistant theme compatibility.
- Hid debug output from the normal visual editor flow.

## 0.1.0

### Added

- Initial RiverWise card prototype for NOAA/NWS NWPS river gauges.
- Added current stage, flow, trend, flood category, observed/forecast hydrograph, forecast crest summary, and optional flood impacts.
