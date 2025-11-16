# Overlay Bypass for Subscription Walls

This Chrome extension removes common subscription, paywall, and modal overlays that block interaction, and restores scrolling when sites attempt to lock the page.

## How it works
- Targets common modal, overlay, paywall, and subscription elements using general pattern matching on class names, IDs, roles, and text content.
- Removes elements that cover significant portions of the viewport or use high z-index/positioning.
- Automatically clears inline `overflow: hidden` styles and common "no-scroll" classes from the `<body>` and `<html>` elements to re-enable scrolling.
- Runs on all pages and keeps watching for newly added overlays via a `MutationObserver`.

## Installation
1. Clone or download this repository.
2. Open **chrome://extensions** in Chrome and enable **Developer mode** (top right toggle).
3. Click **Load unpacked** and choose this project directory.
4. Navigate to a site with a subscription dialog—the extension will remove the blocking overlay and restore scrolling automatically.

## Notes
- The extension uses heuristics and pattern matching; if a site uses unusual markup you can refresh the page after loading the extension to let it clean up new overlays.
- No additional permissions beyond content script execution are required.
