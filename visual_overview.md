# RADF Visual Overview

## Intro
- This document summarizes RADF at a conceptual level using diagrams to show major layers and flows.
- The diagrams use consistent terms (see glossary) and keep implementation details abstract.
- Each diagram focuses on one concern: system context, config composition, data flow, state propagation, styling, integration, and error handling.
- The flows reflect a config-driven, Recharts-based dashboard system with provider-backed data.

## Glossary (consistent terms)
- **Dashboard Config**: Declarative definition of a dashboard (title, panels, queries, layout).
- **Panel**: A single visual block (chart, table, card) driven by a query and encodings.
- **Query Request**: A normalized request produced from config + dashboard state.
- **Provider**: Data adapter that executes Query Requests against a data source.
- **Dashboard State**: Runtime state (filters, selections, drilldowns, date range).
- **Theme Tokens**: CSS variables that define colors, spacing, and typography.
- **Rendering Layer**: Components that turn panel data into visuals.

---

## Diagram 1 — RADF at a glance (system context)

```mermaid
flowchart LR
  App[App Integrator]
  Data[Data Sources]

  subgraph RADF[RADF Framework]
    direction LR
    Config[Configuration Layer]
    Query[Query & Execution]
    State[State Layer]
    Render[Rendering Layer]
    Style[Styling Layer]
  end

  App -->|Dashboard Config| Config
  App -->|Theme Selection| Style
  Config --> Query
  State --> Query
  Query --> Render
  Style --> Render
  Data -->|Provider| Query
  Render -->|UI| App
```

**Interpretation**
- The app supplies config and theme choices; RADF supplies runtime logic and rendering.
- Providers connect RADF to external data sources.
- Styling flows through CSS tokens into the rendering layer.

---

## Diagram 2 — Config → Runtime object model

```mermaid
flowchart TD
  Config[Dashboard Config]
  Validate[Validate & Normalize]
  Dash[Dashboard]
  Panels[Panels]
  Panel[Panel]
  Viz[Visual Definition]
  Enc[Encodings]
  QueryRef[Query Ref]
  Metrics[Metrics]
  Dimensions[Dimensions]

  Config --> Validate --> Dash
  Dash --> Panels --> Panel
  Panel --> Viz
  Viz --> Enc
  Panel --> QueryRef
  QueryRef --> Metrics
  QueryRef --> Dimensions
```

**Interpretation**
- Config is validated/normalized before it becomes runtime objects.
- Panels reference visuals and queries; queries reference metrics/dimensions.
- The model stays declarative and composable.

---

## Diagram 3 — Data request lifecycle

```mermaid
sequenceDiagram
  participant Panel
  participant State as Dashboard State
  participant Builder as Query Builder
  participant Provider
  participant Render as Renderer

  Panel->>State: reads filters/selections
  Panel->>Builder: build Query Request
  Builder-->>Panel: Query Request
  Panel->>Provider: execute(Query Request)
  Provider-->>Panel: data rows + meta
  Panel->>Render: render with data
  Note over Panel,Provider: Optional cache can sit between Panel and Provider
```

**Interpretation**
- Panels build Query Requests from config and dashboard state.
- Providers return shaped data for rendering.
- A cache layer may be inserted without changing panel logic.

---

## Diagram 4 — State + interactions propagation

```mermaid
sequenceDiagram
  participant User
  participant Panel
  participant State as Dashboard State
  participant Query as Query Builder
  participant Provider

  User->>Panel: interact (filter/drilldown)
  Panel->>State: update state
  State->>Query: compute new Query Requests
  Query->>Provider: execute updated requests
  Provider-->>Panel: new data
  Note over State,Panel: state updates fan out to affected panels
```

**Interpretation**
- Interactions mutate dashboard state, not panels directly.
- Updated state triggers new query requests.
- Affected panels re-render as new data arrives.

---

## Diagram 5 — Theming & styling pipeline

```mermaid
flowchart TD
  Tokens[tokens.css *Theme Tokens*]
  Light[theme.light.css]
  Dark[theme.dark.css]
  Styles[component styles]
  Switch[App Theme Switch]
  Root[Document Root Class]
  Panels[Panels & Charts]

  Tokens --> Light
  Tokens --> Dark
  Switch --> Root
  Root --> Light
  Root --> Dark
  Light --> Styles
  Dark --> Styles
  Styles --> Panels
```

**Interpretation**
- Tokens are shared across all themes.
- The app toggles a root theme class to select a theme.
- Component styles read CSS variables to affect panel chrome and charts.

---

## Diagram 6 — Minimal “happy path” integration

```mermaid
flowchart LR
  Step1[Import RADF CSS] --> Step2[Define Dashboard Config]
  Step2 --> Step3[Provide Provider]
  Step3 --> Step4[Mount Dashboard Component]
  Step4 --> Step5[Render Panels]
```

**Interpretation**
- The minimal path needs CSS, a config, a provider, and a dashboard mount.
- Panel rendering follows automatically from the config.

---

## Diagram 7 — Error handling & validation flow

```mermaid
flowchart TD
  Start[Dashboard Config]
  Validate[Validate & Normalize]
  Invalid[Invalid Config]
  Panel[Panel Render]
  Loading[Loading State]
  Empty[Empty State]
  Error[Error State]
  Data[Data Returned]
  ProviderErr[Provider Error]

  Start --> Validate
  Validate -->|valid| Panel
  Validate -->|invalid| Invalid
  Panel --> Loading
  Loading -->|data| Data
  Loading -->|empty| Empty
  Loading -->|error| Error
  Loading -->|provider error| ProviderErr
  ProviderErr --> Error
```

**Interpretation**
- Config validation prevents broken runtime states.
- Panels should surface loading, empty, and error states distinctly.
- Provider errors should be visible at panel or dashboard level.

---

## Diagram 8 — Extensibility points map (optional)

```mermaid
flowchart LR
  subgraph Stable[Stable Extension Points]
    Provider[Provider]
    Config[Dashboard Config]
    Theme[Theme Tokens]
    Format[Formatting]
  end

  subgraph Advanced[Advanced Extension Points]
    Panel[New Panel Type]
    Transform[Custom Transforms]
    Metric[Metric/Dimension Definitions]
  end

  Config --> Panel
  Provider --> Transform
  Theme --> Panel
  Metric --> Transform
  Format --> Panel
```

**Interpretation**
- Stable extensions are safe and expected in most apps.
- Advanced extensions often require deeper knowledge of the framework.

---

## How to read these diagrams
- Boxes are concepts (config, state, provider), not code classes.
- Arrows show data or control flow direction.
- Sequence diagrams show time-ordered interactions.
- “Optional” elements are noted explicitly (e.g., cache).
- Terms match the glossary; if a term is unfamiliar, check the glossary first.

## Common pitfalls
- Skipping validation and letting invalid config reach runtime.
- Mixing panel-specific filters with global dashboard filters.
- Forgetting to re-run queries after state changes.
- Treating provider errors as empty data instead of error states.
- Applying theme classes without importing the CSS entrypoint.
- Overloading single panels with multiple concerns instead of splitting panels.
- Using overly dense diagrams that hide the main idea.
