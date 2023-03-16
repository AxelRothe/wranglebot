"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Thumbnail = void 0;
const { finder, config } = require("../system");
const DB = require("../database/DB");
class Thumbnail {
    constructor(thumb) {
        this.data = undefined;
        this.metaFile = undefined;
        this.id = thumb.id;
        this.data = thumb.data;
        this.metaFile = thumb.metaFile;
    }
    /**
     *
     * @returns {Promise<{data: string, id: string}>}
     */
    toJSON() {
        return {
            data: this.data,
            id: this.id,
            metaFile: this.metaFile ? this.metaFile.id : undefined,
        };
    }
}
exports.Thumbnail = Thumbnail;
module.exports.Thumbnail = Thumbnail;
//# sourceMappingURL=Thumbnail.js.map