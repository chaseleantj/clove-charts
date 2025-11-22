import BaseChart from '@/components/charts/examples/test-chart';
import IrisBarChart from '@/components/charts/examples/iris-bar-chart';
import IrisScatterChart from '@/components/charts/examples/iris-scatter-chart';
import IrisHistogramChart from '@/components/charts/examples/iris-histogram-chart';
import TestContourChart from '@/components/charts/examples/test-contour-chart';
import TestImageChart from '@/components/charts/examples/test-image-chart';

export default function Home() {
    return (
        <main>
            {/* <BaseChart /> */}
            <TestImageChart />
            <TestContourChart />
            <IrisBarChart />
            <IrisScatterChart />
            <IrisHistogramChart />
        </main>
    );
}
