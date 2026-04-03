# Publish Checklist

Run these checks before the next live publish:

1. Run `npm run verify:publish`.
2. Run `npm run build`.
3. Run `npm run preview` and confirm the Overview page renders on first load.
4. Switch through `Overview`, `Carbon`, `Economics`, and `Water` in the top nav.
5. On Overview, move the SOM slider and confirm water, carbon, and CO2e values update.
6. Confirm the TCU and TEI logos render in the sticky header.
7. Open browser devtools and confirm there are no uncaught runtime errors.
8. Confirm each pillar footer still shows sources.
