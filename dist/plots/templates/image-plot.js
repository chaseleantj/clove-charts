import BasePlot from '../common/base-plot';
import { mergeWithDefaults } from '../common/utils';
export const DEFAULT_IMAGE_PLOT_CONFIG = {
    useCornerCoords: false,
};
class ImagePlot extends BasePlot {
    constructor(props) {
        super(props);
    }
    onInitializeProperties() {
        this.imagePlotConfig = mergeWithDefaults(DEFAULT_IMAGE_PLOT_CONFIG, this.props);
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
