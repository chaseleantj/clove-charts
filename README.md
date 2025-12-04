# clove-charts

An extremely flexible React plotting library.

Easily build interactive plots to visualize data.

Unlike Plotly/Recharts, you can draw *whatever* you want.

Use the Clove API for lots of control with none of the hassle of D3. Fall back to D3 whenever you want.

```
npm install clove-charts-0.1.0.tgz
```

## Plot templates

Clove comes with 7 beautiful templates that you can easily import into your code.

- Scatter plot
- Line plot
- Bar plot
- Histogram
- Contour plot
- Matrix plot
- Image plot

More coming soon!

### Example
```
import { BarPlot, ChartLayout } from 'clove-charts';

const data = [
    { species: 'Maple', count: 14 },
    { species: 'Oak', count: 27 },
    { species: 'Cherry', count: 10 },
    { species: 'Cedar', count: 16 },
    { species: 'Birch', count: 9 },
    { species: 'Pine', count: 8 },
];

export function BarChart() {
    return (
        <ChartLayout>
            <BarPlot
                data={data}
                xKey="species"
                yKey="count"
            />
        </ChartLayout>
    );
}
```

## Customization

Easily customize your plots with 70+ config options.

### Example

```
const PLOT_CONFIG = {
    themeConfig: { 
        enableZoom: true
    },
    axisConfig: {
        xLabel: 'Sepal width (cm)',
        yLabel: 'Petal length (cm)',
    },
    legendConfig: {
        enabled: true,
        title: 'Species',
    },
    tooltipConfig: {
        enabled: true,
    },
};

const irisDataset = ...

export function ScatterChart {
    return (
        <ScatterPlot
            data={irisDataset}
            xKey="petal_width"
            yKey="sepal_length"
            colorKey="species"
            {...PLOT_CONFIG}
        />
    );
}
```

For a full list of config options, see here. (under construction)

## Use your own styles

For even more granular control, edit/override `clove-charts/styles/clove.css`.

## Make your own plots




