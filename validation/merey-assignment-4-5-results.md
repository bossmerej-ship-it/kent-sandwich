# Assignment 4 and 5 verification for Merey's pages

Date: 23 October 2026, Asia/Qyzylorda. Implemented source snapshot: `4484b73`. Starting branch snapshot: `1330420751c1866c449b3aedc326127a85ac8fa8` on `final`. These are local-development results, not a claim that the team submission or defence is complete.

## Scope and source checks

- `index.html`, `menu.html` and `order.html` differ from the starting snapshot only by three deferred script links each. No interface markup was directly rewritten.
- All three CSS files, `about.html`, `feedback.html`, `colophon.html`, `js/timur.js` and `AI_USAGE_TIMUR.md` match the starting snapshot. Git's normal Windows line-ending conversion is excluded from that comparison.
- All five new scripts passed `node --check`. Source checks found no `var`, loose equality, unsafe `innerHTML`, `element.style`, `document.write()` or `eval()`.
- The existing `midterm` tag still resolves to `fb5b79be9e5bf0e8a7acc2460a197d1c5092c319`.
- `git diff --check` passed.

## Automated behaviour tests

Command: `node --test tests/menu-data.test.cjs tests/order-validation.test.cjs`

Result: **12 tests passed, 0 failed**. Coverage includes the original eight menu records, connected filtering, empty results, multi-line totals, malformed saved baskets, integer quantity boundaries, impossible calendar dates, pickup-hour boundaries, same-minute rejection and the Astana calendar around midnight. The tests load the actual production scripts in Node's VM; they do not substitute another implementation.

## HTML validation

The current three saved HTML sources were posted to the W3C Nu HTML Checker with JSON output. All returned **0 errors and 0 warnings**. The responses are retained as `merey-a4-5-index.html.json`, `merey-a4-5-menu.html.json` and `merey-a4-5-order.html.json` in this directory. These are source-validation results; dynamic interactions were checked separately below.

## Browser checks


| Scenario | Observed result |
| --- | --- |
| Blank filters, maximum price, combined search and reset | Eight initial results; maximum 640 gives five; trimmed ` SPICY ` with maximum 690 gives only Spicy; adding Compact gives zero and a useful empty message; reset restores eight |
| Sort and repeated rendering | Descending prices are 740, 690, 690, 640, 640, 640, 640, 390 in both the cards and table |
| Home suggestion | Another suggestion changed Classic to Chicken; adding the suggestion gave visible quantity/total feedback |
| Basket navigation and cross-tab changes | Chicken twice plus Mini gave three sandwiches and 1,670 ₸ on Menu and Order; a Home addition updated an already-open Order tab without reloading |
| Basket controls | Increase/decrease recalculated totals; decreasing one item to zero removed it; Remove and Clear produced the empty state; ten Mini sandwiches cost 3,900 ₸ and disabled further increase |
| Invalid selected quantity | Entering zero kept the entered value and a specific nearby error; an unrelated basket update did not silently erase that error; submit focused `quantity-chicken` |
| Contact/date/time validation | Empty fields, whitespace name, malformed phone/email, past date and out-of-hours time produced specific field errors; the first invalid field received focus |
| Valid completion | Chicken × 2 + Mini × 1, future pickup at 10:30, valid contacts and a note produced a `DEMO-` summary for 1,670 ₸; it explicitly states no real order/payment or delivery to the shop |
| Repeated actions and recovery | Completion disabled repeat submit; Edit details cleared the old summary; Start new demo cleared fields, errors and basket, disabled empty checkout and focused the first item |
| Safe visitor text | HTML-looking name/note strings appeared literally in the summary; the summary contained zero image or script elements from that input |
| Keyboard and naming | Enter in the search form retained the page and filtered; collapsed navigation opened; basket actions had descriptive names; order controls had labels and no duplicate IDs were found |
| Runtime and assets | No relevant console errors or warnings were reported on the final checked routes; page images loaded. A pre-existing automatic favicon 404 observed during early setup was resolved by a DOM-created icon link to the existing logo |

## Responsive evidence

Each route was checked at viewport widths 375, 768 and 1440 pixels. Its document width remained within the viewport. The usual browser scrollbar accounts for the measured 360, 753 and 1425-pixel content widths; screenshots may be one pixel narrower due to browser capture rounding.

| Page | 375 px | 768 px | 1440 px | Screenshots |
| --- | --- | --- | --- | --- |
| Home | No horizontal overflow | No horizontal overflow | No horizontal overflow | `../screenshots/assignment-4-5-merey/index-mobile.jpg`, `index-desktop.jpg` |
| Menu | No horizontal overflow | No horizontal overflow | No horizontal overflow | `../screenshots/assignment-4-5-merey/menu-mobile.jpg`, `menu-desktop.jpg` |
| Order, including errors and completed summary | No horizontal overflow | No horizontal overflow | No horizontal overflow | `../screenshots/assignment-4-5-merey/order-mobile-errors.jpg`, `order-mobile.jpg`, `order-desktop.jpg` |

The screenshots were opened and inspected for clipping and layout problems. The quantity-error message was placed after its flex label so it wraps within the mobile card. The implementation reuses the existing Bootstrap and local styles.

## Limits and remaining team work

- Storage corruption/normalization is covered by automated tests. The unavailable-browser-storage path was source-reviewed; storage denial was not forced in the browser. No full assistive-technology or automated axe audit is claimed.
- Bootstrap's existing CDN dependency and the original business/photos/prices remain as supplied. This work does not independently reverify current business prices or photograph ownership.
- The shared basket currently spans only the three authorized pages. Timur's pages and whole-site integration still require his work and team review.
- `assignment-4` and `assignment-5` team tags are deferred until the combined milestones are ready. Four genuine commits over three days, peer review and defence cannot be manufactured in this one-day session.

The adjacent `merey-assignment-4-5-source-snapshot.json` binds the implemented sources and retained screenshots to SHA-256 hashes.
