"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _DriveStats_sizeInBytes, _DriveStats_usageInBytes;
class DriveStats {
    constructor(path) {
        _DriveStats_sizeInBytes.set(this, void 0);
        _DriveStats_usageInBytes.set(this, void 0);
        //get drive stats
        //this.#sizeInBytes = DriveStats.size;
        //this.#usageInBytes = DriveStats.usage;
    }
    get size() {
        return __classPrivateFieldGet(this, _DriveStats_sizeInBytes, "f");
    }
    get free() {
        return this.sizeInBytes - this.usageInBytes;
    }
    get usage() {
        return __classPrivateFieldGet(this, _DriveStats_usageInBytes, "f");
    }
}
_DriveStats_sizeInBytes = new WeakMap(), _DriveStats_usageInBytes = new WeakMap();
//# sourceMappingURL=DriveStats.js.map