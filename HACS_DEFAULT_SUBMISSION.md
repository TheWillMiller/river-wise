# HACS Default Submission Prep

RiverWise is a Home Assistant dashboard/custom card. In HACS internals and in the `hacs/default` repository, dashboard cards are submitted under the `plugin` category.

## Target Repository

```text
https://github.com/TheWillMiller/river-wise
```

## Default-List Entry

The current `hacs/default` `plugin` file is a plain newline-separated list of repositories, not JSON.

Add this exact line:

```text
TheWillMiller/river-wise
```

## Pre-Submission Checklist

- Repository is public.
- Issues are enabled.
- Repository is not archived.
- GitHub description is set.
- GitHub topics are set.
- `hacs.json` exists in the repository root.
- `hacs.json` points to `river-wise-card.js`.
- `river-wise-card.js` exists in the repository root.
- HACS validation workflow passes with `category: plugin`.
- Frontend syntax check workflow passes.
- Latest version is a full GitHub Release, not only a tag.
- Latest release includes `river-wise-card.js` as an attached asset.
- README includes screenshots, installation steps, troubleshooting, safety notes, privacy notes, and license summary.

## Notes

Do not submit RiverWise as a Home Assistant integration. It is a plugin/custom card.

Do not change the license silently. RiverWise is licensed for free personal/non-commercial use under PolyForm Noncommercial 1.0.0, with commercial use requiring separate written permission.
