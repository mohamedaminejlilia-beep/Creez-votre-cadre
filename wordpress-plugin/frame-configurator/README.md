# Frame Configurator WordPress Plugin

This plugin wraps the existing React/Vite frame configurator and mounts it in WordPress with:

- the shortcode:

```text
[frame_configurator]
```

- the dedicated full-page route:

```text
/frame-configurator
```

## Final plugin structure

After building the app, keep this structure:

```text
frame-configurator/
  frame-configurator.php
  README.md
  dist/
    manifest.json
    index.html
    assets/
    frames/
```

## Build source app

Run this from the project root:

```bash
npm run build
```

The production build is configured to output directly into:

```text
wordpress-plugin/frame-configurator/dist
```

## Install in WordPress

1. Copy the entire `wordpress-plugin/frame-configurator` folder into:

```text
wp-content/plugins/
```

2. Activate the plugin in WordPress admin.
3. Use either:

Shortcode in a page or post:

```text
[frame_configurator]
```

Or open the dedicated full-page route:

```text
https://your-site.com/frame-configurator
```

## Full-page route notes

- The plugin registers its own WordPress route at `/frame-configurator`.
- That route renders the app outside the normal theme layout so the configurator can take the full page.
- If the route does not work immediately after updating the plugin, go to:

```text
WordPress Admin -> Settings -> Permalinks
```

Then click `Save Changes` once to refresh rewrite rules.

## Notes

- The React app is not rewritten in PHP.
- WordPress only provides the wrapper, asset loading, and shortcode.
- The existing configurator logic and UI stay inside the built React app.
