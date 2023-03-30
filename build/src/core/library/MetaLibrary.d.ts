import { WrangleBot } from "../WrangleBot";
import MetaLibraryData from "./MetaLibraryData";
import { MetaFile } from "./MetaFile";
import Task from "../media/Task";
import { MetaCopy } from "./MetaCopy";
import { TranscodeTask } from "../transcode/TranscodeTask";
import Job from "../media/Job";
import createTaskOptions from "./createTaskOptions";
import Folders from "./Folders";
import MetaLibraryOptions from "./MetaLibraryOptions";
import MetaLibraryUpdateOptions from "./MetaLibraryUpdateOptions";
import CancelToken from "./CancelToken";
interface ReportOptions {
    format: "html" | "json" | "text" | "pdf" | "csv";
    template: object;
    pathToExport?: string;
    reportName?: string;
    logoPath?: string;
    uniqueNames: boolean;
    credits?: object;
}
export default class MetaLibrary {
    #private;
    wb: WrangleBot;
    name: string;
    folders: Folders[];
    /**
     * The metadata of the library, this is info that can be saved and used in the handlebars
     * @type {MetaLibraryData}
     */
    drops: MetaLibraryData;
    pathToLibrary: any;
    metaFiles: MetaFile[];
    tasks: Task[];
    transcodes: TranscodeTask[];
    readOnly: boolean;
    /**
     * The creation date of the library
     * @type {Date}
     */
    creationDate: Date;
    query: any;
    constructor(wb: any, options: MetaLibraryOptions | null);
    /**
     * Updates and saves the library
     * @param options {{pathToLibrary?:string, drops?:Map<name,value>, folders?:Folders}}
     * @param save
     * @returns {boolean}
     */
    update(options: MetaLibraryUpdateOptions, save?: boolean): any;
    updateFolder(folderPath: any, overwriteOptions: any): Promise<boolean>;
    getFolderByPath(folderPath: any): Folders | null;
    save(options?: {}): any;
    /**
     * REBUILD
     * Takes a library database Structure and assembles all attached elements
     *
     * @param {Object} metaLibraryProto
     * @param readOnly
     * @return {Promise<boolean>}
     */
    rebuild(metaLibraryProto: any, readOnly?: boolean): Promise<boolean>;
    /**
     * Iterates over the given folders and creates them on the disk relative to pathToLibrary
     */
    createFoldersOnDiskFromTemplate(folders?: Folders[], basePath?: string, jobs?: any[]): void;
    createCopyTaskForNewFiles(): Promise<false | Task>;
    scanLibraryForNewFiles(folders?: Folders[], basePath?: string, jobs?: any[]): Promise<Array<Job>>;
    getMetaCopyByPath(path: any): false | MetaCopy;
    handleFileChange(event: any, path: any): Promise<void>;
    log(message: any, type: any): void;
    /**
     *
     * @param {string} list
     * @param {string} value
     * @param {"_id"|"id"|"label"|string} property
     * @return {CopyBucket|CopyDrive|MetaFile|MetaCopy}
     */
    get(list: any, value?: string, property?: string): any;
    updateMetaData(col: any, value: any): Promise<true | Error>;
    removeMetaData(col: any): Promise<true | Error>;
    /**
     * Adds a MetaFile to the database(), as well as the runtime
     *
     * @param metaFile
     * @return {Promise<void>}
     */
    addOneMetaFile(metaFile: any): Promise<void>;
    /**
     * Retrieves a MetaFile from its library by hash, can lead to collisions
     *
     * @param hash
     * @return {MetaFile}
     */
    findMetaFileByHash(hash: any): any;
    /**
     * Retrieves a MetaFile from its library from its id
     *
     * @param {string} metaFileId
     * @return {MetaFile}
     */
    getOneMetaFile(metaFileId: any): MetaFile | undefined;
    getManyMetaFiles(filters?: {
        $ids?: string[];
    }): MetaFile[];
    removeOneMetaFile(metaFile: any, save?: boolean): boolean;
    removeManyMetaFiles(metaFiles: any, save?: boolean): boolean;
    addOneMetaCopy(metaCopy: any, metaFile: any): Promise<any>;
    getOneMetaCopy(metaFileId: any, metaCopyId: any): any;
    getManyMetaCopies(metaFileID: any): MetaCopy[];
    removeOneMetaCopy(metaCopy: any, options?: {
        deleteFile: boolean;
    }, save?: boolean): boolean;
    updateMetaDataOfFile(metafile: any, key: any, value: any): boolean;
    downloadOneThumbnail(thumb: any): Promise<void>;
    generateOneTask(options: createTaskOptions): Promise<Task>;
    /**
     * Creates CopyTask and adds it to the library
     *
     * @param {{label: string; jobs: {source: string; destinations?: string[]}[]}} options
     * @return {Promise<Task>}
     */
    addOneTask(options: any): Promise<Task>;
    /**
     *
     * @param {string} id
     * @return {Task}
     */
    getOneTask(id: any): Task;
    /**
     * Runs all jobs of a task and syncs metafiles and copies as needed
     *
     * @param {string} id the id of the task
     * @param {Function} cb the callback to get progress and speed
     * @param {{cancel:boolean}} cancelToken cancel the operation
     */
    runOneTask(id: any, cb: any, cancelToken: CancelToken): Promise<Task>;
    /**
     * Returns all tasks of the library
     * @returns {Task[]}
     */
    getManyTasks(): Task[];
    /**
     * Updates or Upserts a Task
     *
     * @param options {{label:string, jobs: {source:string, destination?:string}}} options
     * @returns {Promise<Error|boolean>}
     */
    updateOneTask(options: Task): Promise<true | Error>;
    /**
     * Remove a Task from the library, it will attempt t remove it from the database() first. If it succeeds it will splice it from the runtime array
     *
     * @param {string} key
     * @param {'id'|'_id'|'label'} by
     * @param save
     * @return {Promise<{deletedCount:number}>}
     */
    removeOneTask(key: any, by?: string, save?: boolean): void;
    /**
     * Removes all tasks that match the filter
     *
     * @param filters {{any?:any?}}
     * @returns {Promise<Task[]>} the remaining tasks
     */
    removeManyTasks(filters: any): Promise<unknown>;
    getOneTranscodeTask(id: any): TranscodeTask;
    getManyTranscodeTasks(filters?: {}): TranscodeTask[];
    addOneTranscodeTask(files: MetaFile[], options: {
        pathToExport: string;
    }): Promise<TranscodeTask>;
    removeOneTranscodeTask(id: any, save?: boolean): boolean;
    runOneTranscodeTask(id: any, cb: any, cancelToken: any): Promise<true | undefined>;
    generateOneReport(metaFiles: MetaFile[], options: ReportOptions): Promise<Boolean>;
    /**
     * Returns the flattened version of the library with statistics
     *
     * @return {{metaData: Object, copyTasks: number, buckets: number, name, files: number, creationDate: string}}
     */
    toJSON(options?: {
        db: boolean;
    }): {
        creationDate: string;
        name: string;
        pathToLibrary: any;
        drops: MetaLibraryData;
        stats: {
            count: {
                total: number;
                video: number;
                audio: number;
                photo: number;
                sidecar: number;
                lessThanTwo: number;
            };
            size: number;
        } | undefined;
        files: any[];
        tasks: any[];
        folders: Folders[];
        readOnly: boolean;
    };
}
export {};
//# sourceMappingURL=MetaLibrary.d.ts.map