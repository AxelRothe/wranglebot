class MetaData {
    constructor(template = {}) {
        this.entries = {};
        for (let [key, value] of Object.entries(template)) {
            this.updateEntry(key, value);
        }
    }
    getEntry(index) {
        if (this.entries[index])
            return this.entries[index];
        return new Error("No such MetaData Entry: " + index);
    }
    get(key) {
        return this.getEntry(key);
    }
    updateEntry(index, value, upsert = true) {
        if (!this.entries[index] || upsert) {
            this.entries[index] = value;
        }
        else if (this.entries[index]) {
            this.entries[index] = value;
        }
    }
    set(key, value) {
        this.updateEntry(key, value);
    }
    update(metaDataEntries) {
        for (let [key, value] of Object.entries(metaDataEntries)) {
            this.updateEntry(key, value);
        }
    }
    removeEntry(index) {
        delete this.entries[index];
    }
    toJSON(options = {}) {
        let obj = {};
        Object.entries(this.entries).forEach(([key, value]) => {
            obj[key] = value;
        });
        return obj;
    }
}
export { MetaData };
//# sourceMappingURL=MetaData.js.map