import {
    BarChartExample,
    ScatterChartExample,
    HistogramChartExample,
    ContourChartExample,
    MatrixChartExample,
    ImageChartExample,
    LineChartExample,
} from '@/components/charts/examples/examples';

export default function Home() {
    return (
        <main>
            <ScatterChartExample />
            <LineChartExample />
            <MatrixChartExample />
            <ContourChartExample />
            <BarChartExample />
            <HistogramChartExample />
            <ImageChartExample />
        </main>
    );
}
