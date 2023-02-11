"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
        return __awaiter(this, void 0, void 0, function* () {
            return {
                data: this.data,
                id: this.id,
                metaFile: this.metaFile ? this.metaFile.id : undefined,
            };
        });
    }
}
exports.Thumbnail = Thumbnail;
module.exports.Thumbnail = Thumbnail;
//# sourceMappingURL=Thumbnail.js.map