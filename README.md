# Kent Sandwich Astana (Yanushkevich 1) — Web Technologies Assignment

A multi-page, pure semantic HTML5 website developed as a coursework assignment for **Introduction to Web Technologies (Assignment 1)**. The website serves as the missing web portal for **Kent Sandwich**, an authentic local sandwich and street food shop located at **Adolf Yanushkevich Street, 1, Astana** (directly across from the L.N. Gumilyov Eurasian National University campus).

> **Note on Theme Transition:** The project was transitioned from Coffee Boom to Kent Sandwich to strictly comply with course guidelines requiring an independent, physically existing local establishment without an existing official website.

---

## 👥 Project Authors & Division of Work

This project is built collaboratively by a two-student team:

* **Merey Kuatbay**
  * `index.html` — Homepage: street-food heritage, grilling philosophy at 220°C, definition list, authentic 2GIS review, location aside, and contacts.
  * `menu.html` — Authentic price list: complete semantic data table with `th[scope]`, row groups, customization hierarchy, receipt sample (`pre`, `code`, `kbd`, `samp`), and campus combo discounts.
  * `order.html` — Online pre-order workflow: accessible semantic form with multiple fieldsets, `text`, `tel`, `email`, `number`, `date`, `time`, radio buttons, checkboxes, `<select>` with `<optgroup>`, `textarea`, required constraints, submit & reset controls, and WCAG label bindings.

* **Timur Naumov**
  * `about.html` — In-depth profile of the establishment branch, seating capacity, and hall specifications.
  * `feedback.html` — Guest experience review page with full feedback questionnaire form.
  * `colophon.html` — Technical report, validator outcomes, accessibility self-audit, and asset licensing.

---

## 🛠 Project Structure & File Hierarchy

```text
Coffee-Boom/
├── images/
│   ├── kent-sandwich.jpg      # Fresh pressed signature sandwich
│   ├── kent-grill.jpg         # Dual contact press grill station
│   ├── kent-counter.jpg       # Express takeaway pickup counter
│   ├── coffee-shop.jpg        # Legacy branch asset
│   ├── barista-counter.jpg    # Legacy branch asset
│   └── interior.jpg           # Legacy branch asset
├── index.html                 # Main landing page (Kent Sandwich)
├── about.html                 # Branch details and seating table
├── menu.html                  # Product catalog and authentic pricing (Kent Sandwich)
├── order.html                 # Pre-order form (Kent Sandwich)
├── feedback.html              # Customer feedback and rating form
├── colophon.html              # Technical audit and project colophon
├── checklist.md               # Comprehensive HTML tag checklist with line numbers
├── AI_USAGE_MEREY.md          # Transparent AI assistance log for Merey Kuatbay
├── AI_USAGE_TIMUR.md          # AI assistance log for Timur Naumov
└── README.md                  # Project overview and Git documentation
```

---

## ✅ Course Standard Compliance Highlights
- **100% Valid HTML5**: Zero presentation attributes, zero `<style>`, zero inline `style=""`, zero JavaScript.
- **Strict Semantic Skeleton**: Exactly one `<h1>` per page, hierarchically nested `<h2>` / `<h3>`, semantic `header`, `nav`, `main`, and `footer`.
- **Full Form Input Coverage**: `text`, `email`, `tel`, `number`, `date`, `time`, radio group, checkboxes, `select`, `textarea`, `required`, `placeholder`, `submit`, and `reset`.
- **Accessible Tables**: `caption`, `thead`, `tbody`, `tfoot`, `<th scope="col">`, `<th scope="row">`, and `<th scope="rowgroup">`.
