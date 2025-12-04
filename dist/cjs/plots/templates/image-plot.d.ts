import BasePlot, { BasePlotProps, DataKey } from '../common/base-plot';
export interface ImagePlotConfig {
    useCornerCoords: boolean;
}
export interface ImagePlotProps<TData extends Record<string, any> = Record<string, any>> extends BasePlotProps<TData>, Partial<ImagePlotConfig> {
    data: TData[];
    imageURLKey: DataKey<TData>;
    widthKey: DataKey<TData>;
    coordsKey: DataKey<TData>;
}
interface ImagePlotDomain {
    x: [number, number];
    y: [number, number];
}
export declare const DEFAULT_IMAGE_PLOT_CONFIG: ImagePlotConfig;
declare class ImagePlot<TData extends Record<string, any> = Record<string, any>> extends BasePlot<TData> {
    domain: ImagePlotDomain;
    props: ImagePlotProps<TData>;
    imagePlotConfig: ImagePlotConfig;
    constructor(props: ImagePlotProps<TData>);
    onInitializeProperties(): void;
    draw(): void;
}
export default ImagePlot;
