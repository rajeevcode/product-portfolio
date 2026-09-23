Published recordings are configured in ../gallery.js (the VIDEOS list).

Available now:
  01-full-rescale-os-walkthrough.mp4
  01-full-rescale-os-walkthrough.webm

The module demo entries are marked available: false because their source
files are absent. They do not render video cards, source URLs, or download
links. Their authored descriptions remain unchanged.

To publish a module demo:
1. Add genuine .mp4 and .webm recordings with the entry's exact basename.
2. Verify that the entry's PNG and SVG poster files exist.
3. Set available: true for that entry in ../gallery.js.
4. Run npm test from the repository root; it checks rendered gallery media.

The unlabelled page@*.webm recording is truncated and is not a replacement
for the missing module demos. Do not relabel it as a complete walkthrough.
