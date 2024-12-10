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
    getDisks(): Promise<any[]>;
    getMountPoint(pathToElement: any): string;
    getFolders(sourcePath: any, limit: any, index?: number): any;
    getPathToUserData(subPath?: string): string;
    access(pathToElement: any): boolean;
    isReachable(path: any): boolean;
    existsSync(pathToElement: any): boolean;
    exists(pathToElement: any): boolean;
    check(...elements: any[]): boolean;
    mkdirSync(pathToNewFolder: any, options?: {}): boolean;
    statSync(pathToElement: any): fs.Stats;
    lstatSync(pathToElement: any): fs.Stats;
    createReadStream(pathToElement: any, options: any): fs.ReadStream;
    createWriteStream(pathToElement: any, options?: {}): fs.WriteStream;
    readdirSync(pathToFolder: any): string[];
    readFile(pathToElement: any): Promise<unknown>;
    writeFile(pathToNewElement: any, content: any, callback: any): void;
    writeFileSync(pathToElement: any, content: any, options?: undefined): any;
    save(fileName: any, content: any, encrypt?: boolean): boolean;
    saveAsync(fileName: any, content: any, encrypt?: boolean): Promise<unknown>;
    encrypt(data: any): string;
    decrypt(data: any): string;
    load(fileName: any, decrypt?: boolean): any;
    readFileSync(pathToElement: any): Buffer<ArrayBufferLike>;
    parseFileSync(pathToElement: any): any;
    rmSync(pathToElementToRemove: any): void;
    basename(pathToElement: any): string;
    label(pathToElement: any): string;
    extname(pathToElement: any): string;
    dirname(pathToElement: any): string;
    join(...paths: any[]): string;
    watch(pathToFolder: any, callback: any): fs.FSWatcher;
    checkDiskSpace(pathToDevice: any): Promise<unknown>;
    eject(pathToDevice: any, callback: any): void;
    getFileType(filename: any): "video" | "video-raw" | "audio" | "photo" | "sidecar";
    getContentOfFolder(pathToFolder: any, options?: {
        showHidden: boolean;
        filters: "both" | "files" | "folders";
        recursive: boolean;
        depth: Number;
    }): string[];
    isDirectory(path: any): boolean;
    isDir(...elements: any[]): boolean;
    rename(pathToElement: any, newName: any): void;
    copy(pathToElement: any, newPath: any): void;
    move(pathToElement: any, newFolder: any): void;
    renameAndMove(pathToElement: any, newName: any, newFolder: any): boolean;
    getVolumePath(stringToParse: any): string;
    getVolumeName(pathToElement: any): any;
}
declare const finder: Finder;
export default finder;
//# sourceMappingURL=finder.d.ts.map