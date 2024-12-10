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
var _MetaFile_hash;
import { v4 as uuidv4 } from "uuid";
import { SearchLite } from "searchlite";
import { MetaCopy } from "./MetaCopy.js";
import { MetaData } from "./MetaData.js";
import { Thumbnail } from "./Thumbnail.js";
import { finder } from "../system/index.js";
import DB from "../database/DB.js";
import { MLInterface } from "../analyse/MLInterface.js";
import CopyTool from "../media/CopyTool.js";
class MetaFile {
    constructor(options) {
        this.copies = [];
        _MetaFile_hash.set(this, void 0);
        this.thumbnails = [];
        if (!options.hash)
            throw new Error("No hash provided");
        __classPrivateFieldSet(this, _MetaFile_hash, options.hash || "NaN", "f");
        this.id = options.id || uuidv4();
        this.thumbnails = [];
        if (options.thumbnails) {
            for (let thumb of options.thumbnails) {
                const thumbnail = new Thumbnail(thumb);
                this.thumbnails.push(thumbnail);
            }
        }
        this.metaData = new MetaData(options.metaData) || new MetaData();
        if (!options.basename)
            throw new Error("No basename provided");
        if (options.basename.split(".").length < 2)
            throw new Error("Invalid basename");
        this.basename = options.basename;
        this.name = options.name || this.basename.split(".")[0];
        this.extension = options.extension || this.basename.split(".")[1];
        if (!options.size)
            throw new Error("No size provided");
        if (!options.fileType)
            throw new Error("No fileType provided");
        this.size = options.size;
        this.fileType = options.fileType;
        this.creationDate = options.creationDate ? new Date(options.creationDate) : new Date();
        this._hash = __classPrivateFieldGet(this, _MetaFile_hash, "f");
    }
    static fromFile(source) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!finder.existsSync(source))
                    throw new Error("File does not exist");
                const basename = finder.basename(source).toString();
                const cpt = new CopyTool({
                    hash: "xxhash64",
                });
                const hash = yield cpt.hashFile(source);
                const metaData = yield CopyTool.analyseFile(source);
                const size = finder.lstatSync(source).size;
                const newMf = new MetaFile({
                    hash,
                    metaData,
                    basename,
                    name: basename.substring(0, basename.lastIndexOf(".")),
                    size,
                    fileType: finder.getFileType(basename),
                    extension: finder.extname(basename),
                });
                newMf.addCopy(new MetaCopy({
                    pathToSource: source,
                    metafile: newMf,
                    hash,
                }));
                return newMf;
            }
            catch (e) {
                throw new Error("Could not create MetaFile from file: " + e.message);
            }
        });
    }
    getReachableCopies() {
        let reachableCopies = [];
        for (let copy of this.copies) {
            if (copy.isReachable()) {
                reachableCopies.push(copy);
            }
        }
        return reachableCopies;
    }
    get hash() {
        return __classPrivateFieldGet(this, _MetaFile_hash, "f");
    }
    update(document_1) {
        return __awaiter(this, arguments, void 0, function* (document, save = true) {
            if (document.metaData) {
                this.metaData.update(document.metaData);
            }
            if (document.thumbnails) {
                this.thumbnails = [];
                for (let thumb of document.thumbnails) {
                    if (thumb instanceof Object && thumb.id && thumb.data) {
                        this.addThumbnail(thumb);
                    }
                    else {
                        const thumbFromDB = DB().getOne("thumbnails", { id: thumb });
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
    addThumbnail(thumbnail) {
        if (!thumbnail.data)
            throw new Error("Thumbnail data is missing");
        if (!thumbnail.id)
            throw new Error("Thumbnail id is missing");
        const search = SearchLite.find(this.thumbnails, "id", thumbnail.id);
        if (search.wasFailure()) {
            const newThumbnail = new Thumbnail({
                id: thumbnail.id,
                data: thumbnail.data,
                metaFile: this,
            });
            this.thumbnails.push(newThumbnail);
            return newThumbnail;
        }
        else {
            search.result.data = thumbnail.data;
            return search.result;
        }
    }
    removeOneThumbnail(thumbnailId) {
        this.thumbnails = this.thumbnails.filter((thumbnail) => {
            if (thumbnail.id === thumbnailId) {
                finder.rmSync(finder.join(finder.getPathToUserData("thumbnails"), thumbnailId + ".jpg"));
                return false;
            }
            return true;
        });
    }
    updateMetaData(index, value) {
    }
    getMetaData(options = { table: false }) {
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
    addCopy(metaCopy) {
        for (let copy of this.copies) {
            if (copy.id === metaCopy.id) {
                copy = metaCopy;
                return 0;
            }
        }
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
            const search = SearchLite.find(this.copies, "id", metaCopyId);
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
            const search = SearchLite.find(this.thumbnails, by, thumbnailId);
            if (search.wasSuccess()) {
                return search.result;
            }
            throw new Error("Thumbnail not found");
        }
        else {
            throw new Error("No thumbnail id provided");
        }
    }
    getThumbnails(filters = {}) {
        const thumbs = this.thumbnails.map((thumbnail) => {
            thumbnail.metaFile = this;
            return thumbnail;
        });
        if (filters.$ids) {
            return thumbs.filter((thumbnail) => filters.$ids.includes(thumbnail.id));
        }
        return thumbs;
    }
    analyse(options) {
        if (options && options.frames) {
            return MLInterface().analyseFrames({
                engine: options.engine,
                prompt: options.prompt,
                frames: options.frames,
                metafile: this,
                temperature: options.temperature,
                max_tokens: options.max_tokens,
            });
        }
        throw new Error("No frames provided");
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
_MetaFile_hash = new WeakMap();
export { MetaFile };
//# sourceMappingURL=MetaFile.js.map