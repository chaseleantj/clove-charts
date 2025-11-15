import BaseChart from '@/components/charts/examples/test-chart';
import IrisScatterChart from '@/components/charts/examples/iris-scatter-chart';
import IrisHistogramChart from '@/components/charts/examples/iris-histogram-chart';

export default function Home() {
    return (
            <main>
                <BaseChart />
                <IrisScatterChart />
                <IrisHistogramChart />
            </main>
    );
}
