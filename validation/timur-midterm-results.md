# Timur pages — midterm source checks

Date: 4 October 2026 (Asia/Almaty).

Scope: `about.html`, `feedback.html`, `colophon.html`, `css/timur.css`, the empty `js/timur.js` entry point and README. This record documents source validation and fixes. It is not a browser or peer-review receipt.

## Findings and fixes

| Finding | Correction |
| --- | --- |
| Feedback could not be completed: disabled submit, `action="#"`, no result area. | An inline, non-modal native dialog now contains a form with `method="dialog"`. Valid submission closes the form; prepared CSS reveals the adjacent local confirmation without a request. The copy does not claim the shop received anything. |
| Form and buttons had no stable script hooks. | Added IDs to every form, button and input control on the three pages. Prepared review outputs, field errors, an error-summary template, confirmation, summary copying and copying failure. |
| Interaction states were absent from the local stylesheet. | Added `hidden`, `active`, `selected`, `error`, `success` and `pending`, invalid-field states, keyboard focus, long-text wrapping and native-dialog geometry. |
| Gallery had no prepared viewing controls. | Images remain ordinary working links. Added a closed native viewer with image, caption, position, previous/next, close and failure controls for the later script. |
| About footer alignment differed from the shared pattern. | Uses the same three-column footer structure and responsive alignment as the other pages. |
| Credits did not identify the images used on the owned pages. | Added a file/use/source table. Current photographs are truthfully credited to the business gallery, without claiming team authorship. |
| README had no three journeys or concrete freeze plan. | Added three visitor journeys and the state transitions, selectors, validation rules, failure recovery and browser-facility choices for future JavaScript. |
| A future script would have required editing frozen HTML to attach it. | All three pages now reference the same existing, empty `js/timur.js` with `defer`. No custom JavaScript code has been written. |

## Checks completed

- W3C Nu: **zero errors and zero warnings** for the three owned HTML pages. Machine-readable responses and SHA-256 source hashes are in `timur-midterm-html-validation.json`. The project email was substituted only in the submitted Colophon copy; structure and local source remained unchanged.
- Source reference checks: no duplicate IDs, missing local files, empty referenced images, dead internal anchors, `href="#"` destinations, or missing label/ARIA references on the three pages.
- All forms, input controls and buttons have consistent lowercase English IDs. Every planned future interaction has its existing markup hook.
- Every image has an `alt` attribute. New-tab external links have `noopener noreferrer`.
- Bootstrap still precedes the shared and page CSS. No inline styles, inline event handlers or custom script logic were introduced. The prepared page entry is zero bytes.
- State selectors exist; CSS braces are balanced. This is a source check, not a rendered CSS assessment.
- `index.html`, `menu.html`, `order.html`, `css/base.css` and `css/merey.css` matched their pre-change local copies byte for byte during the source preparation. When integrating into the repository's final branch, its existing versions were preserved.
- The README contains project documentation and the future interaction contract.

Source results are stored in `timur-midterm-source-checks.json`.

## Checks still required before submission

The current local HTML could not be opened through the available browser because its URL policy rejected `file://`. No alternative browser route was used to bypass that restriction. Current screenshots, console health, horizontal overflow and rendered interaction results are therefore **unverified**, rather than passed.

In a permitted browser, check all three pages at phone (375px) and desktop (1440px) widths. Open and close mobile navigation, follow the section/image/contact links, submit Feedback with empty and invalid fields, correct it, complete it, then start again. Confirm native reset and the radio selection. Save a phone and desktop screenshot of each page.

The three future enhancements deliberately remain unimplemented: feedback review/copying, the in-page gallery viewer and opening-hours status. Their markup and states already exist; future script behaviour must be checked after implementation.

The team must still replace the borrowed gallery photographs with its own originals, perform and record the required cross-review at least two days before the deadline, finish the Order page and validate the remaining pages. Preserve the course repository history, make the required genuine multi-day commits from each account, and confirm that the submitted `midterm` tag points to the team's agreed final commit after the whole site is ready. The existing tag currently points to the earlier team snapshot.

## Repository integration

The prepared files were integrated into branch `final` on top of `2ed51f8`. The branch versions of `index.html`, `menu.html`, `order.html`, `css/base.css`, `css/merey.css` and all existing assets were preserved. All local references on the three Timur pages resolve in that checkout. The existing `midterm` tag was not changed.
