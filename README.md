# Kent Sandwich Astana — Web Development Coursework

A six-page, semantic HTML5 and CSS website for **Kent Sandwich**, located at Adolfa Yanushkevicha Street 1 in Astana. The project continues the same repository and page structure from Assignment 1, then applies the selector, cascade, layout and positioning requirements from Assignment 2.

## Authors and page ownership

- **Merey Kuatbay:** `index.html`, `menu.html`, `order.html`, `css/merey.css`
- **Timur Naumov:** `about.html`, `feedback.html`, `colophon.html`, `css/timur.css`
- **Shared:** `css/base.css`

## Pages

| File | Purpose |
| --- | --- |
| `index.html` | Brand introduction, key facts and visit information |
| `menu.html` | Eight-item menu, prices, cards and semantic price table |
| `about.html` | Service format, floated story image, interior gallery and branch details |
| `order.html` | Sandwich selection and pickup details form |
| `feedback.html` | Visit feedback form with rating controls |
| `colophon.html` | Technical decisions, sources and image credits |

## CSS structure

Every page loads `base.css` first and its author stylesheet second. `base.css` owns the five-colour palette, typography, header, Flexbox navigation, shared form/table treatments, footer and fixed 2GIS source tab. The personal stylesheets own page-specific Grid, Flexbox, positioning and float demonstrations.

The project contains exactly one internal `<style>` block and one inline `style` attribute, both in `index.html`, solely to demonstrate cascade priority. There is no `!important`, JavaScript, framework, library, template or media query.

## Data and photography

Address, opening hours and menu prices were checked against the [Kent Sandwich 2GIS listing](https://2gis.kz/astana/firm/70000001114376342). The six gallery photographs were acquired from that listing for educational coursework. The local `images/kent-logo.jpg` file comes from the supplied [@kentsandwich.kz](https://www.instagram.com/kentsandwich.kz/) profile image.

The order and feedback forms use native browser validation. Short notes beside the buttons explain that the forms do not transmit real orders or feedback yet.

## Coursework evidence

- `REPORT.md` remains the existing written coursework report and should be revised by the students before submission.
- `AI_USAGE_TIMUR.md` records the actual AI assistance used during the redesign.

Run locally from the project directory with a simple static server, for example:

```text
python3 -m http.server 8765
```

Then open `http://127.0.0.1:8765/index.html`.
