import * as d3 from 'd3';
import { LegendConfig } from './config';
interface PointStyles {
    size?: number;
    symbolType?: d3.SymbolType;
    opacity?: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
}
interface LineStyles {
    opacity?: number;
    stroke?: string;
    strokeWidth?: number;
    strokeDashArray?: string;
}
interface RectStyles {
    opacity?: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
}
type StyleForType<T extends 'point' | 'line' | 'rect'> = T extends 'point' ? PointStyles : T extends 'line' ? LineStyles : T extends 'rect' ? RectStyles : never;
declare class LegendManager {
    private readonly legendConfig;
    container: d3.Selection<HTMLDivElement, unknown, null, undefined>;
    gradientId: string;
    constructor(legendConfig: Required<LegendConfig>, containerNode: HTMLDivElement);
    setTitle(title?: string): void;
    addLegend<T extends 'point' | 'line' | 'rect'>(scale: d3.ScaleOrdinal<string, string> | d3.ScaleSequential<string, never>, type: T, options?: StyleForType<T>): void;
    addCategoricalItem<T extends 'point' | 'line' | 'rect'>(type: T, label: string, itemStyles: StyleForType<T>): void;
    addContinuousLegend(colorScale: d3.ScaleSequential<string, never>): void;
    clearLegend(): void;
}
export default LegendManager;
