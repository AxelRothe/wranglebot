declare class FilterMask {
    private readonly filters;
    readonly transform: Function;
    constructor(props: string[], transform?: Function);
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
    private parsedMetaData;
    static getColumnNames(): any;
    static getColumns(): any;
    private extract;
    parse(raw: any): {};
}
declare const _default: Scraper;
export default _default;
export { Scraper };
//# sourceMappingURL=Scraper.d.ts.map