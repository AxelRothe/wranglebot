/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import User from "./accounts/User.js";
import { Volume } from "./drives/Volume.js";
import { Thumbnail } from "./library/Thumbnail.js";
import MetaLibrary from "./library/MetaLibrary.js";
import { MetaFile } from "./library/MetaFile.js";
import Task from "./media/Task.js";
import { MetaCopy } from "./library/MetaCopy.js";
import { TranscodeTask } from "./transcode/TranscodeTask.js";
import createTaskOptions from "./library/createTaskOptions.js";
import analyseMetaFileOptions from "./library/analyseMetaFileOptions.js";
import MetaLibraryOptions from "./library/MetaLibraryOptions.js";
import MetaLibraryUpdateOptions from "./library/MetaLibraryUpdateOptions.js";
import FolderOptions from "./library/FolderOptions.js";
import Transaction from "./database/Transaction.js";
import CancelToken from "./library/CancelToken.js";
import WrangleBotOptions from "./WrangleBotOptions.js";
import EventEmitter from "events";
import { config } from "./system/index.js";
import { DriveBot } from "./drives/DriveBot.js";
interface ReturnObject {
    status: 200 | 400 | 500 | 404;
    message?: string;
    result?: any;
}
/**
 * WrangleBot Interface
 * @class WrangleBot
 */
