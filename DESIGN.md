# Design System Specification

## 1. Overview & Creative North Star: "The Celestial Observatory"

This design system is built to transform a mobile interface into a high-precision scientific instrument. Our Creative North Star is **The Celestial Observatory**—a concept that moves away from "flat" mobile apps and toward a sophisticated, immersive "Head-Up Display" (HUD). 

We reject the generic "template" look. Instead of rigid, centered grids, we utilize **intentional asymmetry** and **tonal depth** to guide the eye. We treat the screen as a window into the cosmos, using overlapping layers and high-contrast typography to create a sense of vastness and technical authority. This system balances the cold precision of NASA data with the awe-inspiring beauty of the nebula, ensuring the user feels like both an explorer and a scientist.

---

## 2. Color & Atmospheric Depth

Our palette is rooted in the darkness of the vacuum, using light not just as decoration, but as data.

### The "No-Line" Rule
To maintain a high-end editorial feel, **1px solid borders are strictly prohibited for sectioning or layout.** Boundaries must be defined through:
*   **Tonal Shifts:** Placing a `surface_container_low` element against a `surface` background.
*   **Luminance Transitions:** Using subtle shifts in dark values to imply edge without a hard stroke.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers floating in space. 
*   **Base:** `surface` (#11131d) represents the void.
*   **Nesting:** Use `surface_container_low` for large background sections and `surface_container_high` or `highest` for interactive elements or cards. This "stacking" of containers creates a sense of proximity to the user.

### The "Glass & Gradient" Rule
Floating elements (like navigation bars or top-level alerts) should utilize **Glassmorphism**.
*   **Formula:** `surface_variant` at 40% opacity + 20px Backdrop Blur.
*   **Gradients:** Use a subtle linear gradient (Top-Left to Bottom-Right) from `primary` (#2ddbde) to `primary_container` (#002324) for main CTAs to give them a "plasma-core" energy.

---

## 3. Typography: The Editorial Scale

We pair the technical precision of **Inter** with the wide, expansive authority of **Space Grotesk**.

*   **Display & Headlines (Space Grotesk):** These are our "hero" elements. Use `display-lg` and `headline-lg` with generous letter spacing to evoke the feeling of a wide-screen cinematic experience. Headlines should often be left-aligned with a significant "hang" over body content to create intentional asymmetry.
*   **UI & Technical Data (Inter):** All interactive elements, labels, and body text use Inter. This provides the "Trustworthy" pillar of our brand.
*   **The "Technical" Label:** Use `label-sm` in all-caps with 0.05rem letter-spacing for data points (e.g., "COORDINATES: 42.1N") to mimic aerospace documentation.

---

## 4. Elevation & Depth

We achieve hierarchy through **Tonal Layering** rather than traditional elevation shadows.

*   **The Layering Principle:** Depth is "baked into" the background tokens. A `surface_container_lowest` card placed on a `surface_container_low` section creates a natural, soft recession. 
*   **Ambient Shadows:** If an element must float (e.g., a modal), use an ultra-diffused shadow:
    *   **Blur:** 40px - 60px.
    *   **Opacity:** 8%.
    *   **Color:** Use `primary` or `tertiary` tokens as the shadow tint rather than black, creating a "nebula glow" effect around the element.
*   **The "Ghost Border" Fallback:** If accessibility requires a border, use the `outline_variant` token at **15% opacity**. It should be felt, not seen.

---

## 5. Components

### Cards & Data Containers
*   **Layout:** No dividers. Use vertical spacing (1.5rem to 2rem) to separate content.
*   **Background:** Use `surface_container` with a `sm` (0.125rem) or `md` (0.375rem) corner radius for a sharp, technical look.
*   **Glass Variant:** For "Discovery" features, use the Glassmorphism formula (40% opacity + blur).

### Buttons
*   **Primary:** A gradient fill from `primary` to `primary_fixed_dim`. No border. High-contrast `on_primary_fixed` text.
*   **Secondary:** No fill. A "Ghost Border" of `primary` at 30% opacity. 
*   **Tertiary:** Text-only, using the `primary` token. Use for low-priority technical actions.

### Technical Plotting & Charts
*   **Line-work:** Use `primary` for the main data path and `secondary` for secondary comparisons.
*   **Grid Lines:** Use `outline_variant` at 10% opacity. 
*   **Glow:** Apply a 2px outer glow to the `primary` data line to simulate a glowing monitor.

### Interactive "Chips"
*   **Filter Chips:** Use `surface_container_highest` with a `full` (9999px) radius. When active, transition to a `secondary` (#ffb77d) fill with `on_secondary` text.

---

## 6. Do's and Don'ts

### Do
*   **Do** use overlapping elements. A planet image should partially "bleed" behind a glass card.
*   **Do** use asymmetrical margins. Pushing a headline further left than the body text creates a high-end, custom-coded feel.
*   **Do** use `tertiary` (#ffb0ca) sparingly for "Anomalies" or "Special Celestial Events" to draw immediate attention.

### Don't
*   **Don't** use pure white (#FFFFFF). Always use `on_surface` or `on_background` to prevent eye strain in dark environments.
*   **Don't** use standard Material shadows. They feel "earthbound." Use the "Ambient Shadow" or "Tonal Layering" instead.
*   **Don't** use 100% opaque dividers. Use vertical white space or a 10% `outline_variant` line if absolutely necessary.
*   **Don't** use large corner radii. Stick to `sm` and `md` to maintain a "scientific instrument" aesthetic. Large "bubbly" corners are for consumer social apps, not NASA-powered tech.