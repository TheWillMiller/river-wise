# Release Notes Template

Use this format for GitHub releases so HACS renders the release announcement cleanly.

Important:

- Do not put the install URL in a fenced code block.
- Do not paste markdown that contains an unclosed triple-backtick fence.
- Keep install instructions as plain text or a normal markdown link.
- Attach `river-wise-card.js` as the release asset.

## Template

```markdown
## RiverWise vX.Y.Z

Short one-sentence release summary.

### Highlights

- First change
- Second change
- Third change

### Notes

RiverWise remains beta software.

US NOAA/NWS NWPS gauges can show observed and forecast hydrographs where available.

UK Environment Agency support currently renders observed readings only because the EA flood-monitoring API does not provide the same NWPS-style forecast crest feed.

Germany PEGELONLINE support renders observed water levels and optional discharge for federal-waterway stations.

### Install

Use HACS as a custom Dashboard repository:

https://github.com/TheWillMiller/river-wise

Attach `river-wise-card.js` to this release.
```

## Clean v0.2.5 Text

```markdown
## RiverWise v0.2.5

This release fixes a UK station picker edge case and adds planning notes for future UK tide support in TideWise.

### Highlights

- Fixed the UK station picker when filtering leaves only one matching station
- Added an explicit **Use selected station** button for UK station selection
- Prevented the current/old station from stealing selection when filtered results are available
- Added TideWise UK tides planning notes based on lessons from RiverWise UK provider work
- Cleaned up the release-note plan so HACS/GitHub install markdown does not swallow later text into a code block

### Notes

RiverWise remains beta software.

US NOAA/NWS NWPS gauges can show observed and forecast hydrographs where available.

UK Environment Agency support currently renders observed readings only because the EA flood-monitoring API does not provide the same NWPS-style forecast crest feed.

### Install

Use HACS as a custom Dashboard repository:

https://github.com/TheWillMiller/river-wise

Attach `river-wise-card.js` to this release.
```