declare class WrangleBot extends EventEmitter {
    static OPEN: string;
    static CLOSED: string;
    pingInterval: any;
    ping: any;
    /**
     * @type {DriveBot}
     */
    driveBot: DriveBot;
    accountManager: {
        users: Set<User>;
        salt: string;
        init(): Promise<void>;
        addOneUser(options: import("./accounts/createUserOptions.js").default): User;
        updateUserConfig(user: User, config: any): void;
        removeOneUser(user: any): boolean;
        getAllUsers(filters?: {}): User[];
        getOneUser(username: any): User | undefined;
        addRole(user: User, role: any): boolean;
        setRoles(user: User, roles: any): boolean;
        removeRole(user: User, role: any): boolean;
        hasRole(user: User, roles: any): boolean;
        changePassword(user: User, password: any): any;
        changeEmail(user: User, email: any): any;
        changeFirstName(user: User, firstName: any): any;
        changeLastName(user: User, lastName: any): any;
        updateUser(user: User, options: any): any;
        allowAccess(user: any, library: any): boolean;
        revokeAccess(user: any, library: any): boolean;
        resetPassword(user: User): any;
        checkAuth(username: any, password: any): boolean;
    };
    finder: {
        cryptr: import("cryptr");
        supportedPlatforms: {
            darwin: string;
            linux: string;
        };
        platform: NodeJS.Platform;
        pathToVolumes: string;
        isMac(): boolean;
        isLinux(): boolean;
        openInFinder(path: any, callback: any): void;
        getDisks(): Promise<any[]>;
        getMountPoint(pathToElement: any): string;
        getFolders(sourcePath: any, limit: any, index?: number): any;
        getPathToUserData(path?: string): string;
        access(pathToElement: any): boolean;
        isReachable(path: any): boolean;
        existsSync(pathToElement: any): boolean;
        exists(pathToElement: any): boolean;
        check(...elements: any[]): boolean;
        mkdirSync(pathToNewFolder: any, options?: {}): boolean;
        statSync(pathToElement: any): import("fs").Stats;
        lstatSync(pathToElement: any): import("fs").Stats;
        createReadStream(pathToElement: any, options: any): import("fs").ReadStream;
        createWriteStream(pathToElement: any, options?: {}): import("fs").WriteStream;
        readdirSync(pathToFolder: any): string[];
        readFile(pathToElement: any): Promise<unknown>;
        writeFile(pathToNewElement: any, content: any, callback: any): void;
        writeFileSync(pathToElement: any, content: any, options?: undefined): any;
        save(fileName: any, content: any, encrypt?: boolean): boolean;
        saveAsync(fileName: any, content: any, encrypt?: boolean): Promise<unknown>;
        encrypt(data: any): string;
        decrypt(data: any): string;
        load(fileName: any, decrypt?: boolean): any;
        readFileSync(pathToElement: any): Buffer;
        parseFileSync(pathToElement: any): any;
        rmSync(pathToElementToRemove: any): void;
        basename(pathToElement: any): string;
        label(pathToElement: any): string;
        extname(pathToElement: any): string;
        dirname(pathToElement: any): string;
        join(...paths: any[]): string;
        watch(pathToFolder: any, callback: any): import("fs").FSWatcher;
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
    };
    ML: any;
    config: {
        appName: string;
        versionNumber: string;
        cryptr: import("cryptr");
        pathToConfigFile: string;
        config: any;
        getPathToUserData(): string;
        set(key: any, value: any, encrypt?: boolean): void;
        setConfig(key: any, value: any): void;
        get(key: any, decrypt?: boolean): any;
        getConfig(key: any): any;
        save(): void;
    };
    status: string;
    /**
     * index
     */
    index: {
        libraries: MetaLibrary[];
        metaFiles: {
            [key: string]: MetaFile;
        };
        metaCopies: {
            [key: string]: MetaCopy;
        };
        copyTasks: {
            [key: string]: Task;
        };
        transcodes: {
            [key: string]: TranscodeTask;
        };
    };
    private thirdPartyExtensions;
    private servers;
    constructor();
    open(options: WrangleBotOptions): Promise<this | null>;
    close(): Promise<string>;
    private startServer;
    /**
     * UTILITY FUNCTIONS
     */
    $emit(event: string, ...args: any[]): Promise<boolean>;
    private runCustomScript;
    private loadExtensions;
    getAvailableLibraries(): any;
    private addOneLibrary;
    private removeOneLibrary;
    private getOneLibrary;
    private loadOneLibrary;
    private unloadOneLibrary;
    handleVolumeMount(volume: any): void;
    handleVolumeUnmount(volume: any): void;
    /**
     * Generates Thumbnails from a list of MetaFiles
     *
     * @param library
     * @param {MetaFile[]} metaFiles
     * @param {Function|false} callback
     * @param finishCallback?
     * @returns {Promise<boolean>} resolve to false if there is no need to generate thumbnails or if there are no copies reachable
     */
    generateThumbnails(library: any, metaFiles: any, callback?: (progress: any) => void, finishCallback?: (success: any) => void): Promise<boolean>;
    /**
     * Generates a Thumbnail from a MetaFile if it is a video or photo
     *
     * @param {string} library      - the library name
     * @param {MetaFile} metaFile   - the metaFile to generate a thumbnail for
     * @param {MetaCopy} metaCopy   - if not provided or unreachable, the first reachable copy will be used
     * @param {Function} callback   - callback function to update the progress
     * @returns {Promise<boolean>}  rejects if there is no way to generate thumbnails or if there are no copies reachable
     */
    private generateThumbnail;
    private getManyTransactions;
    /**
     * Removes an Object from the runtime
     * if it already exists it will be overwritten
     *
     * @param {string} list i.e. copyTasks
     * @param {Object} item the object to remove
     * @return {0|1|-1} 0 if the item was not found, 1 if it was removed, -1 if the list does not exist
     */
    removeFromRuntime(list: any, item: any): 1 | -1 | undefined;
    /**
     * Adds an Object to the runtime
     * if it already exists it will be overwritten
     *
     * @param {string} list i.e. copyTasks
     * @param {{id:string}} item the object to add
     * @return {0|1|-1} 0 if the item was overwritten, 1 if it was added, -1 if the list does not exist
     */
    addToRuntime(list: any, item: any): 1 | 0 | -1;
    error(message: any): any;
    notify(title: any, message: any): void;
    get query(): {
        library: {
            many: (filters?: {}) => {
                fetch: () => Promise<MetaLibrary[]>;
            };
            one: (libraryId: string) => {
                fetch(): MetaLibrary;
                put: (options: MetaLibraryUpdateOptions) => Boolean;
                delete: () => Boolean;
                scan: () => Promise<Task | false>;
                transactions: {
                    one: (id: string) => {
                        fetch: () => Transaction;
                    };
                    many: (filter?: {}) => {
                        fetch: () => Transaction[];
                    };
                };
                metafiles: {
                    one: (metaFileId: string) => {
                        fetch(): MetaFile;
                        delete: () => Boolean;
                        thumbnails: {
                            one: (id: string) => {
                                fetch: () => Thumbnail;
                            };
                            many: (filters: any) => {
                                fetch: () => Thumbnail[];
                                analyse: (options: any) => Promise<{
                                    response: string;
                                    cost: number;
                                }>;
                            };
                            first: {
                                fetch: () => Thumbnail;
                            };
                            center: {
                                fetch: () => Thumbnail;
                            };
                            last: {
                                fetch: () => Thumbnail;
                            };
                            generate: () => Promise<Boolean>;
                        };
                        metacopies: {
                            one: (metaCopyId: any) => {
                                fetch(): MetaCopy;
                                delete: (options?: {
                                    deleteFile: boolean;
                                }) => boolean;
                            };
                            many: (filters?: {}) => {
                                fetch: () => MetaCopy[];
                            };
                        };
                        metadata: {
                            put: (options: any) => Boolean;
                        };
                        analyse: (options: analyseMetaFileOptions) => Promise<{
                            response: Object;
                        }>;
                    };
                    many: (filters: any) => {
                        fetch: () => MetaFile[];
                        export: {
                            report: (options: any) => Promise<Boolean>;
                        };
                    };
                };
                tasks: {
                    one: (id: any) => {
                        fetch(): Task;
                        run: (callback: Function, cancelToken: CancelToken) => Promise<Task>;
                        put: (options: any) => Promise<true | Error>;
                        delete: () => Promise<true | undefined>;
                    };
                    many: (filters?: {}) => {
                        fetch(): Task[];
                        delete: () => Promise<unknown>;
                    };
                    post: (options: {
                        label: string;
                        jobs: {
                            source: string;
                            destinations?: string[] | null;
                        }[];
                    }) => Promise<Task>;
                    generate: (options: createTaskOptions) => Promise<Task>;
                };
                transcodes: {
                    one: (id: any) => {
                        fetch(): TranscodeTask;
                        run: (callback: Function, cancelToken: CancelToken) => Promise<void>;
                        delete: () => Boolean;
                    };
                    many: () => {
                        fetch(): TranscodeTask[];
                    };
                    post: (files: MetaFile[], options: any) => Promise<TranscodeTask>;
                };
                folders: {
                    put: (options: FolderOptions) => Promise<Boolean>;
                };
            };
            post: (options: MetaLibraryOptions) => Promise<MetaLibrary>;
            load: (name: string) => Promise<ReturnObject>;
            unload: (name: string) => {
                status: number;
                message: string;
            };
        };
        users: {
            one: (options: {
                id: string;
            }) => {
                fetch(): User;
                put: (options: any) => any;
                allow: (libraryName: string) => boolean;
                revoke: (libraryName: string) => boolean;
                reset: () => any;
            };
            many: (filters?: {}) => {
                fetch: Function;
            };
            post: (options: any) => Promise<User>;
        };
        volumes: {
            one: (id: any) => {
                fetch(): Volume;
                eject: () => Promise<unknown>;
            };
            many: () => {
                fetch(): Promise<Volume[]>;
            };
        };
        transactions: {
            one: (id: any) => void;
            many: (filter: any) => {
                fetch: () => Promise<any>;
            };
        };
    };
    get utility(): {
        index: (pathToFolder: any, types: any) => Promise<import("./media/Index.js").default>;
        list: (pathToFolder: any, options: {
            showHidden: boolean;
            filters: "both" | "files" | "folders";
            recursive: boolean;
            depth: Number;
        }) => string[];
        uuid(): any;
        luts(): string[];
    };
    private applyTransaction;
    private applyTransactionUpdateOne;
    private applyTransactionInsertMany;
    private applyTransactionRemoveOne;
}
declare const wb: WrangleBot;
export default wb;
export { WrangleBot, config };
//# sourceMappingURL=WrangleBot.d.ts.map