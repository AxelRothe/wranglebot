"use strict";
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
var _MetaDataEntry_index;
const { Blockchain } = require("../blockchain");
const { config } = require("../system");
class MetaDataEntry {
    constructor(index, options) {
        _MetaDataEntry_index.set(this, void 0);
        __classPrivateFieldSet(this, _MetaDataEntry_index, index || "NaN", "f");
        // this.value = options.value || "";
        this.blockchain = options.blockchain
            ? new Blockchain({
                chain: options.blockchain,
            })
            : new Blockchain({
                init: {
                    value: options.value,
                    changed: Date.now(),
                    by: config.get("deviceId"),
                },
            });
        // this.lastChanged = options.lastChanged || Date.now();
    }
    update(value) {
        if (value !== this.value) {
            this.blockchain.add({
                value: value,
                changed: Date.now(),
                by: config.get("deviceId"),
            });
        }
    }
    get value() {
        return this.blockchain.last.value.value;
    }
    get lastChanged() {
        return this.blockchain.last.value.changed;
    }
    get index() {
        return __classPrivateFieldGet(this, _MetaDataEntry_index, "f");
    }
    verify() {
        return this.blockchain.verify();
    }
    toString() {
        return {
            index: this.index,
            blockchain: this.blockchain.start,
        };
    }
}
_MetaDataEntry_index = new WeakMap();
module.exports.MetaDataEntry = MetaDataEntry;
//# sourceMappingURL=MetaDataEntry.js.map