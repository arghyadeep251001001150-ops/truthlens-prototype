---
name: TruthLens
colors:
  surface: '#0f1418'
  surface-dim: '#0f1418'
  surface-bright: '#343a3e'
  surface-container-lowest: '#0a0f12'
  surface-container-low: '#171c20'
  surface-container: '#1b2024'
  surface-container-high: '#252b2e'
  surface-container-highest: '#303539'
  on-surface: '#dee3e8'
  on-surface-variant: '#bdc8d1'
  inverse-surface: '#dee3e8'
  inverse-on-surface: '#2c3135'
  outline: '#87929a'
  outline-variant: '#3e484f'
  surface-tint: '#7bd0ff'
  primary: '#8ed5ff'
  on-primary: '#00354a'
  primary-container: '#38bdf8'
  on-primary-container: '#004965'
  inverse-primary: '#00668a'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#ffc174'
  on-tertiary: '#472a00'
  tertiary-container: '#f59e0b'
  on-tertiary-container: '#613b00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#c4e7ff'
  primary-fixed-dim: '#7bd0ff'
  on-primary-fixed: '#001e2c'
  on-primary-fixed-variant: '#004c69'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#0f1418'
  on-background: '#dee3e8'
  surface-variant: '#303539'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style
The design system is engineered for a high-stakes information environment where precision and neutrality are paramount. The brand personality is authoritative yet transparent, evoking the feel of a high-end cybersecurity suite merged with advanced data science tools.

The visual style follows a **Modern-Corporate** aesthetic with **Minimalist** and **Glassmorphic** influences. It utilizes a dark-first approach to reduce eye strain during deep research and to allow vibrant functional status colors (Success, Warning, Danger) to pop against a disciplined charcoal backdrop. The emotional response should be one of "verified calm"—providing users with the clarity needed to navigate complex information landscapes.

## Colors
The palette is rooted in a "Deep Sea" dark mode. 
- **Primary (Refined Blue):** Used for interactive elements, focus states, and AI-driven insights.
- **Surface Tiers:** Use `#0A0C10` for the background and `#161B22` for primary containers to create subtle depth.
- **Functional Colors:** Emerald, Amber, and Rose are reserved strictly for claim status (Verified, Disputed, False). Do not use these for decorative purposes; they must maintain their semantic integrity to ensure high information scannability.

## Typography
This design system utilizes **Inter** for all primary communication to ensure maximum legibility across all hardware. **JetBrains Mono** is introduced for metadata, source citations, and technical labels to reinforce the "verification/data" aesthetic.

- Use tighter letter-spacing on headlines to maintain a modern, "packaged" look.
- Use `body-md` as the default for claim descriptions.
- Use `label-sm` in all-caps for category tags and credibility scores.

## Layout & Spacing
The layout follows a **Fluid Grid** model with a maximum content width of 1280px for readability. 

- **Desktop:** 12-column grid, 24px gutters, 48px side margins.
- **Tablet:** 8-column grid, 16px gutters, 24px side margins.
- **Mobile:** 4-column grid, 16px gutters, 16px side margins.

Information density should be high but organized. Use `md` (24px) spacing between distinct logic blocks and `sm` (12px) for elements within a single card or component.

## Elevation & Depth
Depth is created through **Tonal Layering** and **Subtle Glassmorphism** rather than heavy shadows.

- **Level 0 (Background):** `#0A0C10` - The base canvas.
- **Level 1 (Cards/Sidebar):** `#161B22` with a 1px border of `white/10%`.
- **Level 2 (Modals/Popovers):** `#1D242C` with a background blur (12px) and a subtle 20% opacity primary color glow to indicate active focus.
- **Outlines:** Use soft, low-contrast borders (`rgba(255, 255, 255, 0.08)`) to define element boundaries without creating visual noise.

## Shapes
The shape language is **Soft** and precise. 
- Standard components (Buttons, Inputs) use a `0.25rem` (4px) corner radius.
- Larger containers (Cards, Evidence Panels) use `rounded-lg` (8px).
- This restrained roundness maintains a professional, "software-tool" feel, avoiding the overly casual nature of fully rounded pill shapes.

## Components
- **Verdict Badges:** Compact labels using `label-sm`. Backgrounds should be 15% opacity of the functional color (Emerald/Amber/Rose) with a 100% opacity text color for contrast.
- **Credibility Meters:** Horizontal bars using a gradient from Neutral to the specific Verdict color. Use a 4px height for the track to keep it refined.
- **Evidence Cards:** High-density cards featuring a `1px` border, a "Source" label in JetBrains Mono, and a clear "Confidence Score" indicator in the top right.
- **Buttons:** 
  - *Primary:* Solid Refined Blue with dark text. 
  - *Secondary:* Ghost style with 1px border and Refined Blue text.
- **Inputs:** Darker than the surface color, using a subtle 1px border that illuminates to Refined Blue on focus.
- **Navigation:** A slim, vertical sidebar or top-bar with blurred background transparency, utilizing monochrome icons that turn to Primary Blue when active.