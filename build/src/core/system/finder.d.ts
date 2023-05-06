/// <reference types="node" />
declare const _exports: Finder;
export = _exports;
declare class Finder {
    cryptr: any;
    supportedPlatforms: {
        win32: string;
        darwin: string;
        linux: string;
    };
    platform: "linux" | "aix" | "android" | "darwin" | "freebsd" | "haiku" | "openbsd" | "sunos" | "win32" | "cygwin" | "netbsd";
    pathToVolumes: string;
    isMac(): boolean;
    isWindows(): boolean;
    isLinux(): boolean;
    openInFinder(path: any, callback: any): void;
    /**
     * @typedef {Object} DriveOptions
     * @property {string} label
     * @property {string} path
     * @property {string} serialNumber
     * @property {string} interface
     * @property {boolean} removable
     */
    /**
     *
     * @return {Promise<DriveOptions>}
     */
    getDisks(): Promise<{
        label: string;
        path: string;
        serialNumber: string;
        interface: string;
        removable: boolean;
    }>;
    getMountPoint(pathToElement: any): string;
    /**
     * @typedef {Object} DriveScan
     * @property {string} uuid
     * @property {string} productName
     * @property {string} label
     */
    /**
     * Scans a drive at the mountpoint and returns meta data
     *
     * @param mount
     * @return {Promise<DriveScan>}
     */
    scanDrive(mount: any): Promise<{
        uuid: string;
        productName: string;
        label: string;
    }>;
    /**
     * Retrieve all folders with subfolders within a folder
     *
     * @param {string} sourcePath
     * @param {number} limit max level of subfolders
     * @param {number} index
     * @return {String[]} the array of absolute folder paths
     */
    getFolders(sourcePath: string, limit: number, index?: number): string[];
    getPathToVolumes(): string;
    getPathToUserData(path?: string): string;
    /**
     *
     * @param pathToElement
     * @return {boolean}
     */
    access(pathToElement: any): boolean;
    /**
     * Returns whether a path is reachable for this app
     *
     * @param path
     * @returns {boolean}
     */
    isReachable(path: any): boolean;
    /**
     * Returns whether a path exists, can be file or folder
     * use isDirectory to check for type
     *
     * @param pathToElement
     * @returns {boolean}
     */
    existsSync(pathToElement: any): boolean;
    /**
     * returns if a file is in the home directory
     * @param pathToElement
     * @returns {boolean}
     */
    exists(pathToElement: any): boolean;
    check(...elements: any[]): boolean;
    /**
     * Creates a new folder
     *
     * @param pathToNewFolder
     * @param options? {object|undefined}
     * @returns {boolean}
     */
    mkdirSync(pathToNewFolder: any, options?: {}): boolean;
    /**
     * Gets file stats
     * @deprecated use lstatSync instead
     * @param pathToElement
     * @returns {*}
     */
    statSync(pathToElement: any): any;
    /**
     * Gets file stats
     * @param pathToElement
     * @returns {*}
     */
    lstatSync(pathToElement: any): any;
    createReadStream(pathToElement: any, options: any): fs.ReadStream;
    createWriteStream(pathToElement: any, options: any): fs.WriteStream;
    readdirSync(pathToFolder: any): string[];
    /**
     * Reads a File
     *
     * @param {string} pathToElement
     */
    readFile(pathToElement: string): Promise<any>;
    /**
     * Writes to a file
     * @param pathToNewElement
     * @param content
     * @param callback
     */
    writeFile(pathToNewElement: any, content: any, callback: any): void;
    /**
     * Writes to a file synchronously
     * @param pathToElement
     * @param content
     * @param options?
     */
    writeFileSync(pathToElement: any, content: any, options?: undefined): any;
    save(fileName: any, content: any, encrypt?: boolean): boolean;
    saveAsync(fileName: any, content: any, encrypt?: boolean): Promise<any>;
    encrypt(data: any): any;
    decrypt(data: any): any;
    load(fileName: any, decrypt?: boolean): any;
    /**
     * Reads a File
     *
     * @param pathToElement
     * @returns {Buffer}
     */
    readFileSync(pathToElement: any): Buffer;
    parseFileSync(pathToElement: any): any;
    rmSync(pathToElementToRemove: any): void;
    basename(pathToElement: any): string;
    label(pathToElement: any): string;
    extname(pathToElement: any): string;
    dirname(pathToElement: any): string;
    join(...paths: any[]): string;
    watch(pathToFolder: any, callback: any): fs.FSWatcher;
    checkDiskSpace(pathToDevice: any): Promise<any>;
    /**
     * ejects a drive
     *
     * @param pathToDevice
     * @param callback
     */
    eject(pathToDevice: any, callback: any): void;
    getVolumeMountpoint(stringToParse: any): string;
    getVolumeName(pathToElement: any): any;
    /**
     * Returns the file type of the given path
     *
     * @param filename {string} the path to the file
     * @returns {'photo'|'video'|'audio'|'sidecar'}
     */
    getFileType(filename: string): 'photo' | 'video' | 'audio' | 'sidecar';
    /**
     * Returns the items of a folder
     * @param {String} pathToFolder Absolute Path to Folder
     * @param options
     */
    getContentOfFolder(pathToFolder: string, options?: {
        showHidden: boolean;
        filters: string;
        recursive: boolean;
        depth: number;
    }): string[];
    /**
     * Returns true if the given path is a folder
     * @param path
     * @returns {false|*}
     */
    isDirectory(path: any): false | any;
    /**
     * Checks if the path is a directory
     * @param elements
     * @returns {false|*}
     */
    isDir(...elements: any[]): false | any;
    /**
     * Rename a file or folder
     *
     * @param pathToElement
     * @param newName
     */
    rename(pathToElement: any, newName: any): void;
    copy(pathToElement: any, newPath: any): void;
    /**
     * Move a file or folder
     *
     * @param pathToElement
     * @param newFolder
     */
    move(pathToElement: any, newFolder: any): void;
    /**
     * Rename a file and move it, returns true if the file was moved
     *
     * @param pathToElement
     * @param newName
     * @param newFolder
     * @returns {boolean}
     */
    renameAndMove(pathToElement: any, newName: any, newFolder: any): boolean;
}
import fs = require("fs");
//# sourceMappingURL=finder.d.ts.map