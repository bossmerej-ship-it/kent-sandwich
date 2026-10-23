# Kent Sandwich Astana — Web Development Coursework

Six connected pages for the Kent Sandwich location at Adolfa Yanushkevicha Street, 1, Astana. The project continues in the same course repository. Bootstrap 5.3.8 supplies the grid, spacing, controls and mobile navigation; local CSS supplies the brand and prepared interaction states.

## Open the site

Extract the whole folder and open `index.html`. Keep `css/`, `images/` and `js/` beside the HTML files. An internet connection is required for Bootstrap from jsDelivr. No build step is required.

## Pages and responsibility

| Page | Purpose | Owner | Stylesheet |
| --- | --- | --- | --- |
| `index.html` | Introduction and visit overview | Merey Kuatbay | `css/merey.css` |
| `menu.html` | Sandwich choices and price comparison | Merey Kuatbay | `css/merey.css` |
| `order.html` | Order selection and pickup details | Merey Kuatbay | `css/merey.css` |
| `about.html` | Shop format, photographs, address, hours and contacts | Timur Naumov | `css/timur.css` |
| `feedback.html` | Visit feedback and local completion | Timur Naumov | `css/timur.css` |
| `colophon.html` | Site structure, design choices and source credits | Timur Naumov | `css/timur.css` |

All pages use `css/base.css` after Bootstrap and before their page stylesheet. Navigation lists the same six destinations. Main content uses `container`; the shared header and footer use `container-fluid`. Bootstrap columns stack on phones and split at `md` (768px) and `lg` (992px); navigation expands at `lg`.

## Three visitor journeys

1. **Plan a visit.** Start at Home → open Our place → choose Details → read the address and daily hours → open the 2GIS location or telephone link. The visitor finishes with the information needed to reach or contact the shop.
2. **Compare sandwiches.** Start at Home → open Menu → compare the sandwich descriptions and price table → identify a sandwich → open Our place for eating-in and takeaway information. The visitor finishes with a choice and the visit details.
3. **Complete visit feedback.** Start at Home → open Feedback → enter visit details → choose Review feedback → correct any field errors → review or edit the summary → confirm. A new review card and an explicit local confirmation appear. Search, rating filters and sorting help read reviews. The visitor can copy the summary or start another form. No message is sent to the shop by this website.

At the midterm, Order had prepared selection fields and result containers with an unconnected submission control. The Assignment 4–5 work now connects Merey's Home, Menu and Order pages through a retained basket and a validated local demo-order summary; the current scope and Functionality Plan are recorded below. The feedback journey above now describes Timur's JavaScript flow; the section below preserves the historical midterm behaviour.

## Feedback at the midterm

`feedback-form` is inside the initially open, non-modal `feedback-dialog`. Its native `method="dialog"` checks HTML constraints and then closes the dialog without a network request or putting entered values into the URL. CSS reveals the adjacent `feedback-confirmation` only after that closure. Clear form uses native reset; Start another feedback form reloads a fresh form. The confirmation describes local completion, never delivery to the business.

Name, visit date, rating and message are required. Email and phone are optional; entered values must be valid. Group size accepts whole numbers from 1 to 20. The HTML does not freeze a calendar date: `data-max-date="today"` identifies the field whose `max` the later script must set to today's Astana date during initialisation. Future-date and cross-field contact checks belong to that later enhancement.

## Assignment 4 and 5 baseline

The team will continue Assignment 4–5 from the existing `final` branch at commit `1330420751c1866c449b3aedc326127a85ac8fa8`. The original `midterm` tag remains unchanged at commit `fb5b79be9e5bf0e8a7acc2460a197d1c5092c319`.

### Existing corrections after the midterm tag

The following two commits were made on 5 October 2026, before the Assignment 4–5 JavaScript work. Both affect only the header/navigation classes in `index.html`, `menu.html` and `order.html`.

| Commit | Existing correction | Reason |
| --- | --- | --- |
| `0650cd2` | Removed Bootstrap's `bg-body-tertiary` class from the three page headers. | Restore the existing cream brand background instead of Bootstrap's background override. |
| `1330420` | Removed Bootstrap's `rounded-3` class from the navigation links on those pages. | Restore the original navigation appearance using the existing styles. |

These are visual corrections already present in `final`. No CSS files changed between the `midterm` tag and this `final` baseline. This section records the team's chosen baseline and its differences from the tagged snapshot.

From this baseline, keep the HTML interface and CSS rules frozen. Only script links may be added directly to HTML. Create, update and remove interface elements through JavaScript DOM methods, and apply existing state classes through `classList`. Do not move or replace the `midterm` tag.

## Assignment 4 and 5 Timur JavaScript

The JavaScript is divided into three plain scripts:

- `js/timur.js`: shared DOM/time helpers and header alignment on Timur's three pages.
- `js/about.js`: the gallery and opening-hours status on About.
- `js/feedback.js`: form validation, review cards, filters, sorting and completion on Feedback.

