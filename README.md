# Kent Sandwich Astana — Web Development Coursework

Six connected pages for the Kent Sandwich location at Adolfa Yanushkevicha Street, 1, Astana. The project continues in the same course repository. Bootstrap 5.3.8 supplies the grid, spacing, controls and mobile navigation; local CSS supplies the brand and prepared interaction states.

## Open the site

Serve the repository root with `python -m http.server 8765 --bind 127.0.0.1` and open [the home page](http://127.0.0.1:8765/index.html). Use the same local address for each page so the basket carries across navigation. The browser loads Bootstrap and jQuery from their CDNs.

## Endterm on Home Menu and Order

Merey Kuatbay owns Home, Menu and Order. The table describes what changed since the previous jQuery assignment. [The AI usage log](AI_USAGE_MEREY.md) records assistance with this implementation.

| Feature | Technology and source | New behaviour for the visitor |
| --- | --- | --- |
| Home recommendations | Plain JavaScript in [index.js](js/index.js) | Set a maximum price for the existing random suggestion. The card and the Another suggestion button use the matching sandwiches. |
| Menu filtering | jQuery in [menu.js](js/menu.js) | The existing result count now shows the lowest price among the sandwiches that match the filters. |
| Order selection and pickup | jQuery in [order.js](js/order.js) | The existing choices use prices from the shared catalogue. Enter pickup details and prepare or edit the local demo summary. |
| Shared basket | jQuery basket controls in [main.js](js/main.js). Shared data and storage in [menu-data.js](js/menu-data.js) and [basket.js](js/basket.js). | The native Home and jQuery pages use one basket. Clearing the basket gives a path back to the menu, and editing a completed demo restores its items together. |

The catalogue supplies the recommendation cards, menu cards, price rows and order choices. Home creates the cards in a loop with native DOM methods. Its price change handler limits the choices and its parent click handler handles the two suggestion buttons. Menu and Order use jQuery ready callbacks, delegated events and traversal. The filter panel slides, add-to-basket feedback fades in, and Order reveals its confirmation. Browser storage contains only product IDs and quantities.

Timur Naumov owns About, Feedback and Colophon. His gallery, opening hours and feedback interactions use jQuery in `js/about.js`, `js/feedback.js` and `js/timur.js`.

### Try the endterm flows

1. On Home, select a maximum of 390 ₸ to get the Mini sandwich, then add it to the basket.
2. In Menu, set the profile to Hot. The lowest price shown in the result count changes from 390 ₸ to 690 ₸.
3. In Order, enter a future pickup date and time in Astana. Try an invalid phone or email, correct it and prepare the demo. Edit the summary to restore the draft.

Run the automated checks with `node --test tests/*.test.cjs`. All 29 tests passed for this revision. Browser checks covered the budget limit, the filtered lowest price and manual checkout, with no console errors on the six pages.

The course also requires students to record a peer check and contribute on separate days.

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

This implementation is limited to `index.html`, `menu.html` and `order.html`, with shared JavaScript used by those three pages. Their only direct HTML changes after the documented `final` baseline are deferred script links. New controls and results are created through DOM methods; existing CSS and prepared state classes supply their appearance. `about.html`, `feedback.html`, `colophon.html`, `js/timur.js` and Timur's styles are outside this change and remain his responsibility.

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

Each of the three owned pages now loads the full jQuery 3.7.1 CDN build, `js/menu-data.js`, `js/main.js`, then its page script (`js/index.js`, `js/menu.js` or `js/order.js`), all with `defer`. UI initialization runs inside jQuery ready callbacks. Each script uses strict mode. The eight immutable catalogue objects preserve the existing names, descriptions, profiles and numeric prices. Pure lookup, filtering, normalization, calculation and validation functions stay separate from jQuery DOM rendering.

Only basket product IDs and quantities are saved under `kent-sandwich-basket-v1`. Prices always come from the catalogue. Customer contact fields and pickup details stay on the current page and are not saved in browser storage. There is no backend, payment or message delivery. Refreshing the page discards personal form details while restoring a valid saved basket when browser storage permits it.

### Evidence and team submission status

`JS_CHECKLIST_MEREY.md`, `validation/merey-assignment-4-5-results.md` and `screenshots/assignment-4-5-merey/` describe the previous plain-JavaScript implementation. Their line references, source hashes and captures are historical, not evidence for the current jQuery version. The current requirement map and checks are below.

The focused automated checks run with `node --test tests/menu-data.test.cjs tests/order-validation.test.cjs`. They cover catalogue/filter/basket logic and quantity/date/time validation; they do not replace browser, keyboard, layout or peer checks. Review the browser report before treating any runtime path as verified.

The original `midterm` tag stays unchanged. The `assignment-4` and `assignment-5` tags are deliberately deferred until the combined team's respective milestones and evidence are ready. The four-commits-over-three-days requirement, peer review and defence preparation require genuine team participation and cannot be created by this single-day implementation.

## jQuery assignment — Merey's Home, Menu and Order

The supplied file is named `assignment6_jquery`, although its heading says Assignment 4. This update continues `final` from `c1ce694` and keeps the existing team and repository. This section describes the Home, Menu and Order migration. The later migration of Timur's pages is documented below. HTML changes are limited to the CDN script link and its explanatory comment on these three pages; no CSS rules or handwritten interface elements were added. Bootstrap still owns the existing mobile navigation. No jQuery plugins were added.

### Three rewrites and the comparison archive

[`js/old-js-version.js`](js/old-js-version.js) preserves the complete previous `main.js`, `index.js`, `menu.js` and `order.js`, with file boundaries. It is **not loaded by any page**. Compare these three features with their labelled rewrite comments in the active files:

| Previous feature | Current implementation | Preserved behaviour |
| --- | --- | --- |
| Menu filtering and rendering | `applyFilters` in [`js/menu.js`](js/menu.js) | Connected search/profile/budget filters, sorting, count, reset, empty state, matching cards and price rows |
| Basket rendering and actions | `renderCart` and delegated click handler in [`js/main.js`](js/main.js) | Array-built rows, quantities, remove/clear, subtotals, total, keyboard focus, persistence and cross-tab changes |
| Order validation and completion | Ready callback in [`js/order.js`](js/order.js) | Nearby errors, immediate correction, future pickup within 09:30–21:15 Astana time, safe local summary and editing |

Home's random suggestion also uses jQuery so it can share the same UI helpers. `Kent.element` returns a jQuery collection. `menu-data.js` and the pure validators use ordinary JavaScript for data and calculations, without accessing the DOM. Each migrated feature uses jQuery consistently for DOM operations and event handlers.

**New completion behaviour:** after every valid submit, the form, checkboxes, notes and basket reset immediately. A separate in-memory snapshot keeps the confirmation visible. **Edit details** restores that snapshot and its basket; **Start new demo** clears the confirmation. Invalid submission preserves the draft. This remains a demonstration: no order, payment or contact request is sent, and personal fields are never saved to browser storage.

### Requirement map for the defence

| Requirement | Where to demonstrate it |
| --- | --- |
| CDN, version and ready | The three HTML heads pin full jQuery 3.7.1 with an integrity hash before local deferred scripts; UI code uses `jQuery(function ($) { ... })` |
| ID, class, tag, attribute and filter selectors | `#order-form`, `.menu-board`, `main`, `[data-cart-action]`, `[name="items"]:checked`, `button:not(:disabled)` |
| `.find()`, `.closest()`, `.parent()`, `.siblings()`, `.each()` | Order finds quantity controls from checkbox → parent label → sibling quantity label → input; menu and navigation iterate collections |
| `$(this)` in handlers | Delegated basket buttons, delegated menu buttons, filter toggle and form input/change/focusout |
| Two chains with three or more methods | `showBasketFeedback` in Menu (each link explained in a comment); creation of the demo notice in Order (`attr → html → insertBefore`) |
| `.text()` versus `.html()` | Visitor names, notes and summaries use `.text()`; `.html()` is used only for fixed, trusted **Demo only** emphasis |
| `.val()`, `.attr()`, `.prop()` | Read/reset form values; set labels and ARIA attributes; read/write the live checkbox checked state and disabled buttons |
| Existing state classes | `addClass`, `removeClass`, `toggleClass` and `hasClass` use existing Bootstrap/Merey classes for selected, hidden, error and success states |
| Array-built list absent from HTML | The initially empty `#cart-items` receives basket rows with `.append()` / `.appendTo()` |
| Events and delegation | All handlers in the migrated UI use `.on()`; click, input, change, focusout, submit, reset and storage. Parent handlers catch cards/rows/buttons created later |
| Three useful effects | Menu filter controls: `.slideToggle()`; Add-to-basket response: `.fadeIn()`; successful Order confirmation: `.slideDown()` |
| Duration and callback | Effects use 220 ms, or 0 for reduced motion. After opening filters, focus moves to search; after confirmation opens, focus moves to the summary |
| Full form validation | Trimmed name, phone and email formats, selected quantities, pickup date/time, allowed contact method, optional note length; contact-request is an optional boolean. Selection errors appear beside the item group |
| Browser/server boundary | `required`, types and bounds remain in HTML; custom nearby errors take over after enhancement. The source explains why a real server must validate again |

The effects use jQuery's own temporary animation styles; no manual `.css()` styling or new stylesheet rules are introduced. Repeated filter/feedback actions finish or clear old effects instead of building animation queues.

### Run and check

Serve the repository root with `python -m http.server 8765 --bind 127.0.0.1`, then open `http://127.0.0.1:8765/index.html`. Internet access is needed for the existing Bootstrap CDN and the jQuery CDN.

Run the focused tests:

```sh
node --test tests/menu-data.test.cjs tests/order-validation.test.cjs tests/timur.test.cjs
```

On 31 October 2026, all 29 tests passed. Local browser checks covered Home suggestion/add/reload, combined menu filters and no-results/reset, sorting followed by delegated Add, filter effects/focus, basket limits/removal and cross-tab sync, nearby form errors and correction, successful reset with preserved confirmation, editing and starting again. HTML-like input remained literal text. Home/Menu/Order were checked at phone and desktop sizes; no horizontal overflow was observed. The six pages loaded with no observed console errors. This is local verification, not proof of a public deployment or a student peer review.

For a short live demo: filter Menu to Hot and up to 690 ₸, reset and sort it, add a newly rendered card, change its quantity in Order, submit incomplete details, fix them, then show the cleared form and retained confirmation. Use Edit details to restore the draft. Be ready to explain the vanilla equivalents, delegation, chains, `.text()`/`.html()` and `.attr()`/`.prop()`.

Keep the existing repository, jQuery scripts, comparison archive and README together; this assignment asks for no separate report or recording. Four genuine commits across three different days per student (six commits for solo work) and the live defence remain personal submission requirements. Today's migration does not establish three different work days. During the defence, use only the resources allowed by the assignment: official documentation and W3Schools, with no outside assistance.

References: [jQuery releases](https://releases.jquery.com/jquery/), [`.on()` and delegation](https://api.jquery.com/on/), [`.prop()` and checkbox state](https://api.jquery.com/prop/), [`.slideToggle()`](https://api.jquery.com/slideToggle/), [`.stop()`](https://api.jquery.com/stop/).


## Assignment 4 — Timur's jQuery implementation

About, Feedback and Colophon load the same full jQuery 3.7.1 CDN build as the other pages, before their own deferred scripts. UI setup runs inside ready callbacks. HTML changes only connect the library and explain its version; existing CSS and Merey's active code are unchanged.

- `js/timur.js`: jQuery element creation and header alignment, the existing Astana clock helper and reduced-motion handling.
- `js/about.js`: jQuery gallery events, image/caption updates, keyboard navigation and focus restoration; opening hours still refresh at minute boundaries in Asia/Almaty.
- `js/feedback.js`: trimmed input validation, nearby errors that clear on correction, preview/edit/confirm, array-built review cards, combined filters, copying with manual fallback and restarting.

The three rewritten features are feedback validation/review, review-card rendering/filtering and the photograph viewer. Comments compare their jQuery methods with the previous DOM code. Complete previous versions of `timur.js`, `about.js` and `feedback.js` are appended to `js/old-js-version.js`, which is never loaded by a page.

Selectors cover IDs, classes, elements, attributes and `:checked`. Traversal uses `.find()`, `.closest()`, `.parent()`, `.siblings()` and `.each()`. Event handlers use `.on()`; error-summary links use delegation because validation creates them later. Chains and the differences between `.text()`/`.html()` and `.attr()`/`.prop()` are explained in code. Visitor content is rendered as text; `.html()` is reserved for fixed markup.

Feedback transitions use `.fadeOut()`, `.slideDown()` and `.fadeIn()` with a duration and a focus callback. Reduced-motion preference disables the animation duration. Confirmation resets the form while preserving the local review and summary. Contact details never enter public cards or browser storage. No feedback is sent to the shop. Native HTML constraints remain, and comments explain why a real server must validate again.

Run unit checks with `node --test tests/*.test.cjs`. For browser regression checks, serve the repository on port 8765 and run `node tests/timur-browser.cjs` with Playwright available to Node. `CHROME_PATH` overrides the default Google Chrome path on macOS; `BASE_URL` overrides the local URL. Coverage includes validation/correction, delegated links, preview/edit, safe text rendering, reset, review filters, clipboard recovery, gallery keyboard/focus, reduced motion and layouts at 375/768/1440 pixels.

The older checklists, validation reports and screenshots are preserved as historical material; they describe their original snapshots rather than this migration.
