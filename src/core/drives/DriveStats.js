class DriveStats {
    #sizeInBytes;
    #usageInBytes;

    constructor(path) {
        //get drive stats
        //this.#sizeInBytes = DriveStats.size;
        //this.#usageInBytes = DriveStats.usage;
    }

    get size() {
        return this.#sizeInBytes;
    }

    get free() {
        return this.sizeInBytes - this.usageInBytes;
    }

    get usage() {
        return this.#usageInBytes;
    }
}