About and Feedback load the common script first, followed by their page script, all with `defer`. Colophon loads only the common script. Existing functions retain their behaviour. HTML edits are limited to the new script links; CSS and Merey's files are unchanged.

### Functionality Plan

| Page | Visitor goal | Function | Expected result | Responsible student |
| --- | --- | --- | --- | --- |
| Timur's three pages | Use consistent navigation | Apply the existing Home/Menu header classes and 44px logo through the DOM; remove Colophon from the header | Same header spacing, background and link appearance; Sources & credits remains in the footer | Timur Naumov |
| Feedback | Leave a useful review | Validate name, optional contacts, group size, visit date, rating, message and the contact-permission rule | Specific nearby errors, first-invalid focus, preserved input, live counter and errors that clear after correction | Timur Naumov |
| Feedback | Check and finish a review | Preview, edit, confirm, copy summary and start another review | One new local card with automatic date/time and a demo reference; no data sent to the business | Timur Naumov |
| Feedback | Read relevant reviews | Combined text/rating filters, date sorting, result count, average of rated results and reset | Reusable cards for the attributed source review and new local reviews, including a useful empty state | Timur Naumov |
| About | Inspect the interior | Native photograph dialog, previous/next, Left/Right keys and Escape | Three existing photographs with captions and counter; closing returns focus to the opening link | Timur Naumov |
| About | Know whether a visit fits opening hours | Compute the current Asia/Almaty time and refresh at minute boundaries and on return to the page | Open from 09:30 inclusive until 21:30 exclusive, otherwise show today's or tomorrow's opening time | Timur Naumov |

The two main individual visitor workflows are completing and reading feedback, and exploring the interior gallery. The hours status supports planning a visit. Colophon keeps its static credits content.

### Data and privacy

The eight existing menu items are represented by objects with `id`, `name`, `price` and `profile`, used to generate the feedback selection options. Their prices match the supplied menu. The existing 2GIS review retains its author, original date, source link and Russian language annotation. Its rating was not supplied, so it is shown as not rated. No customer reviews or ratings are invented.

New reviews exist only in memory on the current page and disappear after a reload. Contact fields are included in the private preview/copy summary only when the visitor selects the contact-permission checkbox; they are never added to review cards or browser storage. A demo reference is temporary and does not confirm a real order, booking or payment.

### Feedback behaviour

Required text is trimmed before validation. Names must contain 2–80 characters and messages 20–600. Optional email and phone must be valid when entered. Group size must be a whole number from 1 to 20. A visit date must exist and must not be in the future in Astana. Rating must be from 1 to 5. Including contact details requires an email or phone number.

A valid submit opens the prepared review panel. Edit preserves the entered fields; Confirm adds exactly one card, resets review filters and displays the prepared summary. Reset and Start another feedback form clear the draft without deleting reviews already added during the current page visit. Copy reports success only after the Clipboard API succeeds and offers manual selection if copying fails. All visitor text is inserted with `textContent` or a textarea value.

### Verification

[JS_CHECKLIST_TIMUR.md](JS_CHECKLIST_TIMUR.md) maps requirements to the exact files and line numbers in the split scripts.

Run `node --test tests/timur.test.cjs`. The tests use Node's built-in test runner and the actual script, without additional packages. They cover date/time boundaries, field rules, connected filters and gallery wrapping. Browser checks and scope verification are recorded in `validation/timur-assignment-4-5-results.md`. Integration checks against the current `final` branch are recorded in the same verification report. Team milestone tags are separate from this scoped implementation.

## Sources and photographs

