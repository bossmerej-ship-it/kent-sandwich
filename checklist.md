# Assignment 1 HTML Checklist — Kent Sandwich

**Team:** Timur Naumov and Merey Kuatbay

**Project:** Kent Sandwich, Astana

**Pages:** `index.html`, `menu.html`, `order.html`, `about.html`, `feedback.html`, `colophon.html`

## Universal document requirements

| Requirement | Evidence | Author |
| --- | --- | --- |
| HTML5 doctype and `lang="en"` | Start of every HTML file | Team |
| UTF-8, viewport, description, author | `<head>` of every HTML file | Team |
| Unique title | `<title>` in every HTML file | Team |
| Shared semantic header and navigation | `.site-header` and `.site-nav` on every page | Team |
| One `main` landmark | `#main-content` on every page | Team |
| Exactly one visible `h1` | Page introduction on every page | Team |
| Shared semantic footer | `.site-footer` on every page | Team |
| Relative links across all six pages | Main navigation on each page | Team |
| Current-page state | `aria-current="page"` in each page navigation | Team |

## Semantic structures and media

| Requirement | Evidence | Author |
| --- | --- | --- |
| `section` and `article` | Home facts, about story and colophon audit blocks | Team |
| `aside` | Order summary, visit note and file guide | Team |
| Figures and captions | Home, menu and place photographs | Team |
| Images with meaningful alt text | Every content image; the decorative logo image has empty alt text | Team |
| Internal anchors | `#story`, `#space`, `#details` and `#menu-table` | Timur / Merey |
| External links with safe new-tab attributes | 2GIS and Instagram links | Team |
| Ordered and unordered lists | Menu instructions, about values and colophon principles | Team |
| Definition list | Pickup summary in `order.html` | Merey |
| Abbreviations | HTML and CSS in `colophon.html` | Timur |
| Quote and citation | Collected 2GIS review in `feedback.html` | Timur |

## Required tags, listed separately

| Required tag or construction | Evidence |
| --- | --- |
| `<h1>` | One page heading in every HTML file |
| `<h2>` and `<h3>` | Section and card headings throughout the six pages |
| `<p>` | Paragraphs throughout the six pages |
| `<strong>` | Prices in `order.html` and labels in `about.html` and `colophon.html` |
| `<em>` | “Hot pressed sandwiches” in `index.html` |
| `<b>` | The HTML keyword in `colophon.html` |
| `<i>` | The Kazakh word “дәмді” in `about.html` |
| `<sup>` | Menu source note in `menu.html` |
| `<br>` | Brand name, address and hours on several pages |
| `<hr>` | Divider before the file guide in `colophon.html` |
| `<blockquote>` | Collected visitor review in `feedback.html` |
| `<q>` | Exact review text in `feedback.html` |
| `<cite>` | Reviewer name, date and source in `feedback.html` |
| `<abbr>` | HTML and CSS abbreviations in `colophon.html` |
| `<code>` | Stylesheet names and file guide in `colophon.html` |
| `<kbd>` | Keyboard instruction in `colophon.html` |
| `<samp>` | Browser validation message in `colophon.html` |
| `<ul>` | Main navigation, values and nested menu choices |
| `<ol>` with an attribute | `<ol type="1">` in `menu.html` and `<ol start="1">` in `colophon.html` |
| Nested list | `<ul>` inside the ordered “How to choose” list in `menu.html` |
| `<dl>`, `<dt>` and `<dd>` | Pickup summary in `order.html` |
| `<a href="mailto:...">` | Project email link in `colophon.html` |
| `<a href="tel:...">` | Official shop telephone in `about.html` |
| Four different HTML entities | `&amp;`, `&copy;`, `&mdash;` and `&rarr;` |
| `<header>`, `<nav>`, `<main>` and `<footer>` | Shared page structure in every HTML file |
| `<section>`, `<article>` and `<aside>` | Content sections across all page groups |
| `<figure>`, `<img>` and `<figcaption>` | Food and interior photography |
| `<table>`, `<caption>`, `<thead>`, `<tbody>`, `<tr>`, `<th>` and `<td>` | Price table in `menu.html` |
| `<form>`, `<fieldset>`, `<legend>` and `<label>` | Forms in `order.html` and `feedback.html` |
| `<input>` types `text`, `email`, `tel`, `date`, `time`, `number`, `radio`, `checkbox` | Both forms together cover every listed input type |
| `<select>` and `<option>` | Contact and menu choices in both forms |
| `<textarea>` | Notes and written feedback fields |
| Submit and reset buttons | Both forms contain `type="submit"` and `type="reset"` |
| Explicit `for` and `id` pairs | Text, radio and checkbox controls in both forms |
| Server-status comments | An HTML comment inside each form states that no server is connected |
| Explained `<div>` and `<span>` | A nearby HTML comment explains every non-semantic grouping |

## Tables and forms

| Requirement | Evidence | Author |
| --- | --- | --- |
| Semantic table with caption, head, body and scoped headers | Price table in `menu.html` | Merey |
| Order form with fieldsets, legends and varied input types | `.order-form` in `order.html` | Merey |
| Feedback form with labels, radio group, select and textarea | `.feedback-form` in `feedback.html` | Timur |
| Native validation attributes | Required, length, range and pattern attributes in both forms | Merey / Timur |
| Honest no-backend boundary | Visible notes and HTML comments inside both forms | Merey / Timur |

## IDs and comments

Every page uses unique IDs for anchors, label bindings or `aria-labelledby` relationships. Comments beside the destination IDs explain why each one is unique. Comments beside every `div` and `span` explain why a semantic element does not fit that small grouping.
