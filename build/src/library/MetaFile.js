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
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _MetaFile_hash;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetaFile = void 0;
const uuid_1 = require("uuid");
const searchlite_1 = require("searchlite");
const MetaData_1 = require("./MetaData");
const Thumbnail_1 = require("./Thumbnail");
const system_1 = require("../system");
const DB_1 = __importDefault(require("../database/DB"));
const MLInterface_1 = require("../analyse/MLInterface");
class MetaFile {
    /**
     *
     * @param options {{hash:string, id?: string, metaData?: object, name: string, basename:string, thumbnails?: string[], size: number, fileType: string, extension: string, creationDate?: string}}
     */
    constructor(options) {
        this.copies = [];
        _MetaFile_hash.set(this, void 0);
        this.thumbnails = [];
        __classPrivateFieldSet(this, _MetaFile_hash, options.hash || "NaN", "f");
        this.id = options.id || (0, uuid_1.v4)();
        this.thumbnails = [];
        if (options.thumbnails) {
            for (let thumb of options.thumbnails) {
                const thumbnail = new Thumbnail_1.Thumbnail(thumb);
                this.thumbnails.push(thumbnail);
            }
        }
        this.metaData = new MetaData_1.MetaData(options.metaData) || new MetaData_1.MetaData();
        this.basename = options.basename || "NaN";
        this.name = options.name || this.basename.split(".")[0];
        this.size = options.size || 0;
        this.fileType = options.fileType || "NaN";
        this.extension = options.extension || "";
        this.creationDate = options.creationDate ? new Date(options.creationDate) : new Date();
        this._hash = __classPrivateFieldGet(this, _MetaFile_hash, "f");
    }
    /**
     * Get Hash
     * @return {string} hash
     */
    get hash() {
        return __classPrivateFieldGet(this, _MetaFile_hash, "f");
    }
    update(document, save = true) {
        return __awaiter(this, void 0, void 0, function* () {
            if (document.metaData) {
                this.metaData.update(document.metaData);
            }
            if (document.thumbnails) {
                this.thumbnails = []; //reset thumbnails
                for (let thumb of document.thumbnails) {
                    if (thumb instanceof Object && thumb.id && thumb.data) {
                        this.addThumbnail(thumb);
                    }
                    else {
                        const thumbFromDB = (0, DB_1.default)().getOne("thumbnails", { id: thumb });
                        if (thumbFromDB) {
                            this.addThumbnail(thumbFromDB);
                        }
                        else {
                            throw new Error("Thumbnail not found in database: " + thumb);
                        }
                    }
                }
            }
        });
    }
    /**
     *
     * @param thumbnail
     * @returns {Thumbnail}
     */
    addThumbnail(thumbnail) {
        if (!thumbnail.data)
            throw new Error("Thumbnail data is missing");
        if (!thumbnail.id)
            throw new Error("Thumbnail id is missing");
        // if (!thumbnail.frame) throw new Error("Thumbnail frame number is missing");
        const search = searchlite_1.SearchLite.find(this.thumbnails, "id", thumbnail.id);
        if (search.wasFailure()) {
            const newThumbnail = new Thumbnail_1.Thumbnail({
                id: thumbnail.id,
                data: thumbnail.data,
                metaFile: this,
            });
            this.thumbnails.push(newThumbnail);
            return newThumbnail;
        }
        else {
            // search.result.frame = thumbnail.frame;
            search.result.data = thumbnail.data;
            return search.result;
        }
    }
    /**
     * Removes a Thumbnail from the metafile and deletes its disk counterpart
     *
     * Does not remove the thumbnail from the database
     *
     * @param {string} thumbnailId
     * @returns {boolean} True if it was successful, false otherwise
     */
    removeOneThumbnail(thumbnailId) {
        this.thumbnails = this.thumbnails.filter((thumbnail) => {
            if (thumbnail.id === thumbnailId) {
                system_1.finder.rmSync(system_1.finder.join(system_1.finder.getPathToUserData("wranglebot"), "thumbnails", thumbnailId + ".jpg"));
                return false;
            }
            return true;
        });
    }
    /**
     *
     * @param {String} index
     * @param {String} value
     */
    updateMetaData(index, value) {
        //update MetaData here
    }
    getMetaData(options) {
        if (options.table) {
            let list = [];
            for (let [key, value] of Object.entries(this.metaData)) {
                list.push(value);
            }
            list.push(this.creationDate);
            return list;
        }
        return this.metaData;
    }
    /**
     *
     * @param {MetaCopy} metaCopy
     */
    addCopy(metaCopy) {
        for (let copy of this.copies) {
            if (copy.id === metaCopy.id) {
                copy = metaCopy;
                return 0;
            }
        }
        //if not found, add it
        this.copies.push(metaCopy);
        return 1;
    }
    dropCopy(metaCopy) {
        const index = this.copies.indexOf(metaCopy);
        if (index > -1) {
            this.copies.splice(index, 1);
            return -1;
        }
        return 0;
    }
    addCopies(copies) {
        for (let copy of copies) {
            this.addCopy(copy);
        }
    }
    getCopiesAs(type) {
        if (type === "array") {
            let list = [];
            for (let copy of this.copies) {
                list.push(copy.toJSON());
            }
            return list;
        }
        else if (type === "ids") {
            let list = [];
            for (let copy of this.copies) {
                list.push(copy.id);
            }
            return list;
        }
    }
    getMetaCopy(metaCopyId) {
        if (metaCopyId) {
            const search = searchlite_1.SearchLite.find(this.copies, "id", metaCopyId);
            if (search.wasSuccess()) {
                return search.result;
            }
            return null;
        }
        else if (this.copies.length > 0) {
            for (let copy of this.copies) {
                if (copy.isVerified() && copy.isReachable()) {
                    return copy;
                }
            }
        }
        else {
            return null;
        }
    }
    getThumbnail(thumbnailId, by = "id") {
        if (thumbnailId) {
            const search = searchlite_1.SearchLite.find(this.thumbnails, by, thumbnailId);
            if (search.wasSuccess()) {
                return search.result;
            }
            throw new Error("Thumbnail not found");
        }
        else {
            throw new Error("No thumbnail id provided");
        }
    }
    getThumbnails() {
        return this.thumbnails.map((thumbnail) => {
            thumbnail.metaFile = this;
            return thumbnail;
        });
    }
    analyse(options) {
        if (options && options.frames) {
            return (0, MLInterface_1.MLInterface)().analyseFrames({
                prompt: options.prompt,
                frames: options.frames,
                metafile: this,
            });
        }
    }
    toJSON(options = {}) {
        return {
            basename: this.basename,
            id: this.id,
            hash: __classPrivateFieldGet(this, _MetaFile_hash, "f"),
            creationDate: this.creationDate.toString(),
            name: this.name,
            fileType: this.fileType,
            extension: this.extension,
            size: this.size,
            metaData: this.metaData.toJSON(),
            copies: this.getCopiesAs("ids"),
            thumbnails: this.thumbnails.map((thumbnail) => thumbnail.id),
        };
    }
}
exports.MetaFile = MetaFile;
_MetaFile_hash = new WeakMap();
//# sourceMappingURL=MetaFile.js.map