import EventEmitter from "events";
declare class DriveBot extends EventEmitter {
    drives: any;
    verbose: any;
    watchers: never[];
    private watcher;
    constructor();
    watch(): void;
    hasWatcher(): boolean;
    stopWatching(): void;
    scan(): Promise<unknown>;
    updateDrives(): Promise<void>;
    getDriveById(id: any): Promise<any>;
    eject(id: any): Promise<unknown>;
    ejectDevice(deviceName: any): Promise<unknown>;
    getDrive(driveName: any): Promise<any>;
    getDriveByMountpoint(mountpoint: any): any;
    getDriveBySerial(serialNumber: any): Promise<any>;
    getDrives(): Promise<any>;
    getMountPoint(mountpoint: any): Promise<any>;
    getCurrentVolumeName(serialNumber: any): Promise<any>;
    log(message: any, type: any): void;
}
declare const driveBot: DriveBot;
export { driveBot, DriveBot };
//# sourceMappingURL=DriveBot.d.ts.map