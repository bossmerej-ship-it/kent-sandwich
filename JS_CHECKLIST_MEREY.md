# Assignment 4–5 JavaScript checklist — Merey's pages

Scope: `index.html`, `menu.html`, `order.html` and the shared scripts they load. Timur's `about.html`, `feedback.html`, `colophon.html` and `js/timur.js` are outside this implementation. The shared basket currently covers the three owned pages; whole-site team integration is pending.

The references below identify function declarations or concrete statements in the current source. They are implementation pointers, not claims that every academic requirement has been accepted. Check `validation/merey-assignment-4-5-results.md` for actual execution results.

## Data and calculation

| Requirement | Actual source reference | Behaviour |
| --- | --- | --- |
| Array of at least six objects with at least four meaningful properties | `js/menu-data.js:6` — `MENU` | Eight frozen catalogue records with `id`, `name`, numeric `price`, `description` and `profile`; values preserve the original menu |
| Reusable parameter/result function 1 | `js/menu-data.js:17` — `getMenuItem(items, id)` | Returns the matching item using strict ID equality |
| Reusable parameter/result function 2 | `js/menu-data.js:21` — `matchesFilters(item, query, profile, maxPrice)` | Trims and lowercases search; combines search, profile and inclusive price limit using `&&` and `||` |
| Reusable parameter/result function 3; one function calls another | `js/menu-data.js:29` — `filterMenu(items, query, profile, maxPrice)` | Returns a filtered array by calling `matchesFilters` |
| Reusable parameter/result function 4; arithmetic | `js/menu-data.js:46` — `calculateLineTotal(item, quantity)` | Returns numeric price × quantity |
| Array traversal, lookup, transformation and aggregation | `js/menu-data.js:34` — `normaliseCart(value)`; `js/menu-data.js:50` — `calculateCart(cart)` | Uses `forEach`, `find`, `map` and `reduce` to reject invalid saved lines and compute line subtotals, quantity and total |
| Strict inequality and state decisions | `js/main.js:72` — `setQuantity(id, quantity)`; specifically `js/main.js:79` | Rejects invalid numbers and unknown IDs; removes an item using `line.id !== id` when quantity reaches zero |
| Formatting a returned value | `js/menu-data.js:63` — `formatMoney(amount)` | Formats a numeric result and adds `₸` only for display |
| Meaningful `Math.random()` | `js/index.js:44` — `chooseSuggestion(previousIndex, items)`; `js/order.js:299` — `showConfirmation(basket)` | Picks a real sandwich without immediately repeating the current suggestion; generates a clearly local `DEMO-` reference |

## DOM, controls and events

| Requirement | Actual source reference | Behaviour |
| --- | --- | --- |
| Separate shared and page scripts, strict mode, `defer` | `index.html:12`, `menu.html:12`, `order.html:12`; line 2 of each of the five owned scripts | Data script loads before shared behaviour and page script; each file is wrapped in an IIFE with strict mode |
| Create elements and write safe text | `js/main.js:9` — `createElement(tag, classes, text)` | Uses `document.createElement` and `textContent`; visitor text is not parsed as HTML |
| Shared basket storage and notification | `js/main.js:35` — `readCart()`; `js/main.js:64` — `saveCart()`; `js/main.js:101` — `onCartChange(callback)` | Restores normalized product IDs/quantities, saves changes and notifies page views |
| Remove, clear and recompute basket | `js/main.js:72` — `setQuantity`; `js/main.js:93` — `removeFromCart`; `js/main.js:95` — `clearCart`; `js/main.js:147` — `renderCart()` | Updates rows, subtotals, total, count and empty state after each change |
| Connected controls | `js/menu.js:175` — `applyFilters(resetMessage)`; `js/menu.js:108` — `sortedResults(items, order)` | Search, profile and maximum price constrain the same data; sort controls its order |
| Repeated DOM rendering from one array | `js/menu.js:120` — `renderMenuCard(item)`; `js/menu.js:149` — `renderPriceRow(item)` | Creates cards and price rows from the same filtered results; `replaceChildren()` removes obsolete results |
| Result count, no matches and reset | `js/menu.js:175` — `applyFilters`; `js/menu.js:207` — reset listener | Gives a visible count, explains empty results, restores all controls and focuses search |
| `click` via `addEventListener` | `js/index.js:78`; `js/menu.js:216`; `js/main.js:191` | Another suggestion, Add to basket and basket quantity/remove actions |
| `submit` via `addEventListener` | `js/menu.js:203`; `js/order.js:339` | Search form prevents navigation; order form validates and prepares a local summary |
| Additional event types | `js/menu.js:199` — `input`; `js/menu.js:201` — `change`; `js/order.js:288` — `focusout`; `js/main.js:202` — `storage` | Immediate filtering, selection/quantity updates, field feedback and cross-tab basket synchronization |
| Existing state classes through `classList` | `js/main.js:113` — navigation state; `js/menu.js:161` — `updateBasketSelection()`; `js/order.js:118` — `showFieldError()` | Synchronizes active navigation from `aria-current`; switches selected cards and prepared error/success/hidden states without generating CSS |

