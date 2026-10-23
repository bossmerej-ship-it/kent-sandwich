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
3. **Complete visit feedback.** Start at Home → open Feedback → enter a name, past/current visit date, rating and 20–600 characters of feedback → optionally add contact details → choose Complete feedback. Native validation keeps invalid fields open; valid submission replaces the form with an explicit local confirmation. The visitor can contact the shop or start another form. No message is sent to the shop by this website.

At the midterm, Order had prepared selection fields and result containers with an unconnected submission control. The Assignment 4–5 work now connects Merey's Home, Menu and Order pages through a retained basket and a validated local demo-order summary; the current scope and Functionality Plan are recorded below. The three journeys above describe the midterm snapshot, including Timur's separate feedback journey.

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

These are visual corrections already present in `final`; they do not implement JavaScript features or claim Assignment 4–5 credit. No CSS files changed between the `midterm` tag and this `final` baseline. This section records the team's chosen baseline and its differences from the tagged snapshot; it does not claim that the baseline deviation has been approved by the instructor.

From this baseline, keep the HTML interface and CSS rules frozen. Only script links may be added directly to HTML. Create, update and remove interface elements through JavaScript DOM methods, and apply existing state classes through `classList`. Do not move or replace the `midterm` tag.

## JavaScript plan after the HTML/CSS freeze

All three Timur pages already load the empty `js/timur.js` with `defer`. It contains no custom behaviour at the midterm. Later assignments can fill this file without editing HTML or CSS. Use `document.body.dataset.page` to initialise only the relevant page. Bootstrap continues to own the shared mobile menu.

Use browser facilities already present: the Constraint Validation API and `FormData` for the form, native `HTMLDialogElement` for the viewer, `Intl.DateTimeFormat` for Astana time, and the Clipboard API with a manual-copy fallback. Keep feedback in memory for the current page; do not send it to a service or persist personal fields automatically.

### Feedback states and transitions

| State | Existing markup and action |
| --- | --- |
| Editing | `feedback-dialog` is open; `feedback-form` is visible; `feedback-review` has `hidden`. Update `feedback-character-count` on input and reveal `feedback-count-row` only once the script owns that counter. |
| Invalid | Keep values. Populate `feedback-error-list` from `feedback-error-item`; reveal the matching prewritten field error. Set `aria-invalid="true"`, add `error`, and focus `feedback-errors`. Each summary link targets the actual invalid control. |
| Reviewing | Intercept the form's `submit` with `preventDefault()`. After validation, populate the existing `feedback-review-*` outputs with `textContent`, hide the form and reveal/focus `feedback-review`. |
| Correcting | `feedback-edit` returns to the form with all entered values preserved. Clear resolved field errors as the visitor corrects them. |
| Completed | `feedback-confirm` prepares plain text in `feedback-share-text`, reveals `feedback-share`, then calls `feedback-dialog.close("complete")`. The existing confirmation becomes visible; focus it. Include contact details only when `contact-permission` is checked. |
| Copying | `feedback-copy` copies the prepared text. Use `pending` and disable the button only during the promise; then show an accurate result in `feedback-copy-status`. |
| Copy failed | Reveal `feedback-copy-error`, focus/select the read-only summary and allow manual copying. Do not claim that text was copied or sent. |
| Starting again | Intercept `feedback-restart`, call `feedback-form.reset()`, clear outputs/errors/copy status, hide the review/share panels, show the form, and reopen the non-modal dialog with `.show()`. Reset the counter and focus the name input. |

On enhancement, set `feedback-form.noValidate = true` so the script can show the prepared error summary on invalid submit; then reuse native `validity`/`checkValidity()` rather than a second validation framework. Also trim the name and message before checking their lengths; reject a future visit date; reject blank contact details when the include-contact checkbox is selected. Keep the original fields editable on every failure. Format the chosen sandwich and rating from their visible labels. Optional blank fields should read "Not provided" in the review instead of empty rows.

### Our place interactions

| Interaction | Existing hooks | Future behaviour |
| --- | --- | --- |
| Photograph viewer | `gallery-link-1`–`gallery-link-3`, `gallery-dialog`, `gallery-dialog-image`, `gallery-dialog-caption`, `gallery-position`, `gallery-previous`, `gallery-next`, `gallery-close`, `gallery-error` | Intercept a photograph link, read its image and `data-caption-id`, and call `.showModal()`. Previous/Next and Left/Right cycle through the three images and update the existing image/caption/counter. Keep native Escape/close behaviour, remember the opener and restore focus on close. If an image fails, show the prepared error and retain a working close action. Without enhancement, each link already opens its real image. |
| Opening-hours status | `visit-hours` with `data-open`, `data-close`, `data-time-zone`; `visit-status` | Compute time in `Asia/Almaty`. The shop is open at 09:30 and closed from 21:30. Fill and reveal the existing status with "Open until 21:30" or "Closed — opens at 09:30". Refresh on return to the tab and at minute intervals; use `success` only for the open state. |
| Section navigation | `about-section-nav`, `story-link`, `space-link`, `details-link` and their `data-section` values | Ordinary anchors work now. An `IntersectionObserver` can later move `active` and `aria-current="location"` to the section in view. |

Colophon remains a static source page. Its source blocks and image-credit rows already have IDs if their content later needs updating.

### Prepared styling

`css/timur.css` already defines `hidden`, `active`, `selected`, `error`, `success` and `pending`, plus invalid-field focus, review text wrapping and the native viewer geometry/backdrop. Native radio selection is visible before enhancement; later code can also switch `selected`. Hidden panels contain real headings, buttons and field-error messages, with empty outputs where actual visitor data belongs.

After the freeze, update values, attributes and `classList` through JavaScript. Use `textContent` for visitor text, not HTML interpolation. Clone the prepared error template when generating error rows. Do not inject styles, write inline CSS or manually add markup. The script entry, state containers and controls already exist.

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

