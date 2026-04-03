# Design System Specification: The Precision Engine

## 1. Overview & Creative North Star
**Creative North Star: "The Architectural Ledger"**
This design system moves away from the "standard SaaS dashboard" and toward a high-fidelity, editorial-grade utility. The objective is to treat data not as a burden, but as a prestigious asset. By combining the structural authority of a blue-chip financial report with the fluid responsiveness of modern engineering tools, we create an environment that feels both indestructible and effortless.

We break the "template" look through **Intentional Asymmetry**. Instead of centered, boxed-in layouts, we utilize a strong left-heavy anchor (the Sidebar) and expansive, right-aligned data canvases. Hierarchy is established not by lines, but by "Linguistic Gravity"—where the weight and scale of typography guide the eye through complex datasets.

---

## 2. Colors: Tonal Depth & The "No-Line" Rule
The palette is rooted in `on_surface` (#131B2E) and `secondary` (#515F74), creating a high-trust, "Deep Navy" foundation.

### The "No-Line" Rule
Standard 1px borders are strictly prohibited for sectioning. Structural boundaries must be defined through background color shifts.
- **Base Level:** `surface` (#FAF8FF)
- **Secondary Sectioning:** `surface_container_low` (#F2F3FF)
- **Primary Workspaces:** `surface_container_lowest` (#FFFFFF)

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. A "Data Card" should not have a border; it should be a `surface_container_lowest` block sitting on a `surface_container` background. This creates "Natural Containment" that reduces visual noise in data-heavy views.

### The Glass & Gradient Rule
To prevent the interface from feeling "flat" or "cheap," use Glassmorphism for floating utilities (Modals, Popovers).
- **Glass Token:** `surface_variant` (#DAE2FD) at 70% opacity with a `24px` backdrop-blur.
- **Signature Gradient:** For primary CTAs, apply a subtle linear gradient from `primary` (#00488D) to `primary_container` (#005FB8) at a 135-degree angle. This adds "visual soul" and a tactile, premium finish.

---

## 3. Typography: Editorial Authority
We utilize a dual-typeface system to balance character with legibility.

*   **Display & Headlines:** **Manrope.** Its geometric yet warm curves provide a modern, "architectural" feel for high-level navigation and page titles.
*   **Body & Data:** **Inter.** Chosen for its exceptional tall x-height and legibility in dense tables.

### Hierarchy Highlights
- **Headline-LG (Manrope, 2rem):** Used for primary dashboard headers.
- **Title-SM (Inter, 1rem, Medium 500):** Used for table headers to ensure "scannability."
- **Label-SM (Inter, 0.6875rem, Bold 700):** All-caps for metadata tags to distinguish from interactive data.

---

## 4. Elevation & Depth: Tonal Layering
We convey hierarchy through **Tonal Layering** rather than traditional structural lines.

- **The Layering Principle:** Stack `surface-container` tiers. A `surface_container_highest` (#DAE2FD) element should only be used for the most critical interactive focus area (e.g., an active cell or a selected sidebar item).
- **Ambient Shadows:** For floating elements like dropdowns, use a "Deep Breath" shadow: `0px 12px 32px rgba(19, 27, 46, 0.06)`. The shadow color must be a derivative of `on_surface`, never pure black.
- **The "Ghost Border" Fallback:** If a separator is required for accessibility in dense tables, use `outline_variant` (#C2C6D4) at **15% opacity**. This creates a suggestion of a line without breaking the editorial flow.

---

## 5. Components: Precision Utility

### Data Tables (The Core)
*   **Header:** `surface_container_low` background, no bottom border.
*   **Rows:** Alternating `surface` and `surface_container_lowest` backgrounds. 
*   **Interactions:** On hover, change background to `surface_container_high`.
*   **Rule:** Forbid divider lines. Use `spacing-4` (0.9rem) of vertical white space to separate rows.

### Buttons & Chips
*   **Primary Button:** Gradient-filled (Primary to Primary-Container), `rounded-md` (0.375rem). 
*   **Variable Chips:** For `{{ColumnName}}` syntax, use `tertiary_container` (#006693) background with `on_tertiary_container` (#B8E0FF) text. Apply a `Monospace` font-family to these chips to signal "Code" functionality.

### File Upload Zones
*   **Style:** `surface_container_low` background with a dashed "Ghost Border" (15% opacity `outline`). 
*   **Micro-copy:** Use `body-sm` in `secondary` (#515F74) for technical requirements.

### Input Fields
*   **Inactive:** `surface_container_lowest` background with a `0.5px` Ghost Border.
*   **Focused:** Border transitions to `primary` (#00488D) with a `4px` outer glow of `primary_fixed` (#D6E3FF) at 30% opacity.

---

## 6. Do’s and Don'ts

### Do
*   **Do** use `spacing-8` (1.75rem) as your default "breathing room" between major sections.
*   **Do** use `surface_dim` (#D2D9F4) for sidebar backgrounds to create a clear "anchor" against the bright workspace.
*   **Do** prioritize "Type-First" hierarchy—let the size and weight of text do the work before you reach for a color or a box.

### Don’t
*   **Don't** use 100% opaque `outline` tokens for borders; it creates "visual friction" that exhausts the user during long data sessions.
*   **Don't** use pure black (#000000) for shadows or text. It breaks the sophisticated navy-slate tonal range.
*   **Don't** use "Alert Red" for anything other than destructive actions. Use `tertiary` (#004D70) for "Info" to keep the interface calm and professional.