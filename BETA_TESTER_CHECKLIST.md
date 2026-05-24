# Beta Tester Checklist

If you are testing RiverWise, please report:

- Home Assistant version
- HACS version
- RiverWise version
- Browser/device
- Provider used
- Gauge or station code used
- Whether you installed from HACS custom repository, manual resource, or CDN
- Screenshot of any layout issue
- Browser console errors, if any
- Whether the issue happens after a hard refresh

## Basic Test Steps

1. Install RiverWise from HACS custom repository.
2. Add the card from the dashboard card picker.
3. Open the visual editor.
4. Select a provider.
5. Select a gauge or station.
6. Save.
7. Refresh the dashboard.
8. Confirm the card still loads.
9. Confirm current stage renders.
10. Confirm the hydrograph renders.
11. Test on desktop and phone.
12. Screenshot or copy any errors.

## Useful Test Gauges

US NWPS:

```text
MELO1
CNWS1
LNGS1
```

UK Environment Agency:

```text
1029TH
```

Provider coverage varies by gauge. Missing forecast data is expected for some stations.
