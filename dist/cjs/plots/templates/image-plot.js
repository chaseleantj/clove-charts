"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_IMAGE_PLOT_CONFIG = void 0;
const base_plot_1 = __importDefault(require("../common/base-plot"));
const utils_1 = require("../common/utils");
exports.DEFAULT_IMAGE_PLOT_CONFIG = {
    useCornerCoords: false,
};
class ImagePlot extends base_plot_1.default {
    constructor(props) {
        super(props);
    }
    onInitializeProperties() {
        this.imagePlotConfig = (0, utils_1.mergeWithDefaults)(exports.DEFAULT_IMAGE_PLOT_CONFIG, this.props);
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
exports.default = ImagePlot;
