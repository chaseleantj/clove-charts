import { DomainConfig, ScaleConfig } from './config';
export type DataValue = string | number | Date | null | undefined;
declare class DomainManager {
    private readonly domainConfig;
    private readonly scaleConfig;
    constructor(domainConfig: Required<DomainConfig>, scaleConfig: Required<ScaleConfig>);
    getDomain(values: string[], padding?: number): string[];
    getDomain(values: number[], padding?: number): [number, number];
    getDomain(values: Date[], padding?: number): [Date, Date];
    getDomainX(): [number, number];
    getDomainX(values: string[]): string[];
    getDomainX(values: number[]): [number, number];
    getDomainX(values: Date[]): [Date, Date];
    getDomainY(): [number, number];
    getDomainY(values: string[]): string[];
    getDomainY(values: number[]): [number, number];
    getDomainY(values: Date[]): [Date, Date];
    private getDateDomain;
    private getNumberDomain;
}
export default DomainManager;
