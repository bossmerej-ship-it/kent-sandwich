# HTML Tag Checklist — Kent Sandwich Website

**Authors / Team:** Timur Naumov & Merey Kuatbay  
**Course:** Introduction to Web Technologies — Assignment 1  
**Project:** Kent Sandwich (Adolf Yanushkevich St 1, Astana — Transitioned from Coffee Boom)  
**Repository:** [https://github.com/bossmerej-ship-it/Coffee-Boom](https://github.com/bossmerej-ship-it/Coffee-Boom)

### Student Page Allocation:
* **Timur Naumov:** `colophon.html`, `about.html`, `feedback.html`
* **Merey Kuatbay:** `index.html`, `menu.html`, `order.html`

---

## 1. Universal Requirements (Present on Every Page)

| Requirement / Element | File | Exact Line Number | Author | Description / Usage |
| :--- | :--- | :---: | :--- | :--- |
| `<!DOCTYPE html>` | `colophon.html`<br>`about.html`<br>`feedback.html`<br>`index.html`<br>`menu.html`<br>`order.html` | Line 1<br>Line 1<br>Line 1<br>Line 1<br>Line 1<br>Line 1 | Timur Naumov &<br>Merey Kuatbay | Standard HTML5 document type declaration on all 6 pages |
| `<html lang="en">` | `colophon.html`<br>`about.html`<br>`feedback.html`<br>`index.html`<br>`menu.html`<br>`order.html` | Line 2<br>Line 2<br>Line 2<br>Line 2<br>Line 2<br>Line 2 | Timur Naumov &<br>Merey Kuatbay | Root element specifying English language |
| `<meta charset="UTF-8">` | `colophon.html`<br>`about.html`<br>`feedback.html`<br>`index.html`<br>`menu.html`<br>`order.html` | Line 4<br>Line 4<br>Line 4<br>Line 4<br>Line 4<br>Line 4 | Timur Naumov &<br>Merey Kuatbay | UTF-8 character encoding declaration |
| `<meta name="viewport">` | `colophon.html`<br>`about.html`<br>`feedback.html`<br>`index.html`<br>`menu.html`<br>`order.html` | Line 5<br>Line 5<br>Line 5<br>Line 5<br>Line 5<br>Line 5 | Timur Naumov &<br>Merey Kuatbay | Responsive mobile viewport configuration |
| `<meta name="description">` | `colophon.html`<br>`about.html`<br>`feedback.html`<br>`index.html`<br>`menu.html`<br>`order.html` | Line 6<br>Line 6<br>Line 6<br>Line 6<br>Line 6<br>Line 6 | Timur Naumov &<br>Merey Kuatbay | Document description meta tag |
| `<meta name="author">` | `colophon.html`<br>`about.html`<br>`feedback.html`<br>`index.html`<br>`menu.html`<br>`order.html` | Line 7<br>Line 7<br>Line 7<br>Line 7<br>Line 7<br>Line 7 | Timur Naumov &<br>Merey Kuatbay | Author attribution meta tag |
| Author HTML Comment | `colophon.html`<br>`about.html`<br>`feedback.html`<br>`index.html`<br>`menu.html`<br>`order.html` | Line 11<br>Line 11<br>Line 11<br>Line 11<br>Line 11<br>Line 11 | Timur Naumov &<br>Merey Kuatbay | HTML comment identifying the author of each page |
| Unique `<title>` | `colophon.html`<br>`about.html`<br>`feedback.html`<br>`index.html`<br>`menu.html`<br>`order.html` | Line 8<br>Line 8<br>Line 8<br>Line 8<br>Line 8<br>Line 8 | Timur Naumov &<br>Merey Kuatbay | Unique document title for browser tab |
| Exactly one `<h1>` | `colophon.html`<br>`about.html`<br>`feedback.html`<br>`index.html`<br>`menu.html`<br>`order.html` | Line 14<br>Line 14<br>Line 14<br>Line 14<br>Line 13<br>Line 13 | Timur Naumov &<br>Merey Kuatbay | Exactly one `<h1>` heading in header on each page |
| Correct heading hierarchy | `colophon.html`<br>`about.html`<br>`feedback.html`<br>`index.html`<br>`menu.html`<br>`order.html` | Lines 14, 30, 34<br>Lines 14, 32, 45, 60<br>Lines 14, 30, 41<br>Lines 14, 30, 43, 61<br>Lines 13, 29, 43, 126, 149<br>Lines 13, 29, 43, 138 | Timur Naumov &<br>Merey Kuatbay | `h1` &rarr; `h2` &rarr; `h3` without skipped levels |
| `<header>` | `colophon.html`<br>`about.html`<br>`feedback.html`<br>`index.html`<br>`menu.html`<br>`order.html` | Line 13<br>Line 13<br>Line 13<br>Line 13<br>Line 12<br>Line 12 | Timur Naumov &<br>Merey Kuatbay | Semantic header enclosing brand and navigation |
| `<nav>` | `colophon.html`<br>`about.html`<br>`feedback.html`<br>`index.html`<br>`menu.html`<br>`order.html` | Line 18<br>Line 15<br>Line 15<br>Line 15<br>Line 14<br>Line 14 | Timur Naumov &<br>Merey Kuatbay | Semantic nav with relative links to all 6 pages |
| `<main>` | `colophon.html`<br>`about.html`<br>`feedback.html`<br>`index.html`<br>`menu.html`<br>`order.html` | Line 29<br>Line 27<br>Line 27<br>Line 27<br>Line 26<br>Line 26 | Timur Naumov &<br>Merey Kuatbay | Main content wrapper on each page |
| `<footer>` | `colophon.html`<br>`about.html`<br>`feedback.html`<br>`index.html`<br>`menu.html`<br>`order.html` | Line 79<br>Line 139<br>Line 115<br>Line 99<br>Line 184<br>Line 143 | Timur Naumov &<br>Merey Kuatbay | Semantic footer with contacts and copyright entity |
| Explanatory Comments | `colophon.html`<br>`about.html`<br>`feedback.html`<br>`index.html`<br>`menu.html`<br>`order.html` | Lines 33, 50, 59, 63<br>Lines 30, 43, 125<br>Lines 28, 39, 44<br>Lines 12, 28, 41, 75<br>Lines 27, 42, 124<br>Lines 27, 39, 44, 40 | Timur Naumov &<br>Merey Kuatbay | Comments explaining *why* a semantic choice was made |

---

## 2. Structural & Semantic Elements

| Element | File | Exact Line Number | Author | Description / Context |
| :--- | :--- | :---: | :--- | :--- |
| `<section>` | `about.html`<br>`feedback.html`<br>`index.html`<br>`menu.html`<br>`order.html` | Lines 31, 85<br>Line 29<br>Lines 29, 60<br>Lines 28, 44, 125<br>Lines 28, 42, 137 | Timur Naumov &<br>Merey Kuatbay | Thematic grouping of branch, menu, and ordering content |
| `<article>` | `about.html`<br>`feedback.html`<br>`index.html` | Line 44<br>Line 40<br>Line 42 | Timur Naumov &<br>Merey Kuatbay | Independent articles: branch spaces, feedback guide, and grilling secret |
| `<aside>` | `about.html`<br>`index.html` | Line 120<br>Line 76 | Timur Naumov &<br>Merey Kuatbay | Barista quote (Timur) and location/hours quick-facts block (Merey) |
| `<figure>` | `about.html`<br>`index.html`<br>`menu.html`<br>`order.html` | Lines 37, 79, 115<br>Line 35<br>Line 32<br>Line 32 | Timur Naumov &<br>Merey Kuatbay | Image wrappers for sandwich grill, interior, and counter photos |
| `<figcaption>` | `about.html`<br>`index.html`<br>`menu.html`<br>`order.html` | Lines 39, 81<br>Line 37<br>Line 34<br>Line 34 | Timur Naumov &<br>Merey Kuatbay | Descriptive captions accompanying figures |

---

## 3. Data Tables

| Element | File | Exact Line Number | Author | Description / Context |
| :--- | :--- | :---: | :--- | :--- |
| `<table>` | `about.html`<br>`menu.html` | Line 89<br>Line 44 | Timur Naumov<br>Merey Kuatbay | Seating capacity table (Timur) and authentic sandwich price list (Merey) |
| `<caption>` | `about.html`<br>`menu.html` | Line 90<br>Line 45 | Timur Naumov<br>Merey Kuatbay | Accessible table title captions |
| `<thead>` | `about.html`<br>`menu.html` | Line 91<br>Line 46 | Timur Naumov<br>Merey Kuatbay | Header rows container |
| `<tbody>` | `about.html`<br>`menu.html` | Line 99<br>Line 54 | Timur Naumov<br>Merey Kuatbay | Data rows container |
| `<tfoot>` | `menu.html` | Line 114 | Merey Kuatbay | Table footer displaying student meal combo savings |
| `<th scope="col">` | `about.html`<br>`menu.html` | Lines 93, 94, 95, 96<br>Lines 48, 49, 50, 51 | Timur Naumov<br>Merey Kuatbay | Column header labels with scope |
| `<th scope="row">` | `about.html`<br>`menu.html` | Lines 101, 107<br>Lines 56, 77, 93, 116 | Timur Naumov<br>Merey Kuatbay | Row header labels and rowgroup scope categories |

---

## 4. Lists

| List Type | File | Exact Line Number | Author | Description / Context |
| :--- | :--- | :---: | :--- | :--- |
| Nested List | `about.html`<br>`menu.html` | Lines 50–59<br>Lines 129–144 | Timur Naumov<br>Merey Kuatbay | Nested `<ul>` of zones (Timur) and 3-step meal customization hierarchy (Merey) |
| Ordered List with Attribute | `about.html`<br>`menu.html` | Line 65<br>Line 150 | Timur Naumov<br>Merey Kuatbay | `<ol type="1" start="1">` service steps (Timur) and preparation protocol (Merey) |
| Definition List (`<dl>`) | `about.html`<br>`index.html` | Line 72<br>Line 47 | Timur Naumov<br>Merey Kuatbay | Glossary of branch zones (Timur) and core culinary craftsmanship pillars (Merey) |
| Definition Term (`<dt>`) | `about.html`<br>`index.html` | Lines 73, 75<br>Lines 48, 50, 52 | Timur Naumov<br>Merey Kuatbay | Terms: Bread, Signature Sauce, Halal Meats |
| Definition Description (`<dd>`) | `about.html`<br>`index.html` | Lines 74, 76<br>Lines 49, 51, 53 | Timur Naumov<br>Merey Kuatbay | Detailed descriptions corresponding to definition terms |

---

## 5. Hyperlinks & Media

| Element / Link Type | File | Exact Line Number | Author | Description / Context |
| :--- | :--- | :---: | :--- | :--- |
| External Link (`target`, `rel`) | `about.html`<br>`index.html` | Line 131<br>Line 86 | Timur Naumov<br>Merey Kuatbay | `<a href="https://2gis.kz/astana/firm/70000001091599351" target="_blank" rel="noopener noreferrer">` |
| `mailto:` Link | `about.html`<br>`index.html` | Line 132<br>Line 91 | Timur Naumov<br>Merey Kuatbay | `<a href="mailto:contact@kentsandwich.kz">` |
| `tel:` Link | `about.html`<br>`index.html`<br>`colophon.html` | Line 140<br>Line 90<br>Line 80 | Timur Naumov<br>Merey Kuatbay<br>Timur Naumov | `<a href="tel:+77015551234">` direct order phone line |
| Same-Page Anchor Link | `about.html`<br>`index.html` | Line 28<br>Line 92 | Timur Naumov<br>Merey Kuatbay | `<a href="#student-reviews">Read verified student testimonials &uarr;</a>` |
| Three images with alt | `about.html`<br>`index.html`<br>`menu.html`<br>`order.html` | Lines 38, 80, 116<br>Line 36<br>Line 33<br>Line 33 | Timur Naumov &<br>Merey Kuatbay | `images/kent-sandwich.jpg`, `images/kent-grill.jpg`, `images/kent-counter.jpg` |

---

## 6. Typography, Quotes & Phrase Elements

| Element | File | Exact Line Number | Author | Description / Context |
| :--- | :--- | :---: | :--- | :--- |
| `<strong>` | `about.html`<br>`index.html`<br>`menu.html`<br>`order.html` | Lines 50, 56<br>Lines 31, 80<br>Lines 130, 137<br>Lines 88, 95 | Timur Naumov &<br>Merey Kuatbay | Strong emphasis on brand name, key headings, and options |
| `<em>` | `about.html`<br>`index.html` | Line 127<br>Line 31 | Timur Naumov<br>Merey Kuatbay | Emphasis on address `Adolf Yanushkevich Street, 1` |
| `<b>` | `about.html`<br>`index.html` | Lines 73, 75<br>Lines 48, 50, 52 | Timur Naumov<br>Merey Kuatbay | Bold labels for definition terms |
| `<i>` | `about.html`<br>`index.html` | Line 34<br>Line 44 | Timur Naumov<br>Merey Kuatbay | Foreign culinary term *panini* |
| `<mark>` | `about.html`<br>`index.html` | Line 127<br>Line 70 | Timur Naumov<br>Merey Kuatbay | Highlighted phrase *consistency in toast temperature* |
| `<small>` | `about.html`<br>`index.html`<br>`menu.html` | Line 131<br>Line 95<br>Line 121 | Timur Naumov<br>Merey Kuatbay | Fine-print footnotes regarding student ID discounts & water filtration |
| `<sub>` | `menu.html` | Line 121 | Merey Kuatbay | Subscript chemical water formula: `H<sub>2</sub>O` |
| `<sup>` | `about.html`<br>`index.html`<br>`menu.html` | Line 67<br>Line 33<br>Lines 34, 153 | Timur Naumov<br>Merey Kuatbay | Grilling temperatures: `220<sup>&deg;</sup>C` and `75<sup>&deg;</sup>C` |
| `<abbr title="...">` | `about.html`<br>`index.html`<br>`order.html` | Lines 34, 40<br>Lines 31, 68, 82<br>Line 30 | Timur Naumov<br>Merey Kuatbay | `<abbr title="L.N. Gumilyov Eurasian National University">ENU</abbr>`, `<abbr title="Information Systems">IS</abbr>` |
| `<blockquote>` | `about.html`<br>`index.html` | Line 123<br>Line 65 | Timur Naumov<br>Merey Kuatbay | Real customer quote from 2GIS collected from student Daniyar Akhmetov |
| Inline `<q>` | `about.html`<br>`index.html` | Line 127<br>Line 56 | Timur Naumov<br>Merey Kuatbay | Quotation for `<q>Mini Sandwich</q>` |
| `<cite>` | `about.html`<br>`index.html` | Line 126<br>Line 68 | Timur Naumov<br>Merey Kuatbay | Speaker citation: *Daniyar Akhmetov* |
| `<hr>` | `about.html`<br>`index.html` | Line 137<br>Line 73 | Timur Naumov<br>Merey Kuatbay | Thematic break divider |
| `<br>` | `order.html` | Lines 51, 55, 59, 68, 84, 91, 98, 100, 102, 104, 112, 116, 120 | Merey Kuatbay | Form control line breaks |
| `<code>` | `colophon.html`<br>`index.html`<br>`menu.html` | Line 52<br>Line 56<br>Line 158 | Timur Naumov<br>Merey Kuatbay | Monetary code `640 &#8376;` and register override code `KENT-CLEAR-2026` |
| `<pre>` | `colophon.html`<br>`menu.html` | Line 52<br>Line 163 | Timur Naumov<br>Merey Kuatbay | Preformatted digital receipt layout |
| `<kbd>` | `colophon.html`<br>`menu.html` | Line 47<br>Line 158 | Timur Naumov<br>Merey Kuatbay | Keyboard input: `<kbd>Esc</kbd>` |
| `<samp>` | `colophon.html`<br>`menu.html` | Line 61<br>Line 157 | Timur Naumov<br>Merey Kuatbay | Terminal grill status: `<samp>Grill Station #1 Status: ONLINE (220&deg;C)</samp>` |
| HTML Entities | `about.html`<br>`index.html`<br>`menu.html` | Multiple<br>Lines 33, 46, 56, 66, 100<br>Lines 34, 58, 118, 185 | Timur Naumov &<br>Merey Kuatbay | `&copy;`, `&mdash;`, `&quot;`, `&amp;`, `&#8376;`, `&deg;`, `&trade;`, `&uarr;`, `&rarr;` |

---

## 7. `<div>` and `<span>` Elements with Justifications

| Element | File | Exact Line Number | Author | Rationale / Why No Semantic Tag Fit |
| :--- | :--- | :---: | :--- | :--- |
| `<div>` | `index.html` | Line 88 | Merey Kuatbay | Acts strictly as a neutral inline-block cluster wrapper for grouping action contact links (`tel`, `mailto`, intra-page jump); no sectioning tag applies. |
| `<div>` | `menu.html` | Line 160 | Merey Kuatbay | Applied strictly as a presentation container around preformatted digital receipt output and terminal sample; no semantic tag applies to preformatted receipt wrappers. |
| `<div>` | `order.html` | Line 129 | Merey Kuatbay | Used solely as a neutral button cluster container for aligning submit and reset buttons; no semantic container fits a pair of interactive form actions. |
| `<span>` | `index.html` | Line 56 | Merey Kuatbay | Used solely for isolated monetary badge styling (`390 &#8376;`); no semantic phrasing element fits a neutral price badge. |
| `<span>` | `menu.html` | Line 117 | Merey Kuatbay | Used solely to isolate the promotional savings badge (`Save 100 &#8376;`) within table footer flow; no phrasing element applies. |

---

## 8. Interactive Form Elements

| Element / Attribute | File | Exact Line Number | Author | Description / Context |
| :--- | :--- | :---: | :--- | :--- |
| `<form>` (`method`, `action`) | `feedback.html`<br>`order.html` | Line 43<br>Line 45 | Timur Naumov<br>Merey Kuatbay | Feedback form (Timur) and express takeaway pre-order form (Merey) |
| Form Backend Notice Comment | `feedback.html`<br>`order.html` | Line 44<br>Line 44 | Timur Naumov<br>Merey Kuatbay | Mandatory comment stating no server backend exists yet |
| `<fieldset>` | `feedback.html`<br>`order.html` | Lines 46, 63<br>Lines 48, 65, 109 | Timur Naumov<br>Merey Kuatbay | Logical group containers: Contact, Sandwich Selection, Scheduling |
| `<legend>` | `feedback.html`<br>`order.html` | Lines 47, 64<br>Lines 49, 66, 110 | Timur Naumov<br>Merey Kuatbay | Captions for each fieldset |
| `<label>` bound to field by `id` | `feedback.html`<br>`order.html` | Lines 50, 54, 58, 66, 70, 74, 85, 88, 91, 95, 101<br>Lines 51, 55, 59, 68, 85, 91, 93, 98, 100, 102, 104, 112, 116, 120, 125 | Timur Naumov &<br>Merey Kuatbay | Every single field strictly bound via explicit `for` and `id` |
| `type="text"` | `feedback.html`<br>`order.html` | Line 51<br>Line 52 | Timur Naumov<br>Merey Kuatbay | Customer full name field |
| `type="email"` | `feedback.html`<br>`order.html` | Line 55<br>Line 60 | Timur Naumov<br>Merey Kuatbay | Guest email address field |
| `type="tel"` | `feedback.html`<br>`order.html` | Line 59<br>Line 56 | Timur Naumov<br>Merey Kuatbay | Kazakhstan phone number input |
| `type="date"` | `feedback.html`<br>`order.html` | Line 67<br>Line 113 | Timur Naumov<br>Merey Kuatbay | Pickup date selector |
| `type="time"` | `order.html` | Line 117 | Merey Kuatbay | Pickup time selector (09:30 to 21:30) |
| `type="number"` | `feedback.html`<br>`order.html` | Line 71<br>Line 86 | Timur Naumov<br>Merey Kuatbay | Numeric portion quantity input (min="1" max="20") |
| `type="radio"` (Radio Group) | `feedback.html`<br>`order.html` | Lines 84, 87, 90<br>Lines 90, 92 | Timur Naumov<br>Merey Kuatbay | Dining preference selection (`name="dining_mode"`: Takeaway vs Dine-in) |
| `type="checkbox"` | `feedback.html`<br>`order.html` | Line 100<br>Lines 97, 99, 101, 103, 124 | Timur Naumov<br>Merey Kuatbay | Add-on checkboxes and pickup policy confirmation checkbox |
| `<select>` and `<option>` | `feedback.html`<br>`order.html` | Lines 75–79<br>Lines 69–82 | Timur Naumov<br>Merey Kuatbay | Sandwich & combo dropdown with `<optgroup>` |
| `<textarea>` | `feedback.html`<br>`order.html` | Line 96<br>Line 121 | Timur Naumov<br>Merey Kuatbay | Multiline kitchen notes / allergy alerts |
| `required` attribute | Multiple<br>`order.html` | Multiple<br>Lines 52, 56, 69, 86, 113, 117, 124 | Timur Naumov &<br>Merey Kuatbay | Mandatory field constraints |
| `placeholder` attribute | Multiple<br>`order.html` | Multiple<br>Lines 52, 56, 60, 121 | Timur Naumov &<br>Merey Kuatbay | Input guidance hints |
| `<button type="submit">` | `feedback.html`<br>`order.html` | Line 105<br>Line 131 | Timur Naumov<br>Merey Kuatbay | Form submission trigger button |
| `<button type="reset">` | `feedback.html`<br>`order.html` | Line 106<br>Line 132 | Timur Naumov<br>Merey Kuatbay | Form reset / clear button |

---

## 9. Justification for Unused Tags (From Assignment 1 Tag List)

| Tag / Feature | Reason for Omission from Website |
| :--- | :--- |
| `<wbr>` | Modern CSS word-break properties and standard responsive container widths handle hyphenation dynamically without requiring explicit hard-coded discretionary break opportunities in food names. |
| `<bdi>` / `<bdo>` | The website's entire content is presented in English and transliterated Kazakh geographical names written in standard left-to-right (LTR) direction; no right-to-left (RTL) scripts (e.g., Arabic or Hebrew) are used, making bidirectional isolation tags redundant. |
| `<meter>` | All nutritional facts and satisfaction metrics are expressed via direct accessible data tables and numerical badges; `<meter>` implies a scalar measurement within a known range which did not suit our qualitative culinary descriptions. |
| `<progress>` | Order preparation is handled in person and through express takeaway ticketing where real-time WebSocket communication is not yet implemented (no backend in Assignment 1), so a dynamic completion bar would mislead users. |
| `<details>` / `<summary>` | For accessibility and ease of browsing on student mobile devices, all sandwich categories, allergen notices, and pricing options are immediately visible on the page rather than hidden behind expandable disclosure widgets. |
