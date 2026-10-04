# Kent Sandwich Astana — Midterm

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

The Order page has prepared selection fields and result containers, but its submission control is not connected to behaviour yet. Its owner needs to finish that flow before the whole site's ordering journey is complete. The feedback journey does not depend on it.

## Feedback at the midterm

`feedback-form` is inside the initially open, non-modal `feedback-dialog`. Its native `method="dialog"` checks HTML constraints and then closes the dialog without a network request or putting entered values into the URL. CSS reveals the adjacent `feedback-confirmation` only after that closure. Clear form uses native reset; Start another feedback form reloads a fresh form. The confirmation describes local completion, never delivery to the business.

Name, visit date, rating and message are required. Email and phone are optional; entered values must be valid. Group size accepts whole numbers from 1 to 20. The HTML does not freeze a calendar date: `data-max-date="today"` identifies the field whose `max` the later script must set to today's Astana date during initialisation. Future-date and cross-field contact checks belong to that later enhancement.

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
4. Work in the existing course Git repository and preserve its history. Confirm the repository root before staging. Each student makes genuine commits from their own account across at least four different days.
5. After all pages and evidence are complete, confirm that the submitted `midterm` tag points to the team's agreed final commit. A tag with that name already exists in the repository; it currently points to the earlier team snapshot. The submission tag freezes HTML and CSS for later assignments.
6. Prepare to explain another team member's page, the prepared JavaScript hooks, native form constraints, CSS selectors and Bootstrap choices during the defence.
