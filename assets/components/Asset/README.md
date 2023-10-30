# Asset

This component handles and displays all assets, ranging from images to svgs.

## Usage/Examples

js

```javascript
import { Asset } from "@components/Asset";

const assets = importAll(
  import.meta.webpackContext("@_assets/images", {
    recursive: false,
    regExp: LOCALE_ASSET_RGX,
    mode: "sync",
  })
);

window.assets = assets;

registerComponents(Asset);
```

html

```html
<div id="banner" style="opacity: 0; visibility: hidden;">
  <ad-asset src="srcId"></ad-asset>
</div>
```

The Asset in the example above will take the id from the `src` -attribute and go through `window.assets` to find the right asset.

### Props

- `src` the source id found in `window.assets`
- `clip-path` ???
- `bg` if this is set, use asset as `background-image`