## Form completion and accessibility

| Requirement | Actual source reference | Behaviour |
| --- | --- | --- |
| At least four validated fields, trimmed text and contact format | `js/order.js:208` — `fieldErrors()` | Checks name after trim, phone, email, pickup date/time, contact choice, notes and checked-item quantities |
| Numeric boundaries | `js/order.js:27` — `validateQuantity(value)` | Selected quantity must be a whole number from 1 to 10; invalid typed values remain visible for correction |
| Cross-field rule and useful date comparison | `js/order.js:8` — `getShopClock(now)`; `js/order.js:35` — `validatePickup(date, time, now)` | Uses the shop's calendar/time zone, rejects impossible/past dates, restricts 09:30–21:15 and requires the date/time pair to be later than now |
| Errors beside their fields and first invalid focus | `js/order.js:107` — `prepareError`; `js/order.js:118` — `showFieldError`; `js/order.js:339` — submit listener | Connects error text using `aria-describedby`, sets `aria-invalid`, preserves inputs, and focuses the first failing control |
| Empty basket cannot finish; visible live draft and counter | `js/order.js:159` — `updateDraft()` | Disables submit for an empty basket or completed draft; displays current total/pickup and note length |
| Finished local outcome, recovery and reset | `js/order.js:299` — `showConfirmation`; `js/order.js:173` — `invalidateConfirmation`; `js/order.js:364` — reset listener | Shows real basket lines/total plus a demo reference; states no order/payment/message was sent; supports editing and starting a cleared draft |
| Keyboard labels and feedback | `js/menu.js:19` — `addControl`; `js/main.js:138` — `makeCartButton`; `js/main.js:51` — `announce` | Explicit filter labels, real buttons, descriptive basket-action names and status announcements |
| Retain focus when repeated content changes | `js/main.js:147` — `renderCart`; `js/menu.js:161` — `updateBasketSelection`; `js/index.js:55` — `updateBasketSelection` | Restores a usable basket control after re-render; menu and Home additions update selection text without replacing the focused Add button |
| Storage failure and privacy | `js/main.js:30` — `showStorageNotice`; `js/main.js:35` — `readCart`; `js/main.js:64` — `saveCart` | Displays a current-page fallback notice; saves only catalogue IDs and quantities, never customer contact fields |

## Verification pointers and reproducible scenarios

Automated checks: run `node --test tests/menu-data.test.cjs tests/order-validation.test.cjs` from the repository root. `tests/menu-data.test.cjs` covers the eight records, connected filtering, totals and invalid saved baskets. `tests/order-validation.test.cjs` covers quantity boundaries, malformed dates/times, pickup boundaries, seconds around the current time and the shop's midnight calendar change. These focused tests do not verify rendered layout, keyboard operation, contact-field browser validity or teammate pages.

The browser report is `validation/merey-assignment-4-5-results.md`; screenshots belong in `screenshots/assignment-4-5-merey/`. Results must be recorded there after execution, with actual route, viewport, scenario and outcome. This checklist records expected behaviours rather than asserting a pass:

1. Home: another suggestion changes the item; adding it changes quantity/total and survives navigation to Menu and Order.
2. Menu: blank controls show eight results; maximum 640 shows five; search ` SPICY ` + Hot + maximum 690 shows only Spicy; an incompatible Compact profile shows no results; reset restores eight. Sorting changes both cards and table consistently.
3. Basket: Chicken × 2 + Mini × 1 gives three sandwiches and 1,670 ₸; increase/decrease/remove/clear update every output; quantity cannot exceed ten; no items means no completion.
4. Invalid draft: keep entered values, show errors for blank/whitespace name, malformed contacts, missing or past pickup, invalid quantity and out-of-hours time. A time earlier than now on today's Astana date must fail.
5. Valid draft: use a future pickup in the permitted hours; verify items, total, details and a `DEMO-` reference; changing any detail clears the stale summary; Edit and Start new demo work.
6. Keyboard: traverse filters, card Add buttons, basket controls and form; check focus after removal and invalid/valid submit. Check both collapsed and expanded navigation.
7. Viewports around 375 px, 768 px and desktop: inspect clipping, unwanted horizontal scrolling, labels, table and order layout; inspect console and loaded resources.
8. Storage: reload/navigate with a basket; synchronize a change from another tab; test malformed stored values and an unavailable-storage fallback separately where supported.

## Remaining team and academic requirements

- Timur's features and integration of the common basket beyond the three owned pages are pending.
- Preserve `midterm`. Create `assignment-4` and `assignment-5` only after the team's respective milestone is ready; this scoped update does not create those tags.
- Each student needs at least four meaningful commits over at least three genuine days. A 23 October 2026 implementation does not by itself satisfy that history; do not backdate it.
- Student peer review and the ability to explain/change another teammate's code must be completed by the team.
