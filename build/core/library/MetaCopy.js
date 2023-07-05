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
var _MetaCopy_pathToSource, _MetaCopy_pathToBucket, _MetaCopy_hash;
import { v4 as uuidv4 } from "uuid";
import { finder } from "../system/index.js";
class MetaCopy {
    /**
     *
     * @param options
     */
    constructor(options) {
        this.label = "";
        _MetaCopy_pathToSource.set(this, void 0);
        _MetaCopy_pathToBucket.set(this, void 0);
        _MetaCopy_hash.set(this, "");
        this.id = options.id ? options.id : uuidv4();
        this.label = options.label || "";
        this.metaFile = options.metaFile || undefined;
        if (!options.pathToSource)
            throw new Error("No pathToSource provided");
        __classPrivateFieldSet(this, _MetaCopy_pathToSource, options.pathToSource, "f");
        __classPrivateFieldSet(this, _MetaCopy_pathToBucket, options.pathToBucket || __classPrivateFieldGet(this, _MetaCopy_pathToSource, "f"), "f");
        if (!options.hash)
            throw new Error("No hash provided");
        __classPrivateFieldSet(this, _MetaCopy_hash, options.hash, "f");
    }
    update(options, save = true) {
        this.label = options.label || this.label;
        __classPrivateFieldSet(this, _MetaCopy_pathToSource, options.pathToSource || __classPrivateFieldGet(this, _MetaCopy_pathToSource, "f"), "f");
        __classPrivateFieldSet(this, _MetaCopy_pathToBucket, options.pathToBucket || __classPrivateFieldGet(this, _MetaCopy_pathToBucket, "f"), "f");
        __classPrivateFieldSet(this, _MetaCopy_hash, options.hash || __classPrivateFieldGet(this, _MetaCopy_hash, "f"), "f");
    }
    get pathToSource() {
        return __classPrivateFieldGet(this, _MetaCopy_pathToSource, "f");
    }
    get pathToBucket() {
        return {
            folder: finder.dirname(__classPrivateFieldGet(this, _MetaCopy_pathToBucket, "f")),
            file: __classPrivateFieldGet(this, _MetaCopy_pathToBucket, "f"),
        };
    }
    verify(hash) {
        __classPrivateFieldSet(this, _MetaCopy_hash, hash, "f");
        return this.metaFile.hash === __classPrivateFieldGet(this, _MetaCopy_hash, "f");
    }
    get hash() {
        return __classPrivateFieldGet(this, _MetaCopy_hash, "f");
    }
    /**
     * Is true if both the hash of the MetaCopy and the MetaFile match
     * @return {boolean}
     */
    isVerified() {
        return this.hash === this.metaFile.hash;
    }
    isReachable() {
        return finder.existsSync(this.pathToBucket.file);
    }
    toJSON(options = {
        db: false,
    }) {
        return {
            id: this.id,
            label: this.label,
            pathToSource: __classPrivateFieldGet(this, _MetaCopy_pathToSource, "f"),
            pathToBucket: __classPrivateFieldGet(this, _MetaCopy_pathToBucket, "f"),
            hash: __classPrivateFieldGet(this, _MetaCopy_hash, "f"),
            reachable: !options.db ? this.isReachable() : undefined,
        };
    }
}
_MetaCopy_pathToSource = new WeakMap(), _MetaCopy_pathToBucket = new WeakMap(), _MetaCopy_hash = new WeakMap();
export { MetaCopy };
//# sourceMappingURL=MetaCopy.js.map