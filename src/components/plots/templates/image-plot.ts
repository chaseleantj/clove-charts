import BasePlot, {
    BasePlotProps,
    DataKey,
} from '@/components/plots/common/base-plot';

export interface ImagePlotConfig {
    useCornerCoords: boolean;
}

export interface ImagePlotProps<
    TData extends Record<string, any> = Record<string, any>,
> extends BasePlotProps<TData>,
        Partial<ImagePlotConfig> {
    data: TData[];
    imageURLKey: DataKey<TData>;
    widthKey: DataKey<TData>;
    coordsKey: DataKey<TData>;
}

interface ImagePlotDomain {
    x: [number, number];
    y: [number, number];
}

export const DEFAULT_IMAGE_PLOT_CONFIG: ImagePlotConfig = {
    useCornerCoords: false,
};

export function getImagePlotConfig<TData extends Record<string, any>>(
    props: ImagePlotProps<TData>
): ImagePlotConfig {
    return {
        useCornerCoords:
            props.useCornerCoords ?? DEFAULT_IMAGE_PLOT_CONFIG.useCornerCoords,
    };
}

class BaseImagePlot<
    TData extends Record<string, any> = Record<string, any>,
> extends BasePlot<TData> {
    declare domain: ImagePlotDomain;
    declare props: ImagePlotProps<TData>;

    imagePlotConfig!: ImagePlotConfig;

    constructor(props: ImagePlotProps<TData>) {
        super(props);
    }

    onInitializeProperties(): void {
        this.imagePlotConfig = getImagePlotConfig(this.props);
    }

    draw() {
        this.props.data.forEach((d) => {
            this.primitiveManager.addImage(d[this.props.imageURLKey], {
                coords: d[this.props.coordsKey],
                width: d[this.props.widthKey],
                useCornerCoords: this.imagePlotConfig.useCornerCoords,
            });
        });
    }
}

export default BaseImagePlot;
