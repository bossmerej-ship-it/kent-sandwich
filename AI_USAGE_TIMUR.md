# AI Assistance & Usage Log

**Developer:** Timur
**AI Model Used:** Claude (Anthropic)
**Assignment:** Introduction to Web Technologies — Assignment 2 (CSS: selectors & priority, colors, fonts, spacing, alignment, Flexbox, Grid, positioning)
**Academic Honesty Statement:** Per the course AI policy, Claude was used only to explain CSS concepts and clarify how specific properties/mechanisms work. Claude was not used to write stylesheets, the checklist, the specificity report, or the written part. All code, comments, and analysis were authored independently.

## Log of Interactions

| Date | Student Question | Claude's Explanation | How It Was Used |
|---|---|---|---|
| 2026-09-14 | How is CSS selector specificity calculated (id vs class vs type)? | Explained the specificity formula (id, class/attribute/pseudo-class, type/pseudo-element tiers) and how ties are resolved by source order. | Used to manually calculate specificity values for Task A (Specificity report), without any ready-made examples from the AI. |
| 2026-09-14 | What's the practical difference between Flexbox and Grid — when should each be used? | Explained that Flexbox suits one-dimensional rows (nav bars, card rows), while Grid suits two-dimensional layouts requiring precise column/row control. | Helped decide where to use flex (service cards row) versus grid (menu section) on the Coffee Boom pages. |
| 2026-09-15 | What is margin collapse and when does it happen? | Explained vertical margin collapsing between adjacent block elements and ways to prevent it (padding, border, overflow). | Used to write the required comment in base.css explaining the margin-collapse case encountered. |
| 2026-09-15 | What's the difference between static, relative, absolute, and fixed positioning? | Broke down how each value affects the normal document flow and what offset properties are calculated relative to. | Used to write the own explanatory comments (badge positioned absolute inside a relative container). |
| 2026-09-16 | What are the different ways to center an element in CSS? | Listed margin: auto, Flexbox (justify-content/align-items), Grid (place-items), and absolute positioning with transform, noting when each fits best. | Three different centering techniques were chosen and labeled in the stylesheet based on this explanation. |
| 2026-09-16 | What happens if position: relative is removed from the parent of an absolutely positioned element? | Explained that the absolutely positioned element would then be positioned relative to the next positioned ancestor up the tree, or the viewport if none exists. | Used as the basis for Task B's written explanation, phrased in the student's own words and tied to the actual project files. |
