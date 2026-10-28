# Today in History — remaining work

Continued from the existing implementation; completed files were inspected rather than recreated.

- [x] 1. Lora TTFs, font faces, export embedding list
- [x] 2. Catalog: ten templates, four categories
- [x] 3. History data schema and blank defaults
- [x] 4. History post/design types and draft schema
- [x] 5. Preview and authored draft builders
- [x] 6. History artwork and Artwork routing (fit verification in task 11)
- [x] 7. Text overflow and Studio craft entries
- [x] 8. History inspector and PostEditor wiring
- [x] 9. Per-template prompts, import/review workflow, creation modal
- [x] 10. History desk, protected route, Studio entry
- [x] 11. History tests, visual/export checks, TypeScript and ESLint

Verification:

- 335 shared/history tests passed across 12 test files.
- 112 browser layout cases passed across ten templates, four formats and two languages, including long copy and photos.
- Eight portrait PNG exports passed color and dimension checks (1080 × 1350).
- TypeScript and ESLint passed for the History implementation and its shared integrations.
- The protected History route and its per-post prompt dialog were verified in the running app.
- Included in the Studio update delivery.

## Requested simplification

- [x] Replace topic-template choices with one main page plus optional paragraph pages.
- [x] Create paragraph pages from the AI response and from Add page in the editor.
- [x] Preserve legacy stored drafts.
- [x] Add the Leaders background watermark to both page roles.
- [x] Restore the angled TODAY IN HISTORY seal at the top right, without a date seal.
- [x] Unify Studio dropdown controls, themed menus, focus states and mobile sizing.
- [x] Verify both page roles, long copy, exported PNGs and dropdown interaction.

Final simplification verification: 242 tests across 12 files; 32 cover/paragraph layout cases; eight PNG exports; desktop/mobile dropdown checks in light and dark themes. TypeScript, ESLint and diff checks passed.

## Web research update

- [x] History creation and repair prompts require web research, with no image attachment expected.
- [x] Request exactly one Nepal event and one international event for the selected calendar date.
- [x] Retain sources per event and save the stories in separate carousels.
- [x] Reject duplicate events and test scope validation, imports and separate draft groups.

## Nepali calendar and carousel recovery

- [x] National research uses the verified B.S. month/day, including a conversion source URL.
- [x] International research remains tied to the Gregorian month/day.
- [x] Both event covers and their paragraph pages import into one ordered carousel.
- [x] Older split national/international History batches recover together without discarding content.

## Four-edition JSON contract

- [x] Return National-Nepali, National-English, International-English, International-Nepali in that order.
- [x] Use each edition’s own language, event sources and optional continuation pages.
- [x] Keep all four covers and continuation pages in the same carousel.
- [x] Validate the combined twenty-page limit before attempting draft creation.
