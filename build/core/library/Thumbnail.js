"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Thumbnail = void 0;
class Thumbnail {
    constructor(thumb) {
        this.data = undefined;
        this.metaFile = undefined;
        this.id = thumb.id;
        this.data = thumb.data;
        this.metaFile = thumb.metaFile;
    }
    toJSON() {
        return {
            data: this.data,
            id: this.id,
            metaFile: this.metaFile ? this.metaFile.id : undefined,
        };
    }
}
exports.Thumbnail = Thumbnail;
//# sourceMappingURL=Thumbnail.js.map