# Assignment 4 and 5 verification for Timur's pages

Date: 23 October 2026, Asia/Almaty.

Starting commit: `e272380034d55d9591551bf6d4d5f7df069dc5b9` on `final`.

## Script structure and scope

| File | Lines | Responsibility | SHA-256 |
| --- | ---: | --- | --- |
| js/timur.js | 44 | Shared element/time helpers and header alignment | `869005644f03778414b11e9895d4453eaf8199a7f72eb0e6d3c72e04ccd08308` |
| js/about.js | 87 | Gallery, opening status and minute refresh | `f4afaf2929bb7a13c4feb259708156ffac8d6293508b229bc46607852f1b56ee` |
| js/feedback.js | 373 | Feedback validation, cards, filters and completion | `95108cbb94529e62748511c9c34c452abe10421d96dd247d15965c88b7d4424a` |

All 12 existing top-level function bodies are preserved exactly. Only their file placement and page initialization change. About and Feedback each receive one deferred page-script connection immediately after timur.js. Colophon still loads only timur.js. No other HTML edits or CSS edits are included.

Merey's Home, Menu, Order, scripts, tests, checklist, evidence and complete Functionality Plan section remain byte-identical to the starting commit. The source references in [JS_CHECKLIST_TIMUR.md](../JS_CHECKLIST_TIMUR.md) identify the new files and exact line numbers.

## Automated checks

- `node --check js/timur.js`, `node --check js/about.js` and `node --check js/feedback.js`: passed.
- `node --test`: **25 passed, 0 failed**; 13 Timur checks and 12 existing Merey checks.
- The three new checks verify the actual HTML script connections and dependency order. Before the split, the About and Feedback loading checks failed as expected; both pass after adding their scripts.
- The existing checks exercise Astana midnight, opening/closing boundaries, minute scheduling, trimmed required text, optional contacts, impossible/future dates, contact permission, group/rating rules, connected filters, source-array order and gallery wrapping.
- `git diff --check`: passed. Production scripts contain no var, loose equality, innerHTML, inline style mutation, document.write or eval.

## Browser checks after the split

The current checkout was served at 127.0.0.1:8780. Synthetic values were used for the local demonstration forms.

| Scenario | Observed result |
| --- | --- |
| Page loading | About loads timur.js then about.js; Feedback loads timur.js then feedback.js. Both initialize successfully. Colophon retains the common header behaviour. |
| Header and navigation | All six pages have an 87-pixel header and 44-pixel logo at the measured widths. Colophon is absent from the main navigation. Mobile navigation expands successfully on About. Footer source links remain available. |
| Invalid feedback | Empty submission shows nearby errors and the summary, preserves the draft and focuses guest-name. |
| Preview and edit | Corrected fields clear the errors. The message counter updates. Preview shows the chosen Chicken item, date, rating and text. Edit restores all entered values. |
| Confirm and reset | Confirm adds one five-star card, timestamp and DEMO reference. The count becomes 2 of 2 and the average 5.0; the source review stays unrated. Start another form resets the draft and counter while retaining cards for this visit. |
| Text safety | Literal text containing `<b>` remains text in the preview, summary and card; no corresponding element is injected into the review list. |
| Connected filters | Chicken search plus five stars shows the new review. Switching to one star produces the empty message and zero results. Reset restores both reviews. |
| Copy | Copy reports success after completion and the button becomes available again. |
| Gallery | Opens the selected image. Previous wraps from 1 of 3 to 3 of 3; ArrowRight returns to 1 of 3. Escape closes and returns focus to the original photograph link. At 375 CSS pixels, the dialog fits inside the viewport. |
| Hours | About displays the current Astana closed/open message. Automated checks cover 09:30 inclusive, 21:30 exclusive and the next-minute delay. |
| Menu and basket integration | Combined Chicken search and a 390 maximum produces no results; reset restores eight items. Chicken twice and Mini once produce three items totalling 1,670 ₸. The basket survives navigation through About and Feedback to Order. |
| Order integration | Invalid submission focuses customer-name. Valid synthetic input prepares a local demonstration with Chicken × 2, Mini × 1 and the same 1,670 ₸ total. |
| Home integration | Another suggestion changes Mini to Chicken while retaining the existing basket counts. |
| Responsive geometry | All six pages checked at actual widths 375, 768 and 1440 CSS pixels: no horizontal document overflow or broken loaded images. |
| Runtime health | No console errors reported across the checked routes and interactions. |

New gallery evidence: [about-gallery-desktop.jpg](../screenshots/assignment-4-5-timur/about-gallery-desktop.jpg). Existing desktop captures in screenshots/assignment-4-5-timur/ remain representative: this split preserves the rendered behaviour and styling. Interaction checks above were repeated against the split scripts.

## Limits

- Reviews exist only in memory, disappear after reload and are never sent to the shop. No database, authentication, real order or payment is added.
- Clipboard denial and broken-image recovery remain implemented; these failure paths were not forced during this browser pass. No full assistive-technology audit is claimed.
- The original source folder is not its own Git checkout; Git integration uses the separate repository checkout. This change does not create milestone tags, move midterm or claim completion of the full team submission.
