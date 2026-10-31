# Assignment 4 and 5 JavaScript checklist for Timur

Scope: about.html, feedback.html, colophon.html and their three scripts. Existing team code remains separate. The source locations below identify the current function declaration or statement; update this checklist if those files change.

## File structure

- js/timur.js: common element creation, Astana clock and header alignment.
- js/about.js: opening status, minute refresh and photograph viewer.
- js/feedback.js: menu choices, validation, review cards, filtering, sorting and form completion.

Every script starts with strict mode. const is used for fixed bindings and let for changing state. Scripts use native DOM methods, existing CSS classes and addEventListener.

## Requirement references

| Requirement | Exact source location | Behaviour |
| --- | --- | --- |
| Common helpers and header | [js/timur.js:23](js/timur.js#L23) | Only the shared header and reusable DOM/time helpers are in timur.js. |
| Eight objects with four properties | [js/feedback.js:4](js/feedback.js#L4) | id, name, price and profile represent the existing menu and generate the feedback options. |
| Reusable function with parameters and return value | [js/timur.js:3](js/timur.js#L3) | Creates and returns an element using textContent. |
| Reusable function with parameters and return value | [js/timur.js:10](js/timur.js#L10) | Returns the Astana date and time for the supplied Date. |
| Reusable function calling another function | [js/about.js:3](js/about.js#L3) | Calls getShopClock and returns the open state and message. |
| Reusable validation function | [js/feedback.js:22](js/feedback.js#L22) | Returns specific field errors from the supplied data and current shop date. |
| Filtering, sorting, strict comparisons and logical operators | [js/feedback.js:55](js/feedback.js#L55) | Combines normalized search with rating, then sorts a new result array. |
| Arithmetic, loop and meaningful calculation | [js/feedback.js:193](js/feedback.js#L193) | Totals the displayed numeric ratings and divides by their count; unrated reviews are excluded. |
| Meaningful Math.random() | [js/feedback.js:298](js/feedback.js#L298) | Creates a clearly labelled temporary DEMO reference. |
| Shared repeated card rendering | [js/feedback.js:70](js/feedback.js#L70) | Existing and new reviews use the same function; source credit/language are preserved. |
| Create and remove repeated content | [js/feedback.js:186](js/feedback.js#L186) | replaceChildren removes previous results; the loop creates cards for the current selection. |
| Search and rating controls | [js/feedback.js:155](js/feedback.js#L155) | Connected search and rating controls operate on the same reviews array. |
| Count, empty state and reset | [js/feedback.js:197](js/feedback.js#L197) | Resets controls and renders again; renderReviews sets the count and empty-state class. |
| Input and change events | [js/feedback.js:259](js/feedback.js#L259) | Updates the character count, selected rating and outdated errors. |
| Submit event | [js/feedback.js:263](js/feedback.js#L263) | Prevents default submission and validates before preview. |
| Click and keyboard events | [js/about.js:71](js/about.js#L71) | Gallery click handlers open/move photos; Left/Right navigate and native Escape closes. |
| At least four field rules | [js/feedback.js:22](js/feedback.js#L22) | Trimmed name and text, optional email/phone, integer group size, actual nonfuture date and rating. |
| Cross-field rule | [js/feedback.js:49](js/feedback.js#L49) | Contact permission requires an email or phone number. |
| Nearby errors and ARIA state | [js/feedback.js:227](js/feedback.js#L227) | Updates prepared field errors, aria-invalid, summary links and existing error/hidden classes. |
| Focus the first invalid field | [js/feedback.js:272](js/feedback.js#L272) | Invalid submission keeps the draft and focuses its first failing control. |
| Live character counter | [js/feedback.js:253](js/feedback.js#L253) | Counts the current input; validation checks the trimmed length separately. |
| Preview, edit and one confirmation | [js/feedback.js:295](js/feedback.js#L295) | Preview can be edited; confirmation advances stage and creates one local card with a timestamp. |
| Reset and copy recovery | [js/feedback.js:319](js/feedback.js#L319); [js/feedback.js:345](js/feedback.js#L345) | Reset clears the draft; copying uses pending state and a manual-selection fallback. |
| Gallery wrapping and focus restoration | [js/about.js:18](js/about.js#L18); [js/about.js:78](js/about.js#L78) | Wraps between the three photos and returns focus to the opening link. |
| Opening hours and refresh | [js/about.js:31](js/about.js#L31) | Updates at minute boundaries; 09:30 is inclusive and 21:30 exclusive in Asia/Almaty. |
| Deferred scripts in dependency order | [about.html:160](about.html#L160); [feedback.html:189](feedback.html#L189); [colophon.html:115](colophon.html#L115) | About and Feedback load timur.js first, then their own page script; Colophon needs only the common script. |

## Evidence and limits

Run `node --test` for both students' tests. Run `node --test tests/timur.test.cjs` for the 13 Timur checks, including the actual HTML script order. The verification report is [validation/timur-assignment-4-5-results.md](validation/timur-assignment-4-5-results.md); existing captures are in screenshots/assignment-4-5-timur/.

CSS is unchanged. The only direct HTML edits for this split are one deferred script link in About and one in Feedback. Visitor text uses textContent or textarea values. New reviews stay in memory on the current page and disappear on reload; contact fields never enter public review cards or browser storage. Confirmation explicitly describes a local demonstration.

## Trace these flows at defense

1. Feedback input -> readFeedback -> validateFeedback -> showErrors or preview -> Confirm -> reviews.push -> renderReviews -> renderFeedbackCard.
2. Search/rating input -> filterFeedback -> matching array -> count, average and cards or empty message.
3. Gallery click -> showPhoto -> showModal -> previous/next index -> close -> focus return.
4. Current Date -> getShopClock -> getOpeningStatus -> status text and existing class.
5. Also explain the team's menu-to-basket-to-order flow using JS_CHECKLIST_MEREY.md. Code explanation and a live change must be demonstrated by the student.
