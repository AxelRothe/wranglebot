export class CopyBucket {
    constructor(options: any);
    pathElements: any[];
    active: boolean;
    label: string;
    _id: string;
    id: any;
    query: any;
    drive: null;
    setDatabaseRefID(value: any): void;
    /**
     * Assembles a string with handlebars of the buckets path elements
     * Always adds a preceding "/"
     * @return {string}
     */
    buildPath(): string;
    /**
     * @deprecated
     * use buildPath() instead
     * @return {string}
     */
    getRawPath(): string;
    /**
     * Returns a compiled path of the Bucket
     *
     * @param {{
     *    [key: string]: string
     *  }} fillIns Pass key:value pair
     * @return {string} the compiled string
     */
    locate(fillIns: {
        [key: string]: string;
    }): string;
    /**
     * compiles a string with handlebars
     * @param {string} str
     * @param {{
     *    [key: string]: string
     *  }} fillIns Pass key:value pair
     * @return {string}
     */
    compile(str: string, fillIns: {
        [key: string]: string;
    }): string;
    /**
     * Returns a version of the Bucket that can be passed to database
     *
     * @return {{pathElements: string[], active: boolean, id: String, label: string}}
     */
    prepareForDB(): {
        pathElements: string[];
        active: boolean;
        id: string;
        label: string;
    };
    toJSON(drops?: {}): Promise<{
        path: string;
        raw: string;
        mounted: boolean;
        disk: any;
        pathElements: string[];
        active: boolean;
        id: string;
        label: string;
    }>;
}
//# sourceMappingURL=CopyBucket.d.ts.map