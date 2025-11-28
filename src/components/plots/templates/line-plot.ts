import * as d3 from 'd3';

import BasePlot, {
    BasePlotProps,
    DataKey,
    Scale,
} from '@/components/plots/common/base-plot';
import { isDefined } from '@/components/plots/common/type-guards';
import { isContinuousScale } from '@/components/plots/common/scale-manager';
import {
    LinePrimitive,
    PointPrimitive,
} from '@/components/plots/common/primitives/primitives';
import { mergeWithDefaults } from '@/components/plots/common/template-config';

export interface LinePlotConfig {
    lineWidth: number;
    lineOpacity: number;
    lineLabelWidth: number;
    lineLabelColor: string;
}

export interface LinePlotProps<
    TData extends Record<string, any> = Record<string, any>,
> extends Omit<BasePlotProps<TData>, 'yKey'>,
        Partial<LinePlotConfig> {
    data: TData[];
    xKey: DataKey<TData>;
    yKeys: DataKey<TData>[];
}

interface LinePlotScale extends Scale {
    color?: d3.ScaleOrdinal<string, string> | d3.ScaleSequential<string, never>;
}

export const DEFAULT_LINE_PLOT_CONFIG: LinePlotConfig = {
    lineWidth: 1.5,
    lineOpacity: 1,
    lineLabelWidth: 1,
    lineLabelColor: 'gray',
};

class LinePlot<
    TData extends Record<string, any> = Record<string, any>,
> extends BasePlot<TData> {
    declare props: LinePlotProps<TData>;
    linePlotConfig!: LinePlotConfig;
    declare scale: LinePlotScale;

    // Primitives for interaction
    lineLabel!: LinePrimitive;
    pointLabels: Record<string, PointPrimitive> = {};

    constructor(props: LinePlotProps<TData>) {
        super(props);
    }

    shouldInitializeChart(): boolean {
        if (this.props.data.length === 0) return false;
        return true;
    }

    onInitializeProperties(): void {
        this.linePlotConfig = mergeWithDefaults(
            DEFAULT_LINE_PLOT_CONFIG,
            this.props
        );
    }

    protected configureDomainAndScales(): void {
        const xValues = this.props.xKey
            ? this.props.data.map((d) => d[this.props.xKey])
            : [];
        const yValues = this.props.yKeys.flatMap((yKey) =>
            this.props.data.map((d) => d[yKey])
        );

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

    draw(): void {
        for (let yKey of this.props.yKeys) {
            const key = yKey as string;
            const colorScale = this.scale.color as d3.ScaleOrdinal<
                string,
                string
            >;

            this.primitiveManager.addPath(
                this.props.data,
                (d) => d[this.props.xKey as string],
                (d) => d[key],
                {
                    stroke: colorScale(key),
                    strokeWidth: this.linePlotConfig.lineWidth,
                    opacity: this.linePlotConfig.lineOpacity,
                }
            );
        }
    }

    drawLegend(): void {
        if (this.props.yKeys.length > 1) {
            this.legendManager.addLegend(
                this.scale.color as d3.ScaleOrdinal<string, string>,
                'line',
                {
                    strokeWidth: 2,
                }
            );
        }
    }

    setupLabels(): void {
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
        const colorScale = this.scale.color as d3.ScaleOrdinal<string, string>;

        for (let yKey of this.props.yKeys) {
            const key = yKey as string;
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

    updateLabels(event: any): void {
        const idx = this.locateNearestDataPoint(
            event,
            this.props.xKey as string
        );
        const d = this.props.data[idx];

        if (!d) return;

        const xVal = d[this.props.xKey as string];
        const xPos = (this.scale.x as d3.ScaleLinear<number, number>)(xVal);

        this.lineLabel.setCoords(xPos, 0, xPos, this.plotHeight).render();

        this.lineLabel.show();

        for (let yKey of this.props.yKeys) {
            const key = yKey as string;
            if (!isDefined(d[key])) continue;
            const pointLabel = this.pointLabels[key];
            if (pointLabel) {
                pointLabel
                    .setCoords(d[this.props.xKey as string], d[key])
                    .render();
                pointLabel.show();
            }
        }
    }

    locateNearestDataPoint(event: any, className: string) {
        const bisectCenter = d3.bisector((d: any) => d[className]).center;
        const xPos = d3.pointer(event, this.plot.node())[0];

        if (!isContinuousScale(this.scale.x)) {
            return 0;
        }
        const x0 = this.scale.x.invert(xPos);

        const i = bisectCenter(this.props.data, x0);
        return i;
    }

    drawTooltip(): void {
        this.setupLabels();

        // Explicitly cast interactionSurface to resolve TypeScript union type ambiguity
        // and "possibly undefined" errors inherited from BasePlot.
        // This is necessary because BasePlot defines interactionSurface as a union
        // of different Selection types, which can confuse method chaining in subclasses.
        const surface = this.interactionSurface as unknown as d3.Selection<
            SVGRectElement,
            unknown,
            null,
            undefined
        >;

        if (!surface) return;

        surface
            .on('mousemove', (event) => {
                if (this.brushManager && this.brushManager.brushing) return;

                this.updateLabels(event);

                const idx = this.locateNearestDataPoint(
                    event,
                    this.props.xKey as string
                );
                const d = this.props.data[idx];

                const tooltipDisplayKeys = this.config.tooltipConfig
                    .tooltipKeys ?? [
                    this.props.xKey as string,
                    ...(this.props.yKeys as string[]),
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
        if (this.lineLabel) this.lineLabel.hide();
        if (this.pointLabels) {
            Object.values(this.pointLabels).forEach((p) => p.hide());
        }
        this.tooltipManager.hide();
    }

    onSetupBrush() {
        if (!this.config.tooltipConfig.enabled) return;
        if (this.brushManager && this.brushManager.brush) {
            this.brushManager.brush.on('start.tooltip', () => {
                this.hideTooltip();
            });
        }
    }
}

export default LinePlot;
