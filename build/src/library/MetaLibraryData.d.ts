export default class MetaLibraryData {
    constructor(rebuild?: object | null);
    getCols(): this;
    /**
     *
     * @param {String} colID
     * @param {Number, String, Date} value
     */
    updateCol(colID: any, value: any): boolean;
    removeCol(colID: any): boolean;
}
//# sourceMappingURL=MetaLibraryData.d.ts.map