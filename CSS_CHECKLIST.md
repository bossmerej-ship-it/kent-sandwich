# Assignment 2 CSS Checklist — Kent Sandwich

Line numbers below match the current files. Re-run the checklist after any CSS edit because inserted lines will change the references.

## Stylesheet and cascade structure

| Requirement | File and line | Author / explanation |
| --- | --- | --- |
| Shared stylesheet loaded first | Every page, lines 9–10 | Team: `base.css` precedes the personal file |
| Personal stylesheets | `css/merey.css:1`, `css/timur.css:1` | Merey / Timur |
| Exactly one internal style block | `index.html:11–14` | Its comment names the external `.cascade-demo` declaration that it overrides |
| Exactly one inline style | `index.html:89–90` | Its comment names the external `mark` background that it overrides |
| Deliberate specificity conflict and fix | `css/merey.css:124` versus `index.html:13` | `.cascade-demo` is overridden by the later internal rule without `!important` |
| `!important` count | None | The optional allowance was not needed |

## Required selectors

| Selector type | File and line | What it matches |
| --- | --- | --- |
| Type | `css/base.css:30` | Every `body` |
| Class | `css/base.css:160` | Shared `.site-header` |
| ID | `css/base.css:260` | Unique `#main-content` landmark |
| Descendant | `css/base.css:218` | Links inside `.site-nav` |
| Child `>` | `css/base.css:207` | Direct `ul` child of `.site-nav` |
| Adjacent sibling `+` | `css/base.css:89` | Consecutive paragraphs |
| Grouping | `css/base.css:52–55` | Headings and paragraphs sharing margin reset |
| Attribute | `css/base.css:113` | External HTTPS links |
| Universal | `css/base.css:22` | All elements for `box-sizing` |
| `:hover` | `css/base.css:99` | Link hover feedback |
| `:focus` | `css/base.css:103–107` | Keyboard focus on links and controls |
| `:nth-child` | `css/base.css:411` | Alternating table rows |
| `::before` | `css/base.css:298` | Rule before every eyebrow label |

## Colour, fonts, box model and alignment

| Requirement | File and line | Evidence |
| --- | --- | --- |
| Five-colour palette with reasons | `css/base.css:1–8` | Four hex values and one named colour |
| Two full font stacks | `css/base.css:16–18` | Display, body and UI stacks |
| Deliberate type metrics | `css/base.css:34–38` | Family, size, weight, line-height, tracking |
| `box-sizing` | `css/base.css:22–24` | Border-box on all elements |
| Margin, padding and border | `css/base.css:30–31`, `:309–310` | Purposeful spacing and button border |
| Margin-collapse explanation | `css/base.css:539` | Section padding keeps child margins inside |
| Text alignment | `css/base.css:248`, `:315` | Header note and buttons |
| No spacer markup | All files | Layout uses Grid/Flexbox, not `&nbsp;` or empty elements |

## Flexbox

| Requirement | File and line | Evidence |
| --- | --- | --- |
| Navigation flex row | `css/base.css:207–215` | `display`, `align-items`, `justify-content`, `flex-direction`, `gap` |
| Merey page flex container | `css/merey.css:59–64` | Quick facts wrap and grow |
| Merey form flex container | `css/merey.css:256–260` | Choice cards wrap |
| Timur page flex container | `css/timur.css:65–70` | Value cards wrap and grow |
| Timur feedback flex container | `css/timur.css:210–215` | Rating controls wrap |

## Grid

| Requirement | File and line | Evidence |
| --- | --- | --- |
| Shared twelve-column Grid | `css/base.css:264–267` | `repeat()`, `minmax()`, `fr`, `gap` |
| Merey menu Grid | `css/merey.css:147–152` | A CSS comment explains why two-axis card alignment suits Grid better than Flexbox; the featured card spans at `:166–169` |
| Merey order Grid | `css/merey.css:244–249` | Form and summary columns |
| Timur gallery Grid | `css/timur.css:95–102` | Two flexible columns; main image spans all columns |
| Timur audit Grid | `css/timur.css:255–272` | Four columns; header spans all columns |

Grid suits these sections because cards and media must align in both rows and columns; Flexbox is used where items primarily flow along one axis and may wrap.

## Positioning, float and clear

| Technique | File and line | Purpose |
| --- | --- | --- |
| `static` | `css/base.css:252–258` | Main content stays in normal flow; comment explains why |
| `relative` | `css/merey.css:157–164` | Menu card is the containing block for its price and badge |
| `absolute` | `css/merey.css:187–192` | Price stays at the bottom of its menu card |
| `fixed` | `css/base.css:522–537` | 2GIS source tab stays on screen |
| `float` | `css/timur.css:49–56` | Story image sits inside its own paragraph |
| `clear` | `css/timur.css:58–63` | Pseudo-element ends float; comment states the failure avoided |

## Three centring techniques

| Technique | File and line | Element |
| --- | --- | --- |
| `margin: 0 auto` | `css/base.css:253–258` | Main page column |
| Flex centring | `css/base.css:183–194` | Round logo in the brand link |
| Grid centring | `css/timur.css:227–234` | Feedback rating labels with `place-items` |
| Absolute + transform (extra) | `css/merey.css:194–207` | Featured menu badge |

## Forbidden-technique audit

- No Bootstrap, Tailwind, Bulma, library or copied stylesheet.
- No JavaScript.
- No `!important`.
- No media query; the assignment requests a normal desktop design.
- No layout-only wrapper was added; existing semantic elements and content groupings own the layout.
