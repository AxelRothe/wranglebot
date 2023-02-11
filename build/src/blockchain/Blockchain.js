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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _Blockchain_firstLink, _Blockchain_lastLink;
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
const md5_1 = __importDefault(require("md5"));
class Link {
    constructor(options) {
        this.next = null;
        this.timestamp = Date.now();
        this.uuid = (0, uuid_1.v4)();
        this.block = options.block;
        if (options.hash) {
            this.hash = options.hash;
        }
        else {
            this.hash = (0, md5_1.default)(this.timestamp + this.uuid + this.block + (options.lastLink ? options.lastLink.hash : ""));
        }
        if (options.uuid)
            this.uuid = options.uuid;
        if (options.timestamp)
            this.timestamp = options.timestamp;
    }
    append(link) {
        this.next = link;
    }
    verify(hash = "") {
        //if first
        if (hash === "" && this.next) {
            const check = (0, md5_1.default)(this.timestamp + this.uuid + this.block);
            if (this.hash === check) {
                //it worked
                return this.next.verify(this.hash);
            }
            else {
                return false;
            }
        }
        //if middle
        else if (hash !== "" && this.next) {
            const check = (0, md5_1.default)(this.timestamp + this.uuid + this.block + hash);
            if (this.hash === check) {
                //it worked
                return this.next.verify(this.hash);
            }
            else {
                return false;
            }
        }
        //if end
        else if (hash !== "" && !this.next) {
            const check = (0, md5_1.default)(this.timestamp + this.uuid + this.block + hash);
            return this.hash === check;
        }
    }
}
class Blockchain {
    /**
     * @param options
     */
    constructor(options) {
        /**
         * @type {Link}
         */
        _Blockchain_firstLink.set(this, void 0);
        _Blockchain_lastLink.set(this, void 0);
        if (options) {
            if (options.chain) {
                this.rebuild(options.chain);
            }
            else if (!options.init) {
                __classPrivateFieldSet(this, _Blockchain_firstLink, __classPrivateFieldSet(this, _Blockchain_lastLink, new Link({ block: (0, md5_1.default)((0, uuid_1.v4)()) }), "f"), "f");
            }
            else if (options.init) {
                __classPrivateFieldSet(this, _Blockchain_firstLink, __classPrivateFieldSet(this, _Blockchain_lastLink, new Link({ block: options.init }), "f"), "f");
            }
        }
        else {
            __classPrivateFieldSet(this, _Blockchain_firstLink, __classPrivateFieldSet(this, _Blockchain_lastLink, new Link({ block: (0, md5_1.default)((0, uuid_1.v4)()) }), "f"), "f");
        }
    }
    rebuild(chain) {
        let lastLink = null;
        for (let i = 0; i < chain.length; i++) {
            const link = new Link({ block: chain[i].content, hash: chain[i].hash, uuid: chain[i].uuid, timestamp: chain[i].timestamp });
            if (!lastLink) {
                __classPrivateFieldSet(this, _Blockchain_firstLink, link, "f");
                __classPrivateFieldSet(this, _Blockchain_lastLink, link, "f");
            }
            else {
                lastLink.append(link);
                __classPrivateFieldSet(this, _Blockchain_lastLink, link, "f");
            }
            lastLink = link;
        }
    }
    verify() {
        return __classPrivateFieldGet(this, _Blockchain_firstLink, "f").verify();
    }
    add(content) {
        const newLink = new Link({ block: content, lastLink: __classPrivateFieldGet(this, _Blockchain_lastLink, "f") });
        __classPrivateFieldGet(this, _Blockchain_lastLink, "f").append(newLink);
        __classPrivateFieldSet(this, _Blockchain_lastLink, newLink, "f");
    }
    //get block with uuid
    get(uuid) {
        let current = __classPrivateFieldGet(this, _Blockchain_firstLink, "f");
        while (current) {
            if (current.uuid === uuid) {
                return {
                    uuid: current.uuid,
                    timestamp: current.timestamp,
                    content: current.block,
                };
            }
            current = current.next;
        }
        return null;
    }
    get start() {
        return __classPrivateFieldGet(this, _Blockchain_firstLink, "f");
    }
    get last() {
        return __classPrivateFieldGet(this, _Blockchain_lastLink, "f");
    }
    //only return the content of each link
    get blocks() {
        let current = __classPrivateFieldGet(this, _Blockchain_firstLink, "f");
        const blocks = [];
        while (current) {
            blocks.push({
                uuid: current.uuid,
                hash: current.hash,
                timestamp: current.timestamp,
                content: current.block,
            });
            current = current.next;
        }
        return blocks;
    }
}
_Blockchain_firstLink = new WeakMap(), _Blockchain_lastLink = new WeakMap();
exports.default = Blockchain;
module.exports = Blockchain;
//# sourceMappingURL=Blockchain.js.map