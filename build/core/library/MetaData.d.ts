declare class MetaData {
    entries: {};
    /**
     * @typedef {Object<string, string>} MetaDataTemplate
     */
    /**
     * Constructs a new MetaData object.
     *
     * @example
     * const metaData = new MetaData(MetaDataTemplate);
     *
     * @param {MetaDataTemplate} template
     */
    constructor(template?: {});
    /**
     * Returns the value of the given key
     *
     * @example
     * metaData.get("key")
     *
     * @param {String} index
     * @return {any}
     */
    getEntry(index: any): any;
    get(key: any): any;
    /**
     * Updates an Entry in the MetaData
     *
     * @example
     * metaData.updateEntry("foo", { value: "bar" }, false);
     *
     * @param {string} index
     * @param {string} value
     * @param {boolean} upsert
     */
    updateEntry(index: any, value: any, upsert?: boolean): void;
    set(key: any, value: any): void;
    update(metaDataEntries: any): void;
    /**
     * Removes an entry from the MetaData
     *
     * @example
     * metaData.removeEntry("production-company");
     *
     * @param {string} index
     */
    removeEntry(index: any): void;
    /**
     * Returns the MetaData as a JSON object
     *
     * @example
     * metaData.toJSON();
     *
     * @param {Object} options
     * @returns {Object<string,string>}
     */
    toJSON(options?: {}): {};
}
export { MetaData };
//# sourceMappingURL=MetaData.d.ts.map