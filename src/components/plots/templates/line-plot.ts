import * as d3 from 'd3';

import BasePlot, {
    BasePlotProps,
    DataKey,
    Scale,
} from '@/components/plots/common/base-plot';
import { isDateValue, isDefined } from '@/components/plots/common/type-guards';
import { isContinuousScale } from '@/components/plots/common/scale-manager';
import {
    LinePrimitive,
    PointPrimitive,
} from '@/components/plots/common/primitives/primitives';

export interface LinePlotConfig {
    lineWidth: number;
    lineOpacity: number;
    lineLabelWidth: number;
    lineLabelColor: string;
}

export interface LinePlotProps<
    TData extends Record<string, any> = Record<string, any>,
> extends Omit<BasePlotProps<TData>, 'yClass'>,
        Partial<LinePlotConfig> {
    data: TData[];
    xClass: DataKey<TData>;
    yClass: DataKey<TData>[];
}

interface LinePlotScale extends Scale {
    color:
        | d3.ScaleOrdinal<string, string>
        | d3.ScaleSequential<string, never>
        | string;
}

export const DEFAULT_LINE_PLOT_CONFIG: LinePlotConfig = {
    lineWidth: 1.5,
    lineOpacity: 1,
    lineLabelWidth: 1,
    lineLabelColor: 'gray',
};

export function getLinePlotConfig<TData extends Record<string, any>>(
    props: LinePlotProps<TData>
): LinePlotConfig {
    return {
        lineWidth: props.lineWidth ?? DEFAULT_LINE_PLOT_CONFIG.lineWidth,
        lineOpacity: props.lineOpacity ?? DEFAULT_LINE_PLOT_CONFIG.lineOpacity,
        lineLabelWidth:
            props.lineLabelWidth ?? DEFAULT_LINE_PLOT_CONFIG.lineLabelWidth,
        lineLabelColor:
            props.lineLabelColor ?? DEFAULT_LINE_PLOT_CONFIG.lineLabelColor,
    };
}

class BaseLinePlot<
    TData extends Record<string, any> = Record<string, any>,
> extends BasePlot<TData> {
    // @ts-ignore: Overriding yClass to be an array, which is incompatible with BasePlotProps
    declare props: LinePlotProps<TData>;
    linePlotConfig!: LinePlotConfig;
    declare scale: LinePlotScale;

    // Primitives for interaction
    lineLabel!: LinePrimitive;
    pointLabels: Record<string, PointPrimitive> = {};

    constructor(props: LinePlotProps<TData>) {
        // BasePlot expects yClass as single DataKey, but we passed array.
        // We rely on Omit and type assertion to satisfy TS, and override behavior at runtime.
        super(props as any);
    }

    shouldInitializeChart(): boolean {
        if (this.props.data.length === 0) return false;
        if (!this.props.yClass || this.props.yClass.length === 0) {
            console.warn(
                "BaseLinePlot: Must provide 'yClass' as an array of keys"
            );
            return false;
        }
        return true;
    }

    onInitializeProperties(): void {
        this.linePlotConfig = getLinePlotConfig(this.props);
    }

    onSetupDomain(): void {

        if (this.config.domainConfig.domainY) {
            this.domain.y = this.config.domainConfig.domainY;
            return;
        }

        const yPadding = this.config.scaleConfig.logY
            ? 0
            : this.config.domainConfig.paddingY;

        const yValues = this.props.yClass
            .map((yClass) =>
                this.domainManager.getDomain(
                    (d) => d[yClass as string],
                    yPadding
                )
            )
            .flat();

        // Calculate min/max across all Y series
        const isDate = yValues.some((v) => isDateValue(v));

        if (isDate) {
            const dates = yValues.map((v) => new Date(v as any)); // Force cast for safety, though isDateValue checks
            const min = new Date(Math.min(...dates.map((d) => d.getTime())));
            const max = new Date(Math.max(...dates.map((d) => d.getTime())));
            this.domain.y = [min, max];
        } else {
            const nums = yValues as unknown as number[];
            this.domain.y = [Math.min(...nums), Math.max(...nums)];
        }
    }

    onSetupScales(): void {
        this.scale.color = this.scaleManager.getColorScale(
            this.props.yClass as string[],
            this.config.colorConfig.categoricalColorScheme
        );
    }

    renderElements(): void {
        for (let yClass of this.props.yClass) {
            const key = yClass as string;
            const colorScale = this.scale.color as d3.ScaleOrdinal<
                string,
                string
            >;

            this.primitives.addPath(
                this.props.data,
                (d) => d[this.props.xClass as string],
                (d) => d[key],
                {
                    stroke: colorScale(key),
                    strokeWidth: this.linePlotConfig.lineWidth,
                    opacity: this.linePlotConfig.lineOpacity,
                    layerName: 'lines',
                    className: `line-plot line-plot-${key}`,
                }
            );
        }
    }

    onSetupLegend(): void {
        if (this.props.yClass.length > 1) {
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
        this.primitives.createLayer('tooltips', 100);

        this.lineLabel = this.primitives.addLine(0, 0, 0, 0, {
            stroke: this.linePlotConfig.lineLabelColor,
            strokeWidth: this.linePlotConfig.lineLabelWidth,
            strokeDashArray: '4,4',
            layerName: 'tooltips',
            className: 'line-label-tooltip',
            coordinateSystem: 'pixel',
        });

        this.pointLabels = {};
        const colorScale = this.scale.color as d3.ScaleOrdinal<string, string>;

        for (let yClass of this.props.yClass) {
            const key = yClass as string;
            this.pointLabels[key] = this.primitives.addPoint(0, 0, {
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
            this.props.xClass as string
        );
        const d = this.props.data[idx];

        if (!d) return;

        const xVal = d[this.props.xClass as string];
        const xPos = (this.scale.x as d3.ScaleLinear<number, number>)(xVal);

        this.lineLabel.setCoords(xPos, 0, xPos, this.plotHeight).render();

        this.lineLabel.show();

        for (let yClass of this.props.yClass) {
            const key = yClass as string;
            if (!isDefined(d[key])) continue;
            const pointLabel = this.pointLabels[key];
            if (pointLabel) {
                pointLabel
                    .setCoords(d[this.props.xClass as string], d[key])
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

    onSetupTooltip(): void {
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
                    this.props.xClass as string
                );
                const d = this.props.data[idx];

                const tooltipDisplayClasses = this.config.tooltipConfig
                    .tooltipClasses ?? [
                    this.props.xClass as string,
                    ...(this.props.yClass as string[]),
                ];

                if (d) {
                    this.tooltipManager.formatTooltip(d, tooltipDisplayClasses);
                    this.tooltipManager.positionTooltip(event);
                    this.tooltipManager.showTooltip();
                }
            })
            .on('mouseout', () => {
                this.hideTooltip();
            });
    }

    hideTooltip() {
        if (this.lineLabel) this.lineLabel.hide();
        if (this.pointLabels) {
            Object.values(this.pointLabels).forEach((p) => p.hide());
        }
        this.tooltipManager.hideTooltip();
    }

    onSetupBrush() {
        if (!this.config.tooltipConfig.tooltipRef.current) return;
        if (this.brushManager && this.brushManager.brush) {
            this.brushManager.brush.on('start.tooltip', () => {
                this.hideTooltip();
            });
        }
    }
}

export default BaseLinePlot;

