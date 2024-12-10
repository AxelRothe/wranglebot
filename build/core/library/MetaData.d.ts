declare class MetaData {
    entries: {};
    constructor(template?: {});
    getEntry(index: any): any;
    get(key: any): any;
    updateEntry(index: any, value: any, upsert?: boolean): void;
    set(key: any, value: any): void;
    update(metaDataEntries: any): void;
    removeEntry(index: any): void;
    toJSON(options?: {}): {};
}
export { MetaData };
//# sourceMappingURL=MetaData.d.ts.map