import User from "./accounts/User";
import { Volume } from "./drives/Volume";
import { CopyDrive } from "./library/CopyDrive";
import { Thumbnail } from "./library/Thumbnail";
import MetaLibrary from "./library/MetaLibrary";
import { MetaFile } from "./library/MetaFile";
import Task from "./media/Task";
import { MetaCopy } from "./library/MetaCopy";
import { TranscodeTask } from "./transcode/TranscodeTask";
import createTaskOptions from "./library/createTaskOptions";
import analyseMetaFileOptions from "./library/analyseMetaFileOptions";
import MetaLibraryOptions from "./library/MetaLibraryOptions";
import MetaLibraryUpdateOptions from "./library/MetaLibraryUpdateOptions";
import FolderOptions from "./library/FolderOptions";
import Transaction from "./database/Transaction";
import CancelToken from "./library/CancelToken";
import WrangleBotOptions from "./WrangleBotOptions";
declare const EventEmitter: any;
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
    driveBot: any;
    accountManager: {
        users: Set<User>;
        salt: string;
        init(): Promise<void>;
        addOneUser(options: import("./accounts/createUserOptions").default): User;
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
    finder: any;
    /**
     @type {Config} config
     */
    config: any;
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
        drives: {
            [key: string]: CopyDrive;
        };
        transcodes: {
            [key: string]: TranscodeTask;
        };
    };
    private thirdPartyExtensions;
    constructor();
    open(options: WrangleBotOptions): Promise<this | null>;
    close(): Promise<string>;
    private startServer;
    /**
     * UTILITY FUNCTIONS
     */
    emit(event: string, ...args: any[]): void;
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
                eject: () => Promise<any>;
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
        index: (pathToFolder: any, types: any) => Promise<import("./media/Indexer").Index>;
        list: (pathToFolder: any, options: {
            showHidden: boolean;
            filters: "both" | "files" | "folders";
            recursive: boolean;
            depth: Number;
        }) => any;
        uuid(): any;
        luts(): any;
    };
    private applyTransaction;
    private applyTransactionUpdateOne;
    private applyTransactionInsertMany;
    private applyTransactionRemoveOne;
}
declare const wb: WrangleBot;
export default wb;
export { WrangleBot };
//# sourceMappingURL=WrangleBot.d.ts.map