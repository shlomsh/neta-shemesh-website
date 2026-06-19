# Visual QA Audit — Gap Analysis (Ours vs Canva Template)

**Date**: June 19, 2026
**Environment**: 
- Ours (Rebuild): `http://localhost:3000` (RTL, Hebrew, cream background)
- Template (Ground Truth): `http://localhost:8899` (LTR, English lorem, dark background)
**Tested Widths**: 1280px (Reference), 768px (Tablet), 375px (Mobile)

*Note: Text content, LTR vs RTL orientation, and English vs Hebrew differences are intentional and ignored. Focus is strictly on spatial layout, proportional scaling, type scale, and visual fidelity.*

---

## 1. Hero
| Section | Width(s) | Issue Description (Ours vs Template) | Measurements / Notes | Severity | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Hero | 1280 | **Avatar crop/mask mismatch:** The decorative circular avatar background bleeds slightly compared to the template's strict mask. | Template radius: `50%`, ours lacks `overflow-hidden` on parent container. | P2 | FIXED-pending-visual-verify |
| Hero | 375 | **Left-edge typography clipping:** The main header text breaks out of the viewport on the left edge. | Appears to be the `rem` scaling inflation (`--rfso: 1.1` issue) pushing text bounds ~10% wider. | P1 | FIXED-pending-visual-verify |

## 2. About
| Section | Width(s) | Issue Description (Ours vs Template) | Measurements / Notes | Severity | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| About | 1280 | **Hardcoded block width:** The text paragraph block doesn't match the template proportion exactly; it looks narrower. | Ours is pinned to `w-[450px]` (legacy Canva px), Template uses a flexible fluid ratio (~`40%` container width). | P2 | OPEN |
| About | 768 | **Background SVG stacking:** The organic background blob overlaps the text layer slightly. | Z-index issue: SVG needs `z-0 pointer-events-none`, text needs `z-10`. | P2 | OPEN |

## 3. Expertise
| Section | Width(s) | Issue Description (Ours vs Template) | Measurements / Notes | Severity | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Expertise | 1280 | **Card background color ambiguity:** The template uses a dark card background with light text, while ours uses a cream background with dark text. | *Note for Team Lead: Is this an intentional redesign decision for the Hebrew version?* | P2 | OPEN |
| Expertise | 375 | **Missing animation stagger gaps:** The 4 cards load simultaneously on mobile without the waterfall effect present in the Canva build. | `ScrollReveal` index stagger missing. | P3 | OPEN |
| Expertise | 1280/768/375 | **"מרחב בטוח לקשר שלכם" header card broken:** The dark background blob/pill overlay is collapsed, severely misaligned, or missing entirely behind the text. | The `onDark={true}` prop makes the text white, which causes it to become invisible or low-contrast against the underlying cream body background since its own container block (`#d1eV7SLN4TcFxQyE` / `#quTDyco8dtY8jpt9`) has collapsed out of the grid flow. | P1 | FIXED-pending-visual-verify |

## 4. Services (איך זה עובד? + סיפורי הצלחה) `[rebuild-in-flight]`
| Section | Width(s) | Issue Description (Ours vs Template) | Measurements / Notes | Severity | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Services | 1280 | **Massive visual inflation (~25% larger):** The entire section appears blown up in proportion compared to the template. | `py-32` and `gap-6` are being scaled up by the legacy `html` vw-engine because `styles.css` is still active. | P1 | FIXED-pending-visual-verify |
| Services | 375 | **Card grid reflow squish:** Cards do not reflow cleanly into 1-up, squishing content. | Needs clamp/flex-wrap tuning. | P2 | OPEN |

## 5. Testimonials
| Section | Width(s) | Issue Description (Ours vs Template) | Measurements / Notes | Severity | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Testimonials | 1280 | **Structure fragmentation:** Section still exists as 4 raw DOM blobs. Positioning is fragile and relies on absolute `top/left` values. | Legacy `dangerouslySetInnerHTML` artifact. Needs Phase 1 rebuild. | P1 | FIXED |
| Testimonials | 375 | **Typography weight failure:** Quotes appear extremely thin and don't match the Canva font weight. | `font-synthesis: none` is blocking `font-bold`. Requires true Stanga bold webfont. | P2 | FIXED-pending-visual-verify |

## 6. Contact
| Section | Width(s) | Issue Description (Ours vs Template) | Measurements / Notes | Severity | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Contact | 1280 | **Form field alignment & spacing:** The input fields and CTA button have uneven spacing compared to the template's strict vertical rhythm. | Template gap is `24px`; ours is using `mt-[170px]` legacy gaps. | P2 | FIXED-pending-visual-verify |

## 7. Footer `[rebuild-in-flight]`
| Section | Width(s) | Issue Description (Ours vs Template) | Measurements / Notes | Severity | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Footer | 1280 | **Layout collapse on re-render:** Footer elements shift drastically due to inline `gridArea` coupling. | Relies on `SectionBand` constraints. | P1 | FIXED-pending-visual-verify |
| Footer | 375 | **Link touch targets too small:** Footer links are tightly clustered, violating mobile tap target heuristics. | Height `< 48px`. | P3 | OPEN |

---

### Notes / Open Questions for the Team Lead
1. **Color Palette Alignment**: As noted in Expertise, the Canva template relies heavily on a dark aesthetic, but our current iteration defaults to cream/light in several areas. Is the cream palette the final ratified design for Phase 2?
2. **VW Engine Migration**: The `Services` section perfectly illustrates the danger of mixing Tailwind `rem` utilities with the active `canva-source/styles.css` VW scaling engine. Do we want to temporarily use `px` values for spacing in `Services` until the global cutover?
3. **Typography**: The Stanga font weight issue in Testimonials is persistent. Do we have the `stanga-bold.woff2` asset available for integration?
