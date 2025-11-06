import katex from 'katex';

import { DataValue } from '@/components/plots/common/config';

export function linspace(start: number, end: number, num: number): number[] {
    return Array.from(
        { length: num },
        (_, i) => start + (end - start) * (i / (num - 1))
    );
}

export function meshgrid(arr1: number[], arr2: number[]): [number, number][][] {
    const w = arr1.length;
    const h = arr2.length;
    const grid: [number, number][][] = [];
    for (let j = 0; j < h; j++) {
        grid[j] = [];
        for (let i = 0; i < w; i++) {
            grid[j][i] = [arr1[i], arr2[j]];
        }
    }
    return grid;
}

export function renderKatex(
    text: string, 
    element: d3.Selection<SVGForeignObjectElement, unknown, null, undefined>,
    x: number, 
    y: number, 
    angle?: number
): d3.Selection<SVGForeignObjectElement, unknown, null, undefined> {

    if (!element) return element;

    const nodeName = element.node()?.nodeName.toLowerCase() ?? 'unknown';

    if (nodeName !== 'foreignobject') {
        console.warn(
            'Expected a <foreignObject> element for KaTeX rendering, but got:',
            nodeName
        );
        return element;
    }

    let div = element.select('div.katex-wrapper');
    if (div.empty()) {
        div = element
            .append('xhtml:div')
            .attr('class', 'katex-wrapper')
            .style('display', 'inline-block') // so width/height are tight
            .style('white-space', 'nowrap'); // prevent line‑break shrink
    }

    div.html(katex.renderToString(text || '', { throwOnError: false }));

    // Measure after next paint so layout is final
    requestAnimationFrame(() => {
    const { width, height } = (div.node() as Element)?.getBoundingClientRect() ?? { width: 0, height: 0 };

        // Only set the dimensions afterwards, once the width and height are measured accurately
        element
            .attr('x', x)
            .attr('y', y)
            .attr('width', width)
            .attr('height', height);

        if (angle) {
            element.attr('transform', `rotate(${angle}, ${x}, ${y})`);
        }
    });
    return element;
}

export function getDataType(data: DataValue[]) {
    if (!data) return 'unknown';

    for (let i = 0; i < data.length; i++) {
        const value = data[i];
        if (value !== undefined && value !== null) {
            if (typeof value === 'string') return 'string';
            if (value instanceof Date) return 'date';
            if (typeof value === 'number' && !isNaN(value)) return 'number';
        }
    }
    return 'unknown';
}

// export function validateProps(props, requiredProps, chartName = 'Base Plot') {
//     const missing = [];

//     for (const prop of requiredProps) {
//         const value = props[prop];

//         if (value === undefined || value === null) {
//             missing.push(prop);
//             continue;
//         }

//         // Special validation for arrays that should not be empty
//         if (prop === 'data' && Array.isArray(value) && value.length === 0) {
//             missing.push(`${prop} (empty array)`);
//             continue;
//         }

//         // Special validation for string props that should not be empty
//         if (typeof value === 'string' && value.trim() === '') {
//             missing.push(`${prop} (empty string)`);
//             continue;
//         }
//     }

//     if (missing.length > 0) {
//         const chartType = chartName;
//         const message = `${chartType}: Missing or invalid required props: ${missing.join(', ')}`;
//         console.warn(message);
//         return false;
//     }

//     return true;
// }
