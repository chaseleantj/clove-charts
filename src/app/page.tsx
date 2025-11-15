import BaseChart from '@/components/charts/test-chart';
import IrisScatterChart from '@/components/charts/iris-scatter-chart';
import IrisHistogramChart from '@/components/charts/histogram-chart';

export default function Home() {
    return (
        // <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
            // <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
            <>
                <BaseChart />
                <IrisScatterChart />
                <IrisHistogramChart />
            </>
            // </main>
        // </div>
    );
}
