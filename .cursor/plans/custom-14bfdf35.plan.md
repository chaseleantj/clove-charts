<!-- 14bfdf35-eed9-401c-8f5c-9b909589556c eb165b0e-8e2e-42ba-afe7-9c8189c40e97 -->
# Customizable CSS Styling for Clove Charts

## Summary

Migrate from CSS Modules (hashed class names) to stable, namespaced class names with CSS custom properties. Users will manually import `clove-charts/styles.css` and can customize via:

- **Option A**: Override CSS variables (e.g., `--clove-grid-color`)
- **Option B**: Target stable class names (e.g., `.clove-tooltip`)

## Files to Modify

| File | Change |

|------|--------|

| [src/components/page.module.css](src/components/page.module.css) | Rename to `clove.css`, convert to plain CSS with stable class names |

| [src/components/plots/common/base-plot.tsx](src/components/plots/common/base-plot.tsx) | Replace `styles.X` with string literals |

| [src/components/plots/common/axis-manager.ts](src/components/plots/common/axis-manager.ts) | Replace `styles.X` with string literals |

| [src/components/plots/common/legend-manager.ts](src/components/plots/common/legend-manager.ts) | Replace `styles.X` with string literals |

| [src/components/plots/common/tooltip-manager.ts](src/components/plots/common/tooltip-manager.ts) | Replace `styles.X` with string literals |

| [src/components/plots/common/utils.ts](src/components/plots/common/utils.ts) | Replace `styles.chart` with string literal |

| [src/components/charts/chart-layout.tsx](src/components/charts/chart-layout.tsx) | Replace `styles.X` with string literals |

## Implementation Details

### 1. Create New CSS File Structure

Create `src/components/plots/styles/clove.css` with:

```css
/* CSS Custom Properties for theming */
:root {
    --clove-font-family: 'Geist', Arial, Helvetica, sans-serif;
    --clove-font-size: 12px;
    --clove-plot-background: transparent;
    --clove-grid-color: gray;
    --clove-grid-opacity: 0.25;
    --clove-tooltip-bg: rgba(255, 255, 255, 0.9);
    --clove-tooltip-border: 1px solid rgba(127, 127, 127, 0.25);
    --clove-legend-bg: rgba(255, 255, 255, 0.9);
}

/* Stable class names with clove- prefix */
.clove-chart { ... }
.clove-chart-wrapper { ... }
.clove-plot { }
.clove-plot-background { fill: var(--clove-plot-background); }
.clove-axes { }
.clove-x-axis { }
.clove-y-axis { }
.clove-axis-label { }
.clove-grid { color: var(--clove-grid-color); opacity: var(--clove-grid-opacity); }
.clove-legend { background: var(--clove-legend-bg); ... }
.clove-legend-title { }
.clove-legend-item { }
.clove-legend-symbol { }
.clove-tooltip { background: var(--clove-tooltip-bg); border: var(--clove-tooltip-border); ... }
.clove-tooltip-row { }
.clove-tooltip-label { }
.clove-tooltip-value { }
.clove-footer { }
.clove-captions { }
```

### 2. Create Class Name Constants

Create `src/components/plots/common/class-names.ts`:

```typescript
export const CLOVE_CLASSES = {
    chart: 'clove-chart',
    chartWrapper: 'clove-chart-wrapper',
    plot: 'clove-plot',
    plotBackground: 'clove-plot-background',
    axes: 'clove-axes',
    xAxis: 'clove-x-axis',
    yAxis: 'clove-y-axis',
    axisLabel: 'clove-axis-label',
    grid: 'clove-grid',
    legend: 'clove-legend',
    legendTitle: 'clove-legend-title',
    legendItem: 'clove-legend-item',
    legendSymbol: 'clove-legend-symbol',
    tooltip: 'clove-tooltip',
    tooltipRow: 'clove-tooltip-row',
    tooltipLabel: 'clove-tooltip-label',
    tooltipValue: 'clove-tooltip-value',
    header: 'clove-header',
    footer: 'clove-footer',
    captions: 'clove-captions',
} as const;
```

### 3. Update Component Files

Replace all `styles.X` references with `CLOVE_CLASSES.X`. Example in `base-plot.tsx`:

```typescript
// Before
import styles from '@/components/page.module.css';
// ...
.attr('class', styles.plotBackground);

// After
import { CLOVE_CLASSES } from '@/components/plots/common/class-names';
// ...
.attr('class', CLOVE_CLASSES.plotBackground);
```

### 4. Update App Entry Point

In [src/app/layout.tsx](src/app/layout.tsx) or user's app, add:

```typescript
import '@/components/plots/styles/clove.css';
```

### 5. Delete Old CSS Module

Remove [src/components/page.module.css](src/components/page.module.css) after migration.

## User Customization Examples

**Option A - CSS Variables:**

```css
:root {
    --clove-plot-background: #1a1a2e;
    --clove-grid-color: #4a4a6a;
}
```

**Option B - Class Targeting:**

```css
.clove-tooltip {
    background: #2d2d2d;
    color: white;
    border-radius: 8px;
}
```

### To-dos

- [ ] Create src/components/plots/styles/clove.css with CSS variables and stable class names
- [ ] Create src/components/plots/common/class-names.ts with CLOVE_CLASSES constant
- [ ] Update base-plot.tsx to use CLOVE_CLASSES instead of styles module
- [ ] Update axis-manager.ts, legend-manager.ts, tooltip-manager.ts to use CLOVE_CLASSES
- [ ] Update utils.ts to use CLOVE_CLASSES.chart
- [ ] Update chart-layout.tsx to use CLOVE_CLASSES
- [ ] Update layout.tsx to import clove.css, delete page.module.css