/// <reference types="node" />
declare const _exports: DriveBot;
export = _exports;
declare class DriveBot extends EventEmitter {
    constructor();
    /**
     * @wbType {Volume[]}
     */
    drives: any[];
    verbose: any;
    watchers: any[];
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
    watch(): void;
    watcher: import("fs").FSWatcher | undefined;
    /**
     * scans all mounted drives and returns an Array of Drives
     * @return {Promise<Volume[]>}
     */
    scan(): Promise<Volume[]>;
    updateDrives(): Promise<void>;
    getDriveById(id: any): Promise<any>;
    eject(id: any): Promise<any>;
    ejectDevice(deviceName: any): Promise<any>;
    getDrive(driveName: any): Promise<any>;
    getDriveByMountpoint(mountpoint: any): any;
    getDriveBySerial(serialNumber: any): Promise<any>;
    getDrives(): Promise<any[]>;
    getMountPoint(mountpoint: any): Promise<any>;
    getCurrentVolumeName(serialNumber: any): Promise<any>;
    log(message: any, type: any): void;
}
import EventEmitter = require("events");
import { Volume } from "./Volume";
//# sourceMappingURL=DriveBot.d.ts.map