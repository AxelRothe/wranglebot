declare class FilterMask {
    private readonly filters;
    constructor(...args: any[]);
    getFilters(): any[];
}
declare class Scraper {
    static EXTRACT_VIDEO: string;
    static EXTRACT_AUDIO: string;
    static availableColumns: {
        video: {
            id: string;
            name: string;
            mask: FilterMask;
        }[];
        audio: {
            id: string;
            name: string;
            mask: FilterMask;
        }[];
    };
    parsedMetaData: {};
    getColumnNames(): any;
    getColumns(): any;
    parse(rawMetaData: any): {};
    extract(extractor: any, entry: any, rawMetaData: any): unknown;
}
declare const _default: Scraper;
export default _default;
//# sourceMappingURL=Scraper.d.ts.map