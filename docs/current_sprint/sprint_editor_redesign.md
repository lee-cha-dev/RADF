# Current Sprint: JetBrains-Style Editor Redesign

**Note:** Reference `docs/current_sprint/LazyDashboardsEditorPrototype.jsx` for the prototype that was used as mockup & POC for these sets of features.

## Overview
We are transitioning the Lazy Dashboards editor from a fixed, three-column layout to a JetBrains/game-engine-style interface with collapsible side panels, icon toolbars, and a wide central canvas. This change preserves all existing editor functionality while making the layout more flexible and the codebase more maintainable by decomposing the monolithic `DashboardEditor.jsx` into focused sub-components.

## Why This Change
**Current pain points**
- Preview area is constrained to ~40% width in the fixed layout.
- Left and right panels are always visible, wasting space when users want to focus on the preview.
- No quick way to maximize the preview or re-balance panel space.
- `DashboardEditor.jsx` is ~2,500+ lines, making changes risky and difficult to test.
- "Add Widget" button is unreliable.
- Live preview is placeholder in parts; need to preserve full RADF rendering.

**Target outcomes**
- Preview expands to 80%+ width when panels collapse.
- Collapsible panels controlled via icon toolbars and minimize buttons.
- Tool-based navigation for Dataset, Semantic Layer, Widgets, Properties, and Settings.
- Modular component architecture for maintainability and testability.
- Full RADF rendering preserved in the preview.

## Prototype Reference (UI/UX Only)
A UI/UX mockup exists at `/mnt/user-data/outputs/LazyDashboardsEditorPrototype.jsx`.
- This prototype demonstrates layout behavior, toolbars, panel transitions, and tool switching.
- It **does not** implement functional data wiring or RADF rendering.

## Old vs. New Layout Mapping
**Old (Fixed 3-column grid)**
- Left sidebar (always visible)
- Center preview (constrained width)
- Right sidebar (always visible)

**New (JetBrains-style shell)**
- Left icon toolbar (48px) + collapsible left panel
- Center canvas (expands when panels collapse)
- Right collapsible panel + right icon toolbar (48px)
- Top header bar with status indicators

## Component Refactor Targets
Primary refactor target:
- `examples/lazy-dashboards/src/pages/DashboardEditor.jsx`

Target architecture (modular):
- `DashboardEditor.jsx` (orchestrator, <500 lines)
- `EditorLayout.jsx` (layout container)
- `EditorHeader.jsx` (top toolbar)
- `IconToolbar.jsx` (left/right toolbars)
- `CollapsiblePanel.jsx` (panel shell)
- Left panel tools:
    - `DatasetPanel.jsx`
    - `SemanticLayerPanel.jsx`
    - `WidgetListPanel.jsx`
- Right panel tools:
    - `WidgetPropertiesPanel.jsx`
    - `EditorSettingsPanel.jsx`
- Center canvas:
    - `GridCanvas.jsx`
    - `GridWidget.jsx`
- Modals:
    - `AddWidgetModal.jsx`
    - `TemplateModal.jsx`
    - `RemoveWidgetModal.jsx`

## Feature Breakdown (Phased)
### Feature 1: Core Layout Infrastructure
- Layout shell, toolbars, panels, header bar
- Panel open/close + tool switching state
- CSS integration

### Feature 2: Dataset & Import Panel
- Dataset tool in left panel
- DatasetImporter integration
- Dataset state wiring

### Feature 3: Semantic Layer Panel
- Semantic tool in left panel
- Dimensions/metrics editing
- Auto-generation from dataset

### Feature 4: Widget List Panel
- Widget list tool in left panel
- Add widget, selection, empty states

### Feature 5: Widget Properties Panel
- Properties tool in right panel
- Encoding, options, expert mode, validation

### Feature 6: Editor Settings Panel
- Settings tool in right panel
- Sync controls + status

### Feature 7: Grid Canvas Component
- Layout editor & preview rendering
- Drag/resize interactions

### Feature 8: Modal Components Extraction
- Add widget, template, remove confirmations

### Feature 9: Panel Resize Functionality
- Resizable panels with width persistence

### Feature 10: Auto-save & Sync Integration
- Auto-save hooks, sync hooks, header indicators

## In Scope
- Desktop layout redesign (JetBrains/game-engine style)
- Collapsible panels and tool switching
- Component decomposition
- Preserve existing editor functionality and RADF rendering

## Out of Scope (This Sprint)
- Mobile/tablet layouts
- Keyboard shortcuts
- New visualization types or RADF schema changes

## Acceptance Criteria (Summary)
- Icon toolbars render on both sides (48px width)
- Panels toggle open/close on icon click
- Clicking the active tool twice closes its panel
- Active tool shows a green border indicator
- Panel header minimize button closes the panel
- Tooltips show on icon hover
- Center canvas expands when panels close
- No regressions in existing editor functionality

## Notes
- The prototype is a **visual reference** only.
- This is a refactor + redesign, not a rewrite.
- Preserve existing RADF rendering in preview at all times.
