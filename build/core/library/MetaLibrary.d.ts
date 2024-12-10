import { WrangleBot } from "../WrangleBot.js";
import MetaLibraryData from "./MetaLibraryData.js";
import { MetaFile } from "./MetaFile.js";
import Task from "../media/Task.js";
import { MetaCopy } from "./MetaCopy.js";
import { TranscodeTask } from "../transcode/TranscodeTask.js";
import Job from "../media/Job.js";
import createTaskOptions from "./createTaskOptions.js";
import Folders from "./Folders.js";
import MetaLibraryOptions from "./MetaLibraryOptions.js";
import MetaLibraryUpdateOptions from "./MetaLibraryUpdateOptions.js";
import CancelToken from "./CancelToken.js";
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
    drops: MetaLibraryData;
    pathToLibrary: any;
    metaFiles: MetaFile[];
    tasks: Task[];
    transcodes: TranscodeTask[];
    readOnly: boolean;
    creationDate: Date;
    query: any;
    constructor(wb: any, options: MetaLibraryOptions | null);
    update(options: MetaLibraryUpdateOptions, save?: boolean): any;
    updateFolder(folderPath: any, overwriteOptions: any): Promise<boolean>;
    getFolderByPath(folderPath: any): Folders | null;
    save(options?: {}): any;
    rebuild(metaLibraryProto: any, readOnly?: boolean): Promise<boolean>;
    createFoldersOnDiskFromTemplate(folders?: Folders[], basePath?: string, jobs?: any[]): void;
    createCopyTaskForNewFiles(): Promise<false | Task>;
    scanLibraryForNewFiles(folders?: Folders[], basePath?: string, jobs?: any[]): Promise<Array<Job>>;
    getMetaCopyByPath(path: any): false | MetaCopy;
    log(message: any, type: any): void;
    get(list: any, value?: string, property?: string): any;
    updateMetaData(col: any, value: any): Promise<true | Error>;
    removeMetaData(col: any): Promise<true | Error>;
    addOneMetaFile(metaFile: any): Promise<MetaFile>;
    findMetaFileByHash(hash: any): any;
    getOneMetaFile(metaFileId: any): MetaFile | undefined;
    getManyMetaFiles(filters?: {
        $ids?: string[];
    }): MetaFile[];
    removeOneMetaFile(metaFile: any, save?: boolean): boolean;
    removeManyMetaFiles(metaFiles: any, save?: boolean): boolean;
    addOneMetaCopy(metaCopy: MetaCopy | Object, metaFile: any): Promise<any>;
    getOneMetaCopy(metaFileId: any, metaCopyId: any): any;
    getManyMetaCopies(metaFileID: any): MetaCopy[];
    removeOneMetaCopy(metaCopy: any, options?: {
        deleteFile: boolean;
    }, save?: boolean): boolean;
    updateMetaDataOfFile(metafile: any, key: any, value: any): boolean;
    downloadOneThumbnail(thumb: any): Promise<void>;
    generateOneTask(options: createTaskOptions): Promise<Task>;
    addOneTask(options: any): Promise<Task>;
    getOneTask(id: any): Task;
    runOneTask(id: any, cb: any, cancelToken: CancelToken): Promise<Task>;
    getManyTasks(): Task[];
    updateOneTask(options: Task): Promise<true | Error>;
    removeOneTask(key: any, by?: string, save?: boolean): true | undefined;
    removeManyTasks(filters: any): Promise<unknown>;
    getOneTranscodeTask(id: any): TranscodeTask;
    getManyTranscodeTasks(filters?: {}): TranscodeTask[];
    addOneTranscodeTask(files: MetaFile[], options: {
        pathToExport: string;
    }): Promise<TranscodeTask>;
    removeOneTranscodeTask(id: any, save?: boolean): boolean;
    runOneTranscodeTask(id: any, cb: any, cancelToken: any): Promise<true | undefined>;
    generateOneReport(metaFiles: MetaFile[], options: ReportOptions): Promise<Boolean>;
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
                "video-raw": number;
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