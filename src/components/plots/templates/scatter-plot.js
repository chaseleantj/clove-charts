import * as d3 from 'd3';

import BasePlot from '../common/base';
import { getDataType } from '../common/utils';

/**
 * Base Scatter Plot Component
 *
 * Additional props beyond BasePlot:
 * @param {Number} pointSize - Area of each point in pixels
 * @param {Number} pointOpacity - Opacity of scatter points
 * @param {String} colorByClass - Data field to color elements by
 */
class BaseScatterPlot extends BasePlot {
    static requiredProps = ['data', 'xClass', 'yClass'];

    static defaultProps = {
        ...BasePlot.defaultProps,
        pointSize: 50,
        pointOpacity: 1,
    };

    constructor(props) {
        super(props);
    }

    onSetupScales() {
        if (this.colorByClass) {
            this.domain.color = this.domain.getDomain(
                (d) => d[this.colorByClass]
            );
            this.scales.color = this.scales.getColorScale(this.domain.color);
        }
    }

    renderElements() {
        this.dataPoints = this.primitives.addPoints(
            this.data,
            (d) => d[this.xClass],
            (d) => d[this.yClass],
            {
                symbolType: d3.symbolCircle,
                fill: (d) => this.scales.color(d[this.colorByClass]),
                size: this.pointSize,
                opacity: this.pointOpacity,
                layerName: 'points',
                className: 'data-point',
                pointerEvents: 'auto',
            }
        );

        if (this.tooltipConfig.tooltipRef.current) {
            this.drawTooltip();
        }
        this.onRenderComplete();
    }

    onSetupLegend() {
        if (!this.colorByClass) return;

        this.legend.setTitle(this.legendTitle ?? this.colorByClass);

        const dtype = getDataType(this.domain.color);
        if (dtype === 'string') {
            this.legend.addCategoricalLegend();
            const classes = this.scales.color.domain();
            classes.forEach((cls) => {
                this.legend.addCategoricalItem(
                    'circle',
                    this.scales.color(cls),
                    cls
                );
            });
        } else if (dtype === 'number') {
            this.legend.addContinuousLegend(this.scales.color);
        }
    }

    drawTooltip() {
        const displayClasses = this.colorByClass
            ? [this.xClass, this.yClass, this.colorByClass]
            : [this.xClass, this.yClass];
        const tooltipDisplayClasses =
            this.tooltipConfig.tooltipClasses ?? displayClasses;

        this.dataPoints.elementSelection
            .on('mouseover', (event, d) => {
                if (!this.brush || !this.brush.brushing) {
                    const enlargedSize = 4 * this.pointSize;
                    const symbolGenerator = d3
                        .symbol()
                        .type(d3.symbolCircle)
                        .size(enlargedSize);

                    d3.select(event.target)
                        .transition()
                        .duration(this.themeConfig.transitionDuration / 4)
                        .attr('d', symbolGenerator);

                    this.tooltip.formatTooltip(d, tooltipDisplayClasses);
                    this.tooltip.positionTooltip(event);
                    this.tooltip.show();
                }
            })
            .on('mouseout', (event) => {
                if (!this.brush || !this.brush.brushing) {
                    const normalSize = this.pointSize;
                    const symbolGenerator = d3
                        .symbol()
                        .type(d3.symbolCircle)
                        .size(normalSize);

                    d3.select(event.target)
                        .transition()
                        .duration(this.themeConfig.transitionDuration / 4)
                        .attr('d', symbolGenerator);
                    this.tooltip.hide();
                }
            });

        this.interactionSurface.on('click', () => this.tooltip.hide());
    }
}

export default BaseScatterPlot;
