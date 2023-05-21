"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Volume = void 0;
const system_1 = require("../system");
const md5_1 = __importDefault(require("md5"));
class Volume {
    constructor(drive) {
        this.label = "";
        this.mountpoint = "";
        this.serialNumber = "";
        this.interface = "";
        this.removable = false;
        this.status = "offline";
        this.volumeId = "";
        const parsedLabel = drive.mount.match(new RegExp("(?<!/ )[^/]*$"));
        if (parsedLabel.length > 0) {
            this.label = parsedLabel[0] !== "" ? parsedLabel[0] : parsedLabel[0] === "" && system_1.finder.isMac() ? "Macintosh HD" : "Unknown";
        }
        else {
            this.label = drive.label;
        }
        this.host = drive.host;
        this.mountpoint = drive.mount;
        this.fs = drive.fs;
        this.removable = drive.interface === "USB";
        this.serialNumber = drive.serialNumber;
        this.size = drive.size;
        this.free = drive.available;
        this.interface = drive.interface;
        this.volumeId = (0, md5_1.default)(this.label + this.size.toString());
        if (system_1.finder.isReachable(this.mountpoint)) {
            this.status = "online";
        }
    }
    get used() {
        return this.size - this.free;
    }
    scan(options = { limit: 10, extended: false }) {
        if (options.extended) {
            const fullPaths = system_1.finder.getFolders(this.mountpoint, options.limit);
            //trim paths of mountpoint
            const trimmedPaths = fullPaths.map((path) => path.replace(this.mountpoint, ""));
            return {
                mountpoint: this.mountpoint,
                paths: trimmedPaths,
            };
        }
        return [this.mountpoint, ...system_1.finder.getFolders(this.mountpoint, options.limit)];
    }
    /**
     * Returns a JSON friendly representation of the drive
     *
     * @return {{label: string, removable: boolean, mountpoint: string, size: number,  used: number, free: number}}
     */
    print() {
        return {
            mountpoint: this.mountpoint,
            volumeId: this.volumeId,
            fs: this.fs,
            serialNumber: this.serialNumber,
            label: this.label,
            host: this.host,
            interface: this.interface,
            free: this.free,
            size: this.size,
            used: this.size - this.free,
        };
    }
    get stats() {
        return this.print();
    }
}
exports.Volume = Volume;
//# sourceMappingURL=Volume.js.map