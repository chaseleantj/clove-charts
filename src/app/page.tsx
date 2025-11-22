import BaseChart from '@/components/charts/examples/test-chart';
import IrisBarChart from '@/components/charts/examples/iris-bar-chart';
import IrisScatterChart from '@/components/charts/examples/iris-scatter-chart';
import IrisHistogramChart from '@/components/charts/examples/iris-histogram-chart';
import TestContourChart from '@/components/charts/examples/test-contour-chart';

export default function Home() {
    return (
        <main>
            {/* <BaseChart /> */}
            <TestContourChart />
            <IrisBarChart />
            <IrisScatterChart />
            <IrisHistogramChart />
        </main>
    );
}
