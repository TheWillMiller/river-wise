# Changelog

## 0.2.10

### Fixed

- Refresh gauge readings every 15 minutes while the card is connected, for US NWPS, UK Environment Agency, and Germany PEGELONLINE providers.
- Stop the refresh timer and cancel pending requests when the card is removed; refresh immediately when it reconnects.
- Prevent duplicate timers, overlapping refresh batches, and stale results or errors after removal or configuration changes.
- Keep automatic retries running after provider errors.

### Added

- Deterministic regression tests for refresh timing, request cancellation, reconnection, provider errors, and configuration changes.

## 0.2.9

### Added

- Added Germany PEGELONLINE as a native provider for federal-waterway gauges.
- Added visual-editor station loading, local filtering, selection, and manual lookup by UUID, station number, or short name.
- Added current water level, optional discharge, official water-state labels, and a bounded seven-day observed hydrograph.
- Added provider regression tests and Germany example YAML.

### Changed

- Added Germany to HACS country metadata and updated the frontend workflow to run provider tests.
- Made hydrograph threshold labels use the provider's actual stage unit instead of always displaying feet.

### Notes

- PEGELONLINE does not provide an NWPS-style forecast series, so Germany cards render observed data only.
- Initial Germany coverage is limited to stations published by PEGELONLINE on federal waterways.

## 0.2.8

### Changed

- Confirmed the repository and package metadata use the MIT License with no separate commercial-use restrictions.
- Refreshed release metadata and documentation for HACS default-catalog submission.

## 0.2.7

### Changed

- Switched RiverWise to the MIT License so GitHub and HACS can recognize the repository license cleanly.
- Added HACS country metadata for US and GB provider coverage.

## 0.2.6

### Added

- Added a release-notes template that avoids fenced install blocks so HACS release announcements do not render the rest of the message as code.
- Added a My Home Assistant / HACS repository badge to the README.

### Fixed

- Fixed out-of-view flood threshold labels rendering in inverted vertical order on the hydrograph.

## 0.2.5

### Added

- Added TideWise UK tides planning notes based on RiverWise UK provider lessons.

### Fixed

- Fixed the UK station picker single-result case where one matching station could be visible but not selectable.
- Added an explicit "Use selected station" button for the UK station dropdown.
- Cleaned up the 0.2.5 release-note plan so HACS/GitHub install markdown can be published without swallowing following text into the code block.

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
