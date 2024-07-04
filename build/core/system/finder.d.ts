import fs from "fs";
import Cryptr from "cryptr";
declare class Finder {
    cryptr: Cryptr;
    supportedPlatforms: {
        darwin: string;
        linux: string;
    };
    platform: NodeJS.Platform;
    pathToVolumes: string;
    constructor();
    isMac(): boolean;
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
    getDisks(): Promise<any[]>;
    getMountPoint(pathToElement: any): string;
    /**
     * Retrieve all folders with subfolders within a folder
     *
     * @param {string} sourcePath
     * @param {number} limit max level of subfolders
     * @param {number} index
     * @return {String[]} the array of absolute folder paths
     */
    getFolders(sourcePath: any, limit: any, index?: number): any;
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
    statSync(pathToElement: any): fs.Stats;
    /**
     * Gets file stats
     * @param pathToElement
     * @returns {*}
     */
    lstatSync(pathToElement: any): fs.Stats;
    createReadStream(pathToElement: any, options: any): fs.ReadStream;
    createWriteStream(pathToElement: any, options?: {}): fs.WriteStream;
    readdirSync(pathToFolder: any): string[];
    /**
     * Reads a File
     *
     * @param {string} pathToElement
     */
    readFile(pathToElement: any): Promise<unknown>;
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
    saveAsync(fileName: any, content: any, encrypt?: boolean): Promise<unknown>;
    encrypt(data: any): string;
    decrypt(data: any): string;
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
    checkDiskSpace(pathToDevice: any): Promise<unknown>;
    /**
     * ejects a drive
     *
     * @param pathToDevice
     * @param callback
     */
    eject(pathToDevice: any, callback: any): void;
    /**
     * Returns the file type of the given path
     *
     * @param filename {string} the path to the file
     * @returns {'photo'|'video'|'audio'|'sidecar'}
     */
    getFileType(filename: any): "video" | "video-raw" | "audio" | "photo" | "sidecar";
    /**
     * Returns the items of a folder
     * @param {String} pathToFolder Absolute Path to Folder
     * @param options
     */
    getContentOfFolder(pathToFolder: any, options?: {
        showHidden: boolean;
        filters: "both" | "files" | "folders";
        recursive: boolean;
        depth: Number;
    }): string[];
    /**
     * Returns true if the given path is a folder
     * @param path
     * @returns {false|*}
     */
    isDirectory(path: any): boolean;
    /**
     * Checks if the path is a directory
     * @param elements
     * @returns {false|*}
     */
    isDir(...elements: any[]): boolean;
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
    getVolumePath(stringToParse: any): string;
    getVolumeName(pathToElement: any): any;
}
declare const finder: Finder;
export default finder;
//# sourceMappingURL=finder.d.ts.map