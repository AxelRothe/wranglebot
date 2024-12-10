export default class MetaLibraryData {
    constructor(rebuild = null) {
        if (rebuild !== null) {
            for (let [key, value] of Object.entries(rebuild)) {
                this.updateCol(key, value);
            }
        }
    }
    getCols() {
        return this;
    }
    updateCol(colID, value) {
        this[colID] = value;
        return true;
    }
    removeCol(colID) {
        delete this[colID];
        return true;
    }
}
//# sourceMappingURL=MetaLibraryData.js.map