- Business listing and existing menu references: [Kent Sandwich on 2GIS](https://2gis.kz/astana/firm/70000001114376342).
- Shop profile and logo source: [@kentsandwich.kz](https://www.instagram.com/kentsandwich.kz/).
- The current photographs come from the business gallery on 2GIS. Before the midterm submission, replace them with photographs taken by the team and update the credits in `colophon.html`. Current image credits do not claim team authorship.
- [Bootstrap documentation](https://getbootstrap.com/docs/5.3/getting-started/introduction/) and [Navbar](https://getbootstrap.com/docs/5.3/components/navbar/).
- [Native dialog and dialog form behaviour](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog).

## Submission and quality pass

On 4 October 2026, W3C Nu returned zero errors and warnings for `about.html`, `feedback.html` and `colophon.html`. Local source checks found no duplicate IDs, missing local references or broken label/ARIA targets on these pages. Results and source hashes are recorded in `validation/timur-midterm-results.md` and the adjacent JSON reports. Current browser checks and screenshots still need completion; earlier September browser reports describe their own snapshots and are not evidence for these changed pages.

Before submitting:

1. Check all six final pages with W3C Nu: zero errors. Check console, images, links, navigation and horizontal overflow in the actual browser at phone and desktop widths.
2. Save a phone and desktop screenshot of every page. Existing screenshots show earlier snapshots; current screenshots of all six final pages still need capture.
3. At least two days before the deadline, each student checks the other student's pages. Record date, reviewer, device, routes/forms checked, findings and fixes. Source checks do not replace this peer pass.
4. Work in the existing course Git repository and preserve its history. Confirm the repository root before staging. For Assignment 4–5, each student needs at least four meaningful commits across at least three different days. Work added on 23 October 2026 belongs to that actual day; this update alone cannot establish the required three-day history. Do not backdate commits or claim that this requirement has been satisfied by one day's work.
5. Preserve the existing `midterm` tag and its frozen snapshot. For Assignment 4–5, use the baseline documented above and create the separate `assignment-4` and `assignment-5` milestone tags when their respective work is complete.
6. Prepare to explain another team member's page, the prepared JavaScript hooks, native form constraints, CSS selectors and Bootstrap choices during the defence.

## Assignment 4–5 Functionality Plan: Merey's pages

This implementation is limited to `index.html`, `menu.html` and `order.html`, with shared JavaScript used by those three pages. Their only direct HTML changes after the documented `final` baseline are deferred script links. New controls and results are created through DOM methods; existing CSS and prepared state classes supply their appearance. `about.html`, `feedback.html`, `colophon.html`, `js/timur.js` and Timur's styles and AI log are outside this change and remain his responsibility.

| Page | Visitor goal | Function | Visible result and completion | Owner |
| --- | --- | --- | --- | --- |
| `index.html` | Choose a sandwich when unsure | A random suggestion from the real eight-item catalogue, another suggestion without immediately repeating the last item, and Add to basket | Name, profile, description and real listed price; basket quantity and explicit feedback after adding; links to Menu and Order | Merey Kuatbay |
| `menu.html` | Find a suitable sandwich | Connected name/description search, profile and maximum-price filters, plus price/name sorting | Card grid and price table show the same results; result count, no-results explanation and reset restore a complete browsing flow | Merey Kuatbay |
| `menu.html` → `order.html` | Build a basket from chosen sandwiches | Add on any visible menu card; retain product IDs and quantities in browser storage | Selected cards and basket link reflect the current quantity and total; Order restores the same basket | Merey Kuatbay |
| `order.html` | Review and change a selection | Checkbox and quantity selection; basket increase, decrease, remove and clear actions; one-to-ten quantity limit | Line subtotals, item count and total update together; empty basket explains the next action and disables submission | Merey Kuatbay |
| `order.html` | Prepare a valid pickup draft | Validate trimmed name, phone, email, selected quantities, date, time and contact method; enforce a future Astana pickup within 09:30–21:15 | Errors appear next to their fields; invalid submission focuses the first failing control; a live draft and note counter help correction | Merey Kuatbay |
| `order.html` | Finish the local demo and continue safely | Prepare demo order, edit details or start a new demo | A random `DEMO-` reference, actual items/quantities, total and entered details; explicit notice that nothing was sent to the shop; edits clear the old summary and starting again clears the draft and basket | Merey Kuatbay |
| Home, Menu and Order | Keep one selection while navigating | Shared basket storage, header count, change notifications and cross-tab synchronization | Counts, selections and Order agree; unavailable storage produces an honest current-page-only notice | Merey Kuatbay; integration into Timur's pages remains pending |

The two main individual workflows are menu discovery with basket actions and the complete validated pickup-demo flow. Home's suggestion is an additional useful interaction. The shared basket currently spans Merey's three pages only; the team still needs to agree and integrate the common feature across the other pages before claiming a whole-site shared feature. This scope does not claim completion of Timur's assignment work or of the combined team submission.

### Data, scripts and local behaviour

Each of the three owned pages loads `js/menu-data.js`, then `js/main.js`, then its page script (`js/index.js`, `js/menu.js` or `js/order.js`) with `defer`. Each script uses strict mode. The eight immutable catalogue objects preserve the existing names, descriptions, profiles and numeric prices. Reusable lookup, filtering, normalization and calculation functions are separated from page rendering.

Only basket product IDs and quantities are saved under `kent-sandwich-basket-v1`. Prices always come from the catalogue. Customer contact fields and pickup details stay on the current page and are not saved in browser storage. There is no backend, payment or message delivery. Refreshing the page discards personal form details while restoring a valid saved basket when browser storage permits it.

### Evidence and team submission status

`JS_CHECKLIST_MEREY.md` maps the actual functions and requirements to source lines. The verification report is `validation/merey-assignment-4-5-results.md`; browser captures belong in `screenshots/assignment-4-5-merey/`. Use that report for the checks actually completed and any remaining limitations; this plan alone is not a QA result. Existing midterm reports and screenshots describe earlier snapshots.

The focused automated checks run with `node --test tests/menu-data.test.cjs tests/order-validation.test.cjs`. They cover catalogue/filter/basket logic and quantity/date/time validation; they do not replace browser, keyboard, layout or peer checks. Review the browser report before treating any runtime path as verified.

The original `midterm` tag stays unchanged. The `assignment-4` and `assignment-5` tags are deliberately deferred until the combined team's respective milestones and evidence are ready. The four-commits-over-three-days requirement, peer review and defence preparation require genuine team participation and cannot be created by this single-day implementation.
