# Studio visual resources

Researched 26 October 2026. Keep the editable text system; build visual treatments from actual photographs, cutouts and texture assets. Editors select a finished treatment rather than assemble layers or visit another tool for every post.

## Selected assets

| Resource | Use | License and source |
| --- | --- | --- |
| Poly Haven Stadium 01 by Sergej Majboroda | Generic stadium atmosphere behind match graphics | [Asset](https://polyhaven.com/a/stadium_01), [CC0 license](https://polyhaven.com/license) |
| ambientCG Paper001 | Real paper texture for editorial posts | [Asset](https://ambientcg.com/view?id=Paper001), [CC0 license](https://docs.ambientcg.com/license/) |

Both permit commercial use, modification and redistribution of asset files, so these can be bundled locally. Derived JPEGs are in `public/studio/cricket/backgrounds`; original files are not needed at runtime. Stadium 01 is generic sports imagery, not a photograph of TU International Cricket Stadium or a particular NPL match. Do not caption it as event coverage.

## Additional production resources

- [Pexels](https://www.pexels.com/license/): free photography for designed posts, websites and templates. Matchday now bundles [Arto Suraj's cricket-field photograph](https://www.pexels.com/photo/cricket-match-at-delhi-sports-field-36293965/) as an explicitly illustrative background. It depicts a field in Delhi, not TU or the announced match. Its source and modifications are recorded in the asset manifest.
- [Photopea](https://www.photopea.com/learn/): prepare reusable transparent cutouts and artwork from permitted source files. Preparation is done once by the design team; editors should not have to use it for routine posts.
- Continue using existing credited player portraits or team-supplied photographs for actual player graphics. A license for a texture does not establish rights for unrelated player photographs or team marks.

## Template-library assessment

Free-to-download does not necessarily permit embedding a design into a template-generating application. [ResourceBoy](https://resourceboy.com/license/) restricts source redistribution, and [Vecteezy](https://www.vecteezy.com/licensing-agreement) restricts end-user on-demand design applications. These are not admitted as built-in Studio assets. Canva/Adobe Express templates can be useful within their own tools, but are not approved here for copying into this app.

## Production direction

Use a small curated set of asset-backed families: stadium match announcement, player-photo performance, paper editorial recap, and clean statistical tables. Keep names, scores, dates, team marks and credits as live layers, retaining the current text formatting and automatic fixture population. Use CSS for layout, readable overlays and controls; do not use decorative grids and geometric shapes as the primary artwork. Export uses the same local images as the editor.

Matchday has its own verified managed composition; see `STUDIO_MATCHDAY_BENCHMARK.md`. The other modern templates remain under format/language fit review. Do not describe the complete collection as production-verified.
