# Lazy Dashboards Option Coverage Matrix

This table tracks LADF option parity for Lazy Dashboards. "Supported" options are editable
in the visual editor. "Deferred" options are preserved but only editable via Expert mode.

| Viz | Option Path | Type | Default | Enum | Control | Status | Notes | Source |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| kpi | options.format | enum | number | number\|currency\|percent\|compact\|duration\|hours\|ratio\|custom | select | supported | Formats KPI value output. | src/framework/core/viz/charts/KpiPanel.jsx |
| kpi | options.currency | string | USD |  | text | supported | Currency code when format is currency. | src/framework/core/viz/charts/KpiPanel.jsx |
| kpi | options.label | string | "" |  | text | supported | Overrides label displayed above KPI. | src/framework/core/viz/charts/KpiPanel.jsx |
| kpi | options.caption | string | "" |  | text | supported | Optional caption under KPI value. | src/framework/core/viz/charts/KpiPanel.jsx |
| bar | options.tooltip | boolean | true |  | toggle | supported | Toggle the Recharts tooltip. | src/framework/core/viz/charts/BarChartPanel.jsx |
| bar | options.stacked | boolean | false |  | toggle | supported | Enable stacked rendering for series. | src/framework/core/viz/charts/BarChartPanel.jsx |
| bar | options.stackedKeys | stringList | [] |  | list | supported | Explicit series list for stacking/palette. | src/framework/core/viz/palettes/colorAssignment.js |
| bar | options.seriesKeys | stringList | [] |  | list | supported | Explicit series list for palette/legend. | src/framework/core/viz/palettes/colorAssignment.js |
| bar | options.colorBy | enum | series | series\|category | select | supported | Force category coloring for single-series bars. | src/framework/core/viz/palettes/colorAssignment.js |
| bar | options.diverging | boolean | false |  | toggle | supported | Use diverging palette for single-series values. | src/framework/core/viz/palettes/colorAssignment.js |
| bar | options.legend | boolean | true |  | toggle | supported | Show/hide legend container. | src/framework/core/viz/VizRenderer.jsx |
| bar | options.legendMode | enum | auto | auto\|series\|category | select | supported | Legend visibility logic and palette mode. | src/framework/core/viz/VizRenderer.jsx |
| bar | options.legendPosition | enum | bottom | bottom\|top\|right | select | supported | Legend placement around the chart. | src/framework/core/viz/VizRenderer.jsx |
| line | options.tooltip | boolean | true |  | toggle | supported | Toggle the Recharts tooltip. | src/framework/core/viz/charts/LineChartPanel.jsx |
| line | options.brush.enabled | boolean | false |  | toggle | supported | Enable the brush interaction. | src/framework/core/viz/charts/LineChartPanel.jsx |
| line | options.brush.startIndex | number | null |  | number | supported | Initial brush start index. | src/framework/core/viz/charts/LineChartPanel.jsx |
| line | options.brush.endIndex | number | null |  | number | supported | Initial brush end index. | src/framework/core/viz/charts/LineChartPanel.jsx |
| line | options.seriesKeys | stringList | [] |  | list | supported | Explicit series list for palette/legend. | src/framework/core/viz/palettes/colorAssignment.js |
| line | options.legend | boolean | true |  | toggle | supported | Show/hide legend container. | src/framework/core/viz/VizRenderer.jsx |
| line | options.legendMode | enum | auto | auto\|series\|category | select | supported | Legend visibility logic. | src/framework/core/viz/VizRenderer.jsx |
| line | options.legendPosition | enum | bottom | bottom\|top\|right | select | supported | Legend placement around the chart. | src/framework/core/viz/VizRenderer.jsx |
| barWithConditionalColoring | options.tooltip | boolean | true |  | toggle | supported | Toggle the Recharts tooltip. | src/framework/core/viz/charts/BarWithConditionalColoringPanel.jsx |
| barWithConditionalColoring | options.colorFn | function | null |  | code | deferred | Requires a runtime function; not editable in UI. | src/framework/core/viz/charts/BarWithConditionalColoringPanel.jsx |
| barWithConditionalColoring | options.legendItems | array | [] |  | json | deferred | Legend items list not exposed yet. | src/framework/core/viz/charts/BarWithConditionalColoringPanel.jsx |
| bulletChart | options.orientation | enum | horizontal | horizontal\|vertical | select | supported | Switches axes between horizontal/vertical. | src/framework/core/viz/charts/BulletChart.jsx |
| bulletChart | options.colorBy | string | "" |  | text | supported | Overrides the color encoding field. | src/framework/core/viz/charts/BulletChart.jsx |
| bulletChart | options.leftAnnotations.enabled | boolean | true |  | toggle | supported | Show dots beside labels. | src/framework/core/viz/charts/BulletChart.jsx |
| bulletChart | options.leftAnnotations.type | enum | dot | dot\|none | select | supported | Annotation display style. | src/framework/core/viz/charts/BulletChart.jsx |
| bulletChart | options.leftAnnotations.colorBy | string | "" |  | text | supported | Field to color left annotations. | src/framework/core/viz/charts/BulletChart.jsx |
| bulletChart | options.showPercentColumn | boolean | true |  | toggle | supported | Show percent column. | src/framework/core/viz/charts/BulletChart.jsx |
| bulletChart | options.percentKey | string | "" |  | text | supported | Percent field for the right column. | src/framework/core/viz/charts/BulletChart.jsx |
| bulletChart | options.markerLines.enabled | boolean | true |  | toggle | supported | Enable marker line overlay. | src/framework/core/viz/charts/BulletChart.jsx |
| bulletChart | options.markerLines.valueKey | string | dept_average |  | text | supported | Field used for marker line values. | src/framework/core/viz/charts/BulletChart.jsx |
| bulletChart | options.markerLines.label | string | Dept average |  | text | supported | Label for marker line legend entry. | src/framework/core/viz/charts/BulletChart.jsx |
| bulletChart | options.markerLines.color | color | #E0E000 |  | color | supported | Marker line color. | src/framework/core/viz/charts/BulletChart.jsx |
| bulletChart | options.outlierRule.valueKey | string | dept_threshold |  | text | supported | Field for outlier threshold values. | src/framework/core/viz/charts/BulletChart.jsx |
| bulletChart | options.iqrValueKey | string | "" |  | text | supported | Legacy IQR value key override. | src/framework/core/viz/charts/BulletChart.jsx |
| bulletChart | options.outlierValueKey | string | "" |  | text | supported | Legacy outlier value key override. | src/framework/core/viz/charts/BulletChart.jsx |
| bulletChart | options.averageKey | string | "" |  | text | supported | Fallback average key for marker lines. | src/framework/core/viz/charts/BulletChart.jsx |
| bulletChart | options.headerTitles.xTitle | string | "" |  | text | supported | Header label for value column. | src/framework/core/viz/charts/BulletChart.jsx |
| bulletChart | options.headerTitles.yTitle | string | "" |  | text | supported | Header label for category column. | src/framework/core/viz/charts/BulletChart.jsx |
| bulletChart | options.headerTitles.percentTitle | string | "" |  | text | supported | Header label for percent column. | src/framework/core/viz/charts/BulletChart.jsx |
| bulletChart | options.thresholdMarkers.valueKey | string | "" |  | text | deferred | Legacy marker key preserved for backward compatibility. | src/framework/core/viz/charts/BulletChart.jsx |
| bulletChart | options.thresholdMarkers.label | string | "" |  | text | deferred | Legacy marker label preserved for backward compatibility. | src/framework/core/viz/charts/BulletChart.jsx |
| filterBar | options.allowMultiSelect | boolean | true |  | toggle | supported | Allow multi-select filters. | examples/lazy-dashboards/src/components/LazyFilterBar.jsx |
| filterBar | options.showSearch | boolean | true |  | toggle | supported | Show search input on filter selections. | examples/lazy-dashboards/src/components/LazyFilterBar.jsx |
| filterBar | options.showClear | boolean | true |  | toggle | supported | Show clear button for filters. | examples/lazy-dashboards/src/components/LazyFilterBar.jsx |
| filterBar | options.layout | enum | inline | inline\|stacked | select | supported | Layout of filter bar controls. | examples/lazy-dashboards/src/components/LazyFilterBar.jsx |
