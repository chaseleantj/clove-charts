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
    imageURLClass: DataKey<TData>;
    widthClass: DataKey<TData>;
    coordsClass: DataKey<TData>;
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
            this.primitiveManager.addImage(d[this.props.imageURLClass], {
                coords: d[this.props.coordsClass],
                width: d[this.props.widthClass],
                useCornerCoords: this.imagePlotConfig.useCornerCoords,
            });
        });
    }
}

export default BaseImagePlot;
