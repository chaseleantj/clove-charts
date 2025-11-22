import BasePlot, { BasePlotProps } from '@/components/plots/common/base-plot';
import { ImagePrimitive } from '@/components/plots/common/primitives/primitives';

export interface ImagePlotConfig {
    useCornerCoords: boolean;
}

export interface ImagePlotProps extends BasePlotProps, Partial<ImagePlotConfig> {
    data: Record<string, any>[];
    imageURLClass: string;
    widthClass: string;
    coordsClass: string;
}

interface ImagePlotDomain {
    x: [number, number];
    y: [number, number];
}

export const DEFAULT_IMAGE_PLOT_CONFIG: ImagePlotConfig = {
    useCornerCoords: false,
};

export function getImagePlotConfig(props: ImagePlotProps): ImagePlotConfig {
    return {
        useCornerCoords: props.useCornerCoords ?? DEFAULT_IMAGE_PLOT_CONFIG.useCornerCoords,
    };
}

class BaseImagePlot extends BasePlot {
    declare domain: ImagePlotDomain;
    declare props: ImagePlotProps;

    imagePlotConfig: ImagePlotConfig;
    images: ImagePrimitive[] = [];

    constructor(props: ImagePlotProps) {
        super(props);
        this.imagePlotConfig = getImagePlotConfig(props);
    }

    renderElements() {

        this.props.data.forEach((d) => {

            const image = this.primitives.addImage(d[this.props.imageURLClass], {
                coords: d[this.props.coordsClass],
                width: d[this.props.widthClass],
                useCornerCoords: this.imagePlotConfig.useCornerCoords,
            });

            this.images.push(image);
        });
    }
}

export default BaseImagePlot;
