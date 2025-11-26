import BaseChart from '@/components/charts/examples/test-chart';
import IrisBarChart from '@/components/charts/examples/iris-bar-chart';
import IrisScatterChart from '@/components/charts/examples/iris-scatter-chart';
import IrisHistogramChart from '@/components/charts/examples/iris-histogram-chart';
import TestContourChart from '@/components/charts/examples/test-contour-chart';
import TestMatrixPlotChart from '@/components/charts/examples/test-matrixplot-chart';
import TestImageChart from '@/components/charts/examples/test-image-chart';
import StocksLineChart from '@/components/charts/examples/stocks-line-chart';

export default function Home() {
    return (
        <main>
            <StocksLineChart />
            <IrisScatterChart />
            <TestMatrixPlotChart />
            <TestContourChart />
            <IrisBarChart />
            <IrisHistogramChart />
            <TestImageChart />
        </main>
    );
}
