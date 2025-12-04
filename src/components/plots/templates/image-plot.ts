import BasePlot, { BasePlotProps, DataKey } from '../common/base-plot';
import { mergeWithDefaults } from '../common/utils';

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

class ImagePlot<
    TData extends Record<string, any> = Record<string, any>,
> extends BasePlot<TData> {
    declare domain: ImagePlotDomain;
    declare props: ImagePlotProps<TData>;

    imagePlotConfig!: ImagePlotConfig;

    constructor(props: ImagePlotProps<TData>) {
        super(props);
    }

    onInitializeProperties(): void {
        this.imagePlotConfig = mergeWithDefaults(
            DEFAULT_IMAGE_PLOT_CONFIG,
            this.props
        );
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

export default ImagePlot;
