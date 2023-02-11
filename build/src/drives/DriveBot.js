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
const { finder } = require("../system");
const { SearchLite } = require("searchlite");
const { Volume } = require("./Volume");
const LogBot = require("logbotjs");
const ReturnObject = require("../utility/SendBack");
const EventEmitter = require("events");
class DriveBot extends EventEmitter {
    constructor() {
        super();
        /**
         * @wbType {Volume[]}
         */
        this.drives = [];
        this.watchers = [];
    }
    /**
     * Starts listening to changes to mounted volumes
     *
     * @example
     * driveBot.watch(["mylib1, mylib2"]);
     *
     * @fires DriveBot#removed
     * @fires DriveBot#added
     *
     */
    watch() {
        this.watcher = finder.watch(finder.pathToVolumes, (eventType, volumeName) => {
            if (eventType === "rename") {
                this.getDrive(volumeName).then((drive) => {
                    if (drive) {
                        const oldDrive = drive;
                        this.drives.splice(this.drives.indexOf(drive), 1);
                        LogBot.log(200, "Volume removed: " + volumeName);
                        this.emit("removed", oldDrive);
                    }
                    else {
                        this.scan()
                            .then((allDrives) => {
                            const search = SearchLite.find(allDrives, "label", volumeName);
                            if (search.wasSuccess()) {
                                this.drives.push(search.result);
                                LogBot.log(200, "Volume added: " + volumeName);
                                this.emit("added", search.result);
                            }
                        })
                            .catch((e) => {
                            console.error(e);
                        });
                    }
                });
            }
        });
    }
    /**
     * scans all mounted drives and returns an Array of Drives
     * @return {Promise<Volume[]>}
     */
    scan() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                let newDrives = [];
                finder.getDisks().then((drives) => __awaiter(this, void 0, void 0, function* () {
                    for (let drive of drives) {
                        const newDrive = new Volume(drive);
                        newDrives.push(newDrive);
                    }
                    resolve(newDrives);
                }));
            });
        });
    }
    updateDrives() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.drives.length === 0)
                this.drives = yield this.scan();
        });
    }
    getDriveById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.updateDrives();
            return this.drives.find((drive) => drive.volumeId === id);
        });
    }
    eject(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                this.getDriveById(id).then((vol) => {
                    if (vol) {
                        finder.eject(vol.mountpoint, (error) => {
                            if (!error) {
                                LogBot.log(200, "Ejected " + vol.label);
                                resolve(true);
                            }
                            else {
                                LogBot.log(500, "Error ejecting drive: " + error);
                                resolve(false);
                            }
                        });
                    }
                });
            });
        });
    }
    ejectDevice(deviceName) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                let search = SearchLite.find(this.drives, "label", deviceName);
                if (search.wasSuccess()) {
                    if (search.result.status === "offline") {
                        this.drives.splice(search.count, 1);
                        resolve(new ReturnObject({
                            status: 200,
                            message: deviceName + " was offline, so I removed it.",
                        }));
                    }
                    else {
                        finder.eject(search.result.mountpoint, (error) => {
                            if (!error) {
                                this.drives.splice(search.count, 1);
                                resolve(new ReturnObject({
                                    status: 200,
                                    message: "I have successfully ejected the drive " + deviceName,
                                }));
                            }
                            else {
                                resolve(new ReturnObject({
                                    status: 500,
                                    message: "I was unable to eject the drive " + deviceName,
                                }));
                            }
                        });
                    }
                }
            });
        });
    }
    getDrive(driveName) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.updateDrives();
            let search = SearchLite.find(this.drives, "label", driveName);
            if (search.wasSuccess()) {
                return search.result;
            }
            return false;
        });
    }
    getDriveByMountpoint(mountpoint) {
        if (this.drives.length === 0)
            throw new Error("No drives found");
        let search = SearchLite.find(this.drives, "mountpoint", mountpoint);
        if (search.wasSuccess()) {
            return search.result;
        }
        return false;
    }
    getDriveBySerial(serialNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.updateDrives();
            let search = SearchLite.find(this.drives, "serialNumber", serialNumber);
            if (search.wasSuccess()) {
                return search.result;
            }
            return false;
        });
    }
    getDrives() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.updateDrives();
            return this.drives;
        });
    }
    getMountPoint(mountpoint) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.updateDrives();
            let search = SearchLite.find(this.drives, "mountpoint", mountpoint);
            if (search.wasSuccess()) {
                return search.result.mountpoint;
            }
            return "";
        });
    }
    getCurrentVolumeName(serialNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            const driveToCheck = yield this.getDriveBySerial(serialNumber);
            if (driveToCheck) {
                return driveToCheck.label;
            }
            return "";
        });
    }
    log(message, type) {
        LogBot.log(`DriveBot:${type}`, message, this.verbose);
    }
}
module.exports = new DriveBot();
//# sourceMappingURL=DriveBot.js.map