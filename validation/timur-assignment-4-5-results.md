# Assignment 4 and 5 verification for Timur's pages

Date: 23 October 2026, Asia/Almaty.

Scope: `js/timur.js`, Timur's sections of README, `tests/timur.test.cjs` and the two screenshots in `screenshots/assignment-4-5-timur/`.

## Source and freeze verification

- All six HTML files and all three CSS files are byte-identical to their state before this implementation. The earlier navigation script links are preserved.
- Merey's Home, Menu, Order, stylesheet and AI log are unchanged. Shared `css/base.css` and `js/navigation.js` are unchanged.
- The existing deferred `js/timur.js` entry is used. New controls/cards are created through the DOM; state changes use existing classes. No inline CSS or new stylesheet rules are generated.
- Syntax check: `node --check js/timur.js` passed.
- Production-source checks found no `var`, loose equality, `innerHTML`, `element.style`, `document.write()` or `eval()`.
- Verified `js/timur.js` SHA-256: `fd18e9be053eec7ca067e89707b69581935209c0acf98304d5e4ac7e9c555c52`.

## Automated logic checks

Command: `node --test` from this folder.

Result: **10 tests passed, 0 failed**. These exercise the actual script through Node's VM: Astana midnight, exact opening/closing boundaries, minute-boundary refresh scheduling, optional contacts, trimmed required text, impossible/future dates, cross-field permission, invalid contacts/group/rating, connected filters, stable source-array order and gallery wrapping.

## Browser checks

The saved local files were served on 127.0.0.1. Synthetic values were used; no business operation was submitted.

| Scenario | Observed result |
| --- | --- |
| Consistent headers | Home and all three Timur pages have the same header height and spacing, logo size and normal-case navigation. Colophon is absent from the header; the footer credit link remains. |
| Invalid feedback | Blank fields, malformed email, fractional group size, future visit and missing contact permission data show nearby errors. Submit focuses the first invalid field and preserves values. |
| Correction and preview | Errors clear as fields are corrected. The counter updates. A valid submit shows the real choices; Edit restores the original values and focus. |
| Confirmation and repeat use | Confirm creates one card, a timestamp and a DEMO reference, resets filters and shows an explicit local-only summary. Restart clears the draft/counter and retains reviews for this page visit. |
| Privacy and text safety | Contact details appear only in the opted-in summary. Text containing `<b>` and `<img>` remains literal; no corresponding injected elements appear in the cards. |
| Search, rating, sorting and reset | Combined Chicken search and five-star filter finds the submitted card. An incompatible rating shows the empty state. Reset restores all cards; oldest-first puts the July source review first. |
| Source attribution | The existing 2GIS review keeps its author, source date/link and `lang="ru"`. Its unspecified rating is not invented. |
| Copy | The copy action reported success after the Clipboard API resolved, then re-enabled its button. |
| Gallery | Opens the chosen photo, cycles from first to last and back, handles Left/Right and Escape, and restores focus to the opening link. The mobile dialog fits within 375 CSS pixels. |
| Hours | The About page displays the computed Astana status. Automated checks verify 09:30 inclusive, 21:30 exclusive and the next-minute update delay. |
| Responsive geometry | Home and the three Timur pages were checked at actual widths 375, 768 and 1440 CSS pixels. No horizontal document overflow or broken loaded images was found. The 600-character message and validation errors were additionally checked at 375 pixels. |
| Runtime health | No relevant console errors were reported on the checked final routes and flows. |

Desktop captures: `../screenshots/assignment-4-5-timur/feedback-desktop.jpg` and `../screenshots/assignment-4-5-timur/about-desktop.jpg`. Browser actions and DOM measurements, rather than screenshots alone, establish the interaction results.

## Integration into the current final branch

Starting commit: `d5b687496a0156a7c47487d5668d6a9555ae90db` (`final`). The implementation script is unchanged from the verified local source hash above. Only `js/timur.js` and Timur-related README text change among existing tracked files; Timur's tests, report and screenshots are added. The complete Merey Functionality Plan section is preserved verbatim. All existing HTML/CSS files, Merey scripts/tests/checklist and remaining tracked files match the starting commit.

The combined `node --test` run passes **22 tests, 0 failures**: 12 existing Merey tests and 10 Timur tests. `git diff --check` passes.

The merged checkout was served locally and checked in the browser:

- Menu search and combined filters still work, including no results and reset.
- Chicken × 2 plus Mini × 1 survives navigation from Menu through About and Feedback to Order, with three items and 1,670 ₸.
- About gallery wrapping, keyboard/Escape and focus restoration work; the Astana hours status is visible.
- Feedback rejects a future visit, previews and confirms a review, retains source language/credits and filters the new card correctly.
- Order focuses the first invalid field, then produces the correct explicit demonstration summary after valid synthetic input.
- Home's next suggestion changes the item. Adding it updates the existing basket to four items on Order. Clearing the basket restores the empty state and disables completion.
- All six merged pages have consistent header geometry and were measured at actual widths 375, 768 and 1440 CSS pixels. No horizontal document overflow, broken loaded images or relevant console errors were found.

Both desktop screenshots were recaptured from the merged checkout using its unchanged shared stylesheet, so they reflect the final branch's typography and colours.

## Limits

- Reviews are in memory only, disappear after reload and are never sent to the shop. No database, authentication, real order or payment was added.
- Clipboard denial and broken-image recovery are implemented and source-reviewed; those failure paths were not forced in the browser. No full assistive-technology audit is claimed.
- The initial source folder was not a Git checkout. Integration is performed in a separate checkout of the existing repository. No milestone tag is created by this scoped change, and these results do not claim completion of the full team submission.
