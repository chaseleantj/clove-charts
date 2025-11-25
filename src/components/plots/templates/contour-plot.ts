import * as d3 from 'd3';

import BasePlot, {
    BasePlotProps,
    Scale,
} from '@/components/plots/common/base-plot';

export interface ContourPlotConfig {
    func: (x: number, y: number) => number;
    resolutionX: number;
    resolutionY: number;
    thresholds: number;
    strokeColor: string;
    shadeContour: boolean;
}

export interface ContourPlotProps
    extends BasePlotProps,
        Partial<ContourPlotConfig> {
    func: (x: number, y: number) => number;
}

interface ContourPlotDomain {
    x: [number, number];
    y: [number, number];
    color?: [number, number]
}

interface ContourPlotScale extends Scale {
    color?: d3.ScaleSequential<string, never> | ((t: number) => string);
}

export const DEFAULT_CONTOUR_PLOT_CONFIG: Omit<ContourPlotConfig, 'func'> = {
    resolutionX: 32,
    resolutionY: 32,
    thresholds: 10,
    strokeColor: 'currentColor',
    shadeContour: true,
};

export function getContourPlotConfig(
    props: ContourPlotProps
): ContourPlotConfig {
    return {
        func: props.func,
        resolutionX:
            props.resolutionX ?? DEFAULT_CONTOUR_PLOT_CONFIG.resolutionX,
        resolutionY:
            props.resolutionY ?? DEFAULT_CONTOUR_PLOT_CONFIG.resolutionY,
        thresholds: props.thresholds ?? DEFAULT_CONTOUR_PLOT_CONFIG.thresholds,
        strokeColor:
            props.strokeColor ?? DEFAULT_CONTOUR_PLOT_CONFIG.strokeColor,
        shadeContour:
            props.shadeContour ?? DEFAULT_CONTOUR_PLOT_CONFIG.shadeContour,
    };
}

class BaseContourPlot extends BasePlot {
    declare domain: ContourPlotDomain;
    declare scale: ContourPlotScale;
    declare props: ContourPlotProps;

    contourPlotConfig: ContourPlotConfig;
    fValues: number[];
    xRange: number[];
    yRange: number[];

    constructor(props: ContourPlotProps) {
        super(props);
        this.contourPlotConfig = getContourPlotConfig(props);
        this.fValues = [];
        this.xRange = [];
        this.yRange = [];
    }
    
    onInitializeProperties(): void {
        this.contourPlotConfig = getContourPlotConfig(this.props);
    }

    protected configureDomainAndScales(): void {
        this.domain = {
            x: this.domainManager.getDomainX() as [number, number],
            y: this.domainManager.getDomainY() as [number, number]
        };
        
        this.scale = this.getDefaultScales();

        // Calculate padding equal to one threshold step
        const xPadding =
            (this.domain.x[1] - this.domain.x[0]) /
            this.contourPlotConfig.thresholds;
        const yPadding =
            (this.domain.y[1] - this.domain.y[0]) /
            this.contourPlotConfig.thresholds;

        // Generate grid points with padding to avoid rendering artifacts at the edges
        this.xRange = this.linspace(
            this.domain.x[0] - xPadding,
            this.domain.x[1] + xPadding,
            this.contourPlotConfig.resolutionX
        );
        this.yRange = this.linspace(
            this.domain.y[0] - yPadding,
            this.domain.y[1] + yPadding,
            this.contourPlotConfig.resolutionY
        );

        this.fValues = [];
        for (let j = 0; j < this.contourPlotConfig.resolutionY; j++) {
            for (let i = 0; i < this.contourPlotConfig.resolutionX; i++) {
                this.fValues.push(
                    this.contourPlotConfig.func(this.xRange[i], this.yRange[j])
                );
            }
        }

        if (this.contourPlotConfig.shadeContour) {
            this.domain.color = this.domainManager.getDomain(this.fValues) as [number, number];
            this.scale.color = this.scaleManager.getColorScale(this.domain.color,
            ) as d3.ScaleSequential<string, never>;
        }

    }

    draw() {
        this.primitiveManager.addContour(this.fValues, this.xRange, this.yRange, {
            colorScale: this.scale.color ?? undefined,
            thresholds: this.contourPlotConfig.thresholds,
            stroke: this.contourPlotConfig.strokeColor,
        });
    }

    drawLegend() {
        if (this.config.legendConfig.title) {
            this.legendManager.setTitle(this.config.legendConfig.title);
        }

        if (this.contourPlotConfig.shadeContour) {
            this.legendManager.addContinuousLegend(
                this.scale.color as d3.ScaleSequential<string, never>
            );
        }
    }

    private linspace(start: number, end: number, num: number): number[] {
        return Array.from(
            { length: num },
            (_, i) => start + (end - start) * (i / (num - 1))
        );
    }
}

export default BaseContourPlot;
