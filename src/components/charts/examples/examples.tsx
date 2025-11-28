'use client';

import dynamic from 'next/dynamic';

const BarChartExample = dynamic(
    () => import('@/components/charts/examples/bar-chart-example'),
    { ssr: false }
);
const ScatterChartExample = dynamic(
    () => import('@/components/charts/examples/scatter-chart-example'),
    { ssr: false }
);
const HistogramChartExample = dynamic(
    () => import('@/components/charts/examples/histogram-chart-example'),
    { ssr: false }
);
const ContourChartExample = dynamic(
    () => import('@/components/charts/examples/contour-chart-example'),
    { ssr: false }
);
const MatrixChartExample = dynamic(
    () => import('@/components/charts/examples/matrix-chart-example'),
    { ssr: false }
);
const ImageChartExample = dynamic(
    () => import('@/components/charts/examples/image-chart-example'),
    { ssr: false }
);
const LineChartExample = dynamic(
    () => import('@/components/charts/examples/line-chart-example'),
    { ssr: false }
);

export {
    BarChartExample,
    ScatterChartExample,
    HistogramChartExample,
    ContourChartExample,
    MatrixChartExample,
    ImageChartExample,
    LineChartExample,
};
