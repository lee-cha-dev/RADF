# Viz QA Checklist

Use this checklist to validate all RADF visuals before release. Focus on correctness,
readability, and theme compliance over pixel-perfect layout.

## Required States
- Loading: show a clear loading indicator or skeleton.
- Empty: show a friendly empty state with guidance.
- Error: show a clear error message when required fields are missing.
- Ready: render the viz without console errors.

## Theme Compliance
- Light and dark themes both legible.
- All colors come from CSS variables (no hard-coded hex in panels).
- No inline styles added for theming.

## Interaction Parity
- Tooltip behavior matches global rules (toggleable and consistent content).
- Legend behavior matches VizRenderer logic (toggleable when supported).
- Click/hover handlers do not throw and preserve focus.

## Data Safety
- Missing/invalid rows are skipped safely.
- Numeric fields do not coerce invalid values to 0 unless specified.
- Encodings with missing required keys surface an empty/error state.

## Layout and Responsiveness
- Chart renders correctly at small widths and mobile breakpoints.
- No overflowing labels or clipped legends at default size.

## Dependency Hygiene
- No new dependencies introduced.
- Recharts-only rendering (no mixed charting libs).
