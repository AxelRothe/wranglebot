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
declare const EventEmitter: any;
interface ReturnObject {
    status: 200 | 400 | 500 | 404;
    message?: string;
    result?: any;
}
interface WrangleBotOptions {
    client: {
        database: {
            cloud?: {
                token: string;
                databaseURL: string;
                machineLearningURL: string;
            };
            local?: {
                key: string;
            };
        };
        port: number;
    };
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
        addOneUser(options: any): User;
        removeOneUser(user: any): boolean;
        getAllUsers(filters?: {}): User[];
        getOneUser(username: any): User | undefined;
        addRole(user: any, role: any): boolean;
        removeRole(user: any, role: any): boolean;
        hasRole(user: any, role: any): any;
        changePassword(user: any, password: any): any;
        changeEmail(user: any, email: any): any;
        changeFirstName(user: any, firstName: any): any;
        changeLastName(user: any, lastName: any): any;
        allowAccess(user: any, library: any): boolean;
        revokeAccess(user: any, library: any): boolean;
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
    constructor();
    open(options: WrangleBotOptions): Promise<this | null>;
    startServer(options: {
        port: number;
        key: string;
    }): Promise<void>;
    /**
     * Shuts down the WrangleBot.
     *
     * @return {Promise<string>}
     */
    close(): Promise<string>;
    /**
     * Returns all available libraries from the database
     * @return {Promise<MetaLibrary[]>}
     */
    getAvailableLibraries(): any;
    /**
     * Creates a library repository
     * @param options {{name:string, pathToLibrary?:string, drops?:string[], folders?:{name:string, watch: boolean, folders:Object[]}[]}}
     * @return {Promise<MetaLibrary>}
     */
    addOneLibrary(options: any): Promise<MetaLibrary>;
    /**
     * Removes a library from the database
     * @param name
     * @param save
     * @returns {Promise<boolean|undefined|{error: string, status: number}>}
     */
    removeOneLibrary(name: any, save?: boolean): any;
    /**
     * Retrieves a library from the local database or from the cloud
     * @param name
     * @returns {Promise<MetaLibrary|Object>}
     */
    private getOneLibrary;
    /**
     * Loads a Library from a file and returns a library
     * @param {String} name
     * @return {Promise<ReturnObject>}
     */
    private loadOneLibrary;
    /**
     * Unloads a library from the runtime
     * @param name
     * @private
     */
    private unloadOneLibrary;
    handleVolumeMount(volume: any): void;
    handleVolumeUnmount(volume: any): void;
    /**
     * @example
     * getOneLinkedDrive("id", "1234567890")
     *
     * @param by {string} - the property to search by
     * @param value {string} - the value to search for
     * @returns {CopyDrive>}
     * @throws {Error} if no drive was found
     */
    getOneLinkedDrive(by: string, value: string): CopyDrive;
    /**
     *
     * @param asType
     * @param onlyMounted
     * @return {CopyDrive[]}
     */
    getManyLinkedDrives(asType?: string, onlyMounted?: boolean): any;
    /**
     * Registers a drive to the library
     *
     * @param {Volume} volume
     * @param {'source'|'endpoint'|'generic'} wbType
     * @returns {Promise<Error|CopyDrive|*>}
     */
    linkOneDrive(volume: any, wbType: any): Promise<Error | CopyDrive>;
    /**
     * Unlink a drive from the library
     *
     * @param {CopyDrive | string} driveOrId copydrive or the id
     * @returns {Promise<Error|true>}
     */
    unlinkOneDrive(driveOrId: any): Promise<boolean>;
    /**
     * Generates Thumbnails from a list of MetaFiles
     *
     * @param library
     * @param {MetaFile[]} metaFiles
     * @param {Function|false} callback
     * @param finishCallback?
     * @returns {Promise<boolean>} resolve to false if there is no need to generate thumbnails or if there are no copies reachable
     */
    generateThumbnails(library: any, metaFiles: any, callback?: (progress: any) => void, finishCallback?: (success: any) => void): Promise<false | undefined>;
    /**
     * Generates a Thumbnail from a MetaFile if it is a video or photo
     *
     * @param {string} library      - the library name
     * @param {MetaFile} metaFile   - the metaFile to generate a thumbnail for
     * @param {MetaCopy} metaCopy   - if not provided or unreachable, the first reachable copy will be used
     * @param {Function} callback   - callback function to update the progress
     * @returns {Promise<boolean>}  rejects if there is no way to generate thumbnails or if there are no copies reachable
     */
    generateThumbnail(library: any, metaFile: any, metaCopy: any, callback: Function): Promise<boolean>;
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
    success(message: any): any;
    error(message: any): any;
    notify(title: any, message: any): void;
    get query(): {
        /**
         * sets cursor to users
         */
        users: {
            /**
             * selects one user
             */
            one: (options: {
                id: string;
            }) => {
                fetch(): any;
                put: (options: any) => any;
            };
            /**
             * selects multiple users
             */
            many: (filters?: {}) => {
                fetch: Function;
            };
            post: (options: any) => Promise<User>;
        };
        library: {
            many: (filters?: {}) => {
                /**
                 * Returns the grabbed libraries
                 * @returns {Promise<MetaLibrary[]>}
                 */
                fetch: () => Promise<MetaLibrary[]>;
            };
            one: (libraryId: any) => {
                /**
                 * Returns the grabbed library
                 * @returns {MetaLibrary}
                 */
                fetch(): MetaLibrary;
                put: (options: any) => Promise<any>;
                delete: () => Promise<any>;
                scan: () => Promise<false | Task>;
                transactions: {
                    one: (id: any) => void;
                    many: (filter: any) => {
                        fetch: () => Promise<any>;
                    };
                };
                metafiles: {
                    one: (metaFileId: any) => {
                        fetch(): MetaFile;
                        delete: () => Promise<boolean>;
                        thumbnails: {
                            one: (id: any) => {
                                fetch: () => Promise<Thumbnail>;
                            };
                            all: {
                                fetch: () => Promise<Thumbnail[]>;
                            };
                            first: {
                                fetch: () => Promise<Thumbnail>;
                            };
                            center: {
                                fetch: () => Promise<Thumbnail>;
                            };
                            last: {
                                fetch: () => Promise<Thumbnail>;
                            };
                            post: {};
                            put: {};
                            delete: {};
                        };
                        metacopies: {
                            one: (metaCopyId: any) => {
                                fetch(): any;
                                delete: (options?: {
                                    deleteFile: boolean;
                                }) => Promise<boolean>;
                            };
                            many: (filters?: {}) => {
                                fetch: () => Promise<MetaCopy[]>;
                            };
                        };
                        metadata: {
                            put: (options: any) => Promise<boolean>;
                        };
                        analyse: (options: analyseMetaFileOptions) => Promise<{
                            response: string;
                            cost: number;
                        }>;
                    };
                    many: (filters: any) => {
                        fetch: () => MetaFile[];
                        export: {
                            report: (options: any) => Promise<boolean | undefined>;
                            transcode: {
                                post: (options: any) => Promise<TranscodeTask>;
                                run: (jobId: any, callback: any, cancelToken: any) => Promise<void>;
                                delete: (jobId: any) => Promise<void>;
                            };
                        };
                    };
                };
                tasks: {
                    one: (id: any) => {
                        fetch(): Task;
                        run: (cb: any, cancelToken: any) => Promise<Task>;
                        put: (options: any) => Promise<true | Error>;
                        delete: () => Promise<void>;
                    };
                    many: (filters?: {}) => {
                        fetch(): Task[];
                        put: () => Promise<void>;
                        delete: () => Promise<unknown>;
                    };
                    post: {
                        one: (options: {
                            label: string;
                            jobs: {
                                source: string;
                                destinations?: string[];
                            }[];
                        }) => Promise<Task>;
                        generate: (options: createTaskOptions) => Promise<Task>;
                    };
                };
                transcodes: {
                    one: (id: any) => {
                        fetch(): TranscodeTask;
                        run: (cb: any, cancelToken: any) => Promise<void>;
                        put: (options: any) => Promise<void>;
                        delete: () => Promise<void>;
                    };
                    many: (filters?: {}) => {
                        fetch(): TranscodeTask[];
                    };
                };
                folders: {
                    put: (folderPath: any, overwriteOptions: any) => Promise<boolean>;
                };
            };
            post: {
                /**
                 * Adds a new library
                 * @param options
                 * @returns {Promise<MetaLibrary>}
                 */
                one: (options: any) => Promise<MetaLibrary>;
            };
            load: (name: string) => Promise<ReturnObject>;
            unload: (name: string) => Promise<{
                status: number;
                message: string;
            }>;
        };
        volumes: {
            one: (id: any) => {
                fetch(): any;
                eject: () => Promise<any>;
            };
            many: () => {
                fetch(): Promise<Volume[]>;
            };
        };
        drives: {
            one: (id: any) => {
                fetch(): CopyDrive;
                put: (options: any) => Promise<any>;
                delete: () => Promise<Error | boolean>;
            };
            many: (filters?: {
                wbType: "source" | "endpoint" | "generic" | "all";
            }) => {
                fetch: () => Promise<CopyDrive[]>;
            };
            post: {
                one: (options: {
                    volume: Volume;
                    type: "source" | "endpoint" | "generic";
                }) => Promise<Error | CopyDrive>;
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
    get drops(): {
        [k: string]: string;
    };
    applyTransaction(transaction: any): Promise<void>;
    applyTransactionUpdateOne(transaction: any): Promise<void>;
    applyTransactionInsertMany(transaction: any): Promise<void>;
    applyTransactionRemoveOne(transaction: any): Promise<void>;
}
declare const wb: WrangleBot;
export default wb;
export { WrangleBot };
//# sourceMappingURL=WrangleBot.d.ts.map