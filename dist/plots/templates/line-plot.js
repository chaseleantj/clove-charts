import * as d3 from 'd3';
import BasePlot from '../common/base-plot';
import { isDefined } from '../common/utils/type-guards';
import { isContinuousScale } from '../common/scale-manager';
import { mergeWithDefaults } from '../common/utils';
export const DEFAULT_LINE_PLOT_CONFIG = {
    lineWidth: 1.5,
    lineOpacity: 1,
    lineLabelWidth: 1,
    lineLabelColor: 'gray',
};
class LinePlot extends BasePlot {
    constructor(props) {
        super(props);
        this.pointLabels = {};
    }
    shouldInitializeChart() {
        if (this.props.data.length === 0)
            return false;
        return true;
    }
    onInitializeProperties() {
        this.linePlotConfig = mergeWithDefaults(DEFAULT_LINE_PLOT_CONFIG, this.props);
    }
    configureDomainAndScales() {
        const xValues = this.props.xKey
            ? this.props.data.map((d) => d[this.props.xKey])
            : [];
        const yValues = this.props.yKeys.flatMap((yKey) => this.props.data.map((d) => d[yKey]));
        this.domain = {
            x: this.domainManager.getDomainX(xValues),
            y: this.domainManager.getDomainY(yValues),
        };
        this.scale = {
            x: this.getDefaultScaleX(),
            y: this.getDefaultScaleY(),
            color: this.scaleManager.getColorScale(this.props.yKeys),
        };
    }
    draw() {
        for (let yKey of this.props.yKeys) {
            const key = yKey;
            const colorScale = this.scale.color;
            this.primitiveManager.addPath(this.props.data, (d) => d[this.props.xKey], (d) => d[key], {
                stroke: colorScale(key),
                strokeWidth: this.linePlotConfig.lineWidth,
                opacity: this.linePlotConfig.lineOpacity,
            });
        }
    }
    drawLegend() {
        if (this.props.yKeys.length > 1) {
            this.legendManager.addLegend(this.scale.color, 'line', {
                strokeWidth: 2,
            });
        }
    }
    setupLabels() {
        this.primitiveManager.createLayer('tooltips', 100);
        this.lineLabel = this.primitiveManager.addLine(0, 0, 0, 0, {
            stroke: this.linePlotConfig.lineLabelColor,
            strokeWidth: this.linePlotConfig.lineLabelWidth,
            strokeDashArray: '4,4',
            layerName: 'tooltips',
            className: 'line-label-tooltip',
            coordinateSystem: 'pixel',
        });
        this.pointLabels = {};
        const colorScale = this.scale.color;
        for (let yKey of this.props.yKeys) {
            const key = yKey;
            this.pointLabels[key] = this.primitiveManager.addPoint(0, 0, {
                size: 50,
                symbolType: d3.symbolCircle,
                fill: colorScale(key),
                stroke: 'white',
                strokeWidth: 1,
                layerName: 'tooltips',
                className: `point-label point-label-${key}`,
                coordinateSystem: 'data',
            });
        }
        this.lineLabel.hide();
        Object.values(this.pointLabels).forEach((p) => p.hide());
    }
    updateLabels(event) {
        const idx = this.locateNearestDataPoint(event, this.props.xKey);
        const d = this.props.data[idx];
        if (!d)
            return;
        const xVal = d[this.props.xKey];
        const xPos = this.scale.x(xVal);
        this.lineLabel.setCoords(xPos, 0, xPos, this.plotHeight).render();
        this.lineLabel.show();
        for (let yKey of this.props.yKeys) {
            const key = yKey;
            if (!isDefined(d[key]))
                continue;
            const pointLabel = this.pointLabels[key];
            if (pointLabel) {
                pointLabel
                    .setCoords(d[this.props.xKey], d[key])
                    .render();
                pointLabel.show();
            }
        }
    }
    locateNearestDataPoint(event, className) {
        const bisectCenter = d3.bisector((d) => d[className]).center;
        const xPos = d3.pointer(event, this.plot.node())[0];
        if (!isContinuousScale(this.scale.x)) {
            return 0;
        }
        const x0 = this.scale.x.invert(xPos);
        const i = bisectCenter(this.props.data, x0);
        return i;
    }
    drawTooltip() {
        this.setupLabels();
        // Explicitly cast interactionSurface to resolve TypeScript union type ambiguity
        // and "possibly undefined" errors inherited from BasePlot.
        // This is necessary because BasePlot defines interactionSurface as a union
        // of different Selection types, which can confuse method chaining in subclasses.
        const surface = this.interactionSurface;
        if (!surface)
            return;
        surface
            .on('mousemove', (event) => {
            var _a;
            if (this.brushManager && this.brushManager.brushing)
                return;
            this.updateLabels(event);
            const idx = this.locateNearestDataPoint(event, this.props.xKey);
            const d = this.props.data[idx];
            const tooltipDisplayKeys = (_a = this.config.tooltipConfig
                .tooltipKeys) !== null && _a !== void 0 ? _a : [
                this.props.xKey,
                ...this.props.yKeys,
            ];
            if (d) {
                this.tooltipManager.show(event, d, tooltipDisplayKeys);
            }
        })
            .on('mouseout', () => {
            this.hideTooltip();
        })
            .on('mousedown', () => {
            this.hideTooltip();
        });
    }
    hideTooltip() {
        if (this.lineLabel)
            this.lineLabel.hide();
        if (this.pointLabels) {
            Object.values(this.pointLabels).forEach((p) => p.hide());
        }
        this.tooltipManager.hide();
    }
    onSetupBrush() {
        if (!this.config.tooltipConfig.enabled)
            return;
        if (this.brushManager && this.brushManager.brush) {
            this.brushManager.brush.on('start.tooltip', () => {
                this.hideTooltip();
            });
        }
    }
}
export default LinePlot;
