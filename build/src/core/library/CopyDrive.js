"use strict";
const { v4: uuidv4 } = require("uuid");
const { finder } = require("../system");
const { DriveBot } = require("../drives");
const { Volume } = require("../drives/Volume");
class CopyDrive {
    constructor(template, options) {
        /**
         * @type {String[]}
         */
        this.tags = [];
        this._id = template._id ? template._id.toString() : null;
        this.id = template.id ? template.id : uuidv4();
        this.label = template.label || "Untitled";
        if (template instanceof Volume) {
            this.volume = template;
            this.type = options.wbType || "generic";
        }
        else {
            const res = DriveBot.getDriveByMountpoint(template.volume);
            if (res)
                this.volume = res;
            else
                this.volume = template.volume;
            this.type = template.type;
        }
        this.tags = template.tags || [];
    }
    update(document) {
        this.type = document.type || this.type;
        this.wbType = document.wbType || this.wbType;
        this.tags = document.tags || this.tags;
    }
    /**
     * Returns the mountpoint of the device. the mountpoint needs to be grabbed from the local connected devices
     *
     * @return {string}
     */
    getMountpoint() {
        if (this.volume instanceof Volume)
            return this.volume.mountpoint;
        return this.volume;
    }
    /**
     * Checks whether the drive is mounted to the system
     *
     * @return {boolean}
     */
    isMounted() {
        const mountpoint = this.getMountpoint();
        if (mountpoint === "/")
            return true;
        return finder.isReachable(mountpoint);
    }
    /**
     * Scans the drive and returns up to 10 level deep of folders as an array
     *
     * @return {string[]}
     */
    scan(options = { limit: 10, extended: false }) {
        const mountpoint = this.getMountpoint();
        if (mountpoint !== "") {
            if (options.extended) {
                const fullPaths = finder.getFolders(mountpoint, options.limit);
                //trim paths of mountpoint
                const trimmedPaths = fullPaths.map((path) => path.replace(mountpoint, ""));
                return {
                    mountpoint: mountpoint,
                    paths: trimmedPaths,
                };
            }
            return [mountpoint, ...finder.getFolders(mountpoint, options.limit)];
        }
        else {
            return [];
        }
    }
    unmount() {
        this.volume = this.volume.mountpoint;
    }
    /**
     * prepares the copydrive for the database
     * omits any private variables
     * @returns {{id: String, type: String, label: String, tags: String[], volume: String}}
     */
    prepareForDB() {
        return {
            id: this.id,
            type: this.type,
            label: this.label,
            tags: this.tags,
            volume: this.volume.mountpoint,
        };
    }
    /**
     * Returns the drive as a string
     * @returns {{serialNumber, removable, wbType, isMounted: boolean, groups: string[], id: String, label, interface, mountpoint: string}}
     */
    toJSON(options = { db: false }) {
        return {
            id: this.id,
            type: this.type,
            label: this.label,
            isMounted: this.isMounted(),
            tags: this.tags,
            volume: this.volume,
        };
    }
}
module.exports.CopyDrive = CopyDrive;
//# sourceMappingURL=CopyDrive.js.map