import * as d3 from 'd3';

import BasePlot from '../common/base';
import { isDateValue, isDefined } from '../common/value-type-guards';

/**
 * Base Line Plot Component
 *
 * Additional props beyond BasePlot:
 * @param {Array} yClasses - An array of lines to be plotted
 * @param {Number} lineWidth - Stroke width of line
 */
class BaseLinePlot extends BasePlot {
    static requiredProps = ['data', 'xClass'];

    static defaultProps = {
        ...BasePlot.defaultProps,
        lineWidth: 1.5,
        lineOpacity: 1,
        lineLabelWidth: 1,
        lineLabelColor: 'gray',
    };

    constructor(props) {
        super(props);
    }

    shouldInitializeChart() {
        // First run the base validation
        if (!super.shouldInitializeChart()) {
            return false;
        }

        // Additional validation: must have either yClass or yClasses
        if (!this.props.yClass && !this.props.yClasses) {
            console.warn(
                "BaseLinePlot: Must provide either 'yClass' or 'yClasses' prop"
            );
            return false;
        }

        return true;
    }

    onInitializeProperties() {
        this.yClasses = this.yClasses ?? [this.yClass];
    }

    renderElements() {
        for (let yClass of this.yClasses) {
            const path = this.primitives.addPath(
                this.data,
                (d) => d[this.xClass],
                (d) => d[yClass],
                {
                    stroke: this.scales.color(yClass),
                    strokeWidth: this.lineWidth,
                    // strokeDashArray: `${this.data.length},${this.data.length}`,
                    // strokeDashOffset: this.data.length,
                    opacity: this.lineOpacity,
                    layerName: 'lines',
                    className: `line-plot line-plot-${yClass}`,
                }
            );

            // path.setStyles({
            //   strokeDashOffset: 0
            // }).render(10000);
        }
    }

    onSetupDomain() {
        const yPadding = this.scaleConfig.logY
            ? 0
            : (this.paddingY ?? this.themeConfig.padding);
        const yValues = this.yClasses
            .map((yClass) => this.domain.getDomain((d) => d[yClass], yPadding))
            .flat();
        this.domain.y = this.domainY ?? [
            Math.min(...yValues),
            Math.max(...yValues),
        ];

        const firstDefinedValue = this.data
            .map((d) => d[this.yClasses[0]])
            .find((value) => isDefined(value));

        if (isDateValue(firstDefinedValue)) {
            this.domain.y = [
                new Date(this.domain.y[0]),
                new Date(this.domain.y[1]),
            ];
        }
    }

    onSetupScales() {
        this.scales.color = this.scales.getColorScale(
            this.yClasses,
            this.colorConfig.categoricalColorScheme
        );
    }

    onSetupLegend() {
        if (this.yClasses.length > 1) {
            this.legend.addCategoricalLegend();
            this.yClasses.forEach((yClass) => {
                this.legend.addCategoricalItem(
                    'line',
                    this.scales.color(yClass),
                    yClass
                );
            });
        }
    }

    locateNearestDataPoint(event, className) {
        const bisectCenter = d3.bisector((d) => d[className]).center;
        const xPos = d3.pointer(event, this.plot.node())[0];
        const x0 = this.scales.x.invert(xPos);
        const i = bisectCenter(this.data, x0);
        return i;
    }

    setupLabels() {
        this.primitives.createLayer('tooltips', 100);

        this.lineLabel = this.primitives.addLine(0, 0, 0, 0, {
            stroke: this.lineLabelColor,
            strokeWidth: this.lineLabelWidth,
            strokeDashArray: '4,4',
            layerName: 'tooltips',
            className: 'line-label-tooltip',
            coordinateSystem: 'pixel',
        });

        this.pointLabels = {};
        for (let yClass of this.yClasses) {
            this.pointLabels[yClass] = this.primitives.addPoint(0, 0, {
                size: 50,
                symbolType: d3.symbolCircle,
                fill: this.scales.color(yClass),
                stroke: 'white',
                strokeWidth: 1,
                layerName: 'tooltips',
                className: `point-label point-label-${yClass}`,
                coordinateSystem: 'data',
            });
        }
    }

    updateLabels(event) {
        const d = this.data[this.locateNearestDataPoint(event, this.xClass)];

        this.lineLabel
            .setCoords(
                this.scales.x(d[this.xClass]),
                0,
                this.scales.x(d[this.xClass]),
                this.plotHeight
            )
            .render();

        this.lineLabel.show();

        for (let yClass of this.yClasses) {
            if (d[yClass] == undefined) continue;
            const pointLabel = this.pointLabels[yClass];
            if (pointLabel) {
                pointLabel.setCoords(d[this.xClass], d[yClass]).render();
                pointLabel.show();
            }
        }
    }

    onSetupBrush() {
        if (!this.tooltipConfig.tooltipRef.current) return;
        this.brush.brush.on('start.tooltip', () => {
            this.hideTooltip();
        });
    }

    onSetupTooltip() {
        this.setupLabels();

        this.interactionSurface
            .on('mousemove', (event) => {
                if (this.brush && this.brush.brushing) return;

                this.updateLabels(event);

                const d =
                    this.data[this.locateNearestDataPoint(event, this.xClass)];
                const tooltipDisplayClasses = this.tooltipConfig
                    .tooltipClasses ?? [this.xClass, ...this.yClasses];
                if (d) {
                    this.tooltip.formatTooltip(d, tooltipDisplayClasses);
                    this.tooltip.positionTooltip(event);
                    this.tooltip.show();
                }
            })
            .on('mouseout', () => {
                this.hideTooltip();
            });
    }

    hideTooltip() {
        this.lineLabel.hide();

        for (let yClass of this.yClasses) {
            const pointLabel = this.pointLabels[yClass];
            if (pointLabel) {
                pointLabel.hide();
            }
        }

        this.tooltip.hide();
    }
}

export default BaseLinePlot;
