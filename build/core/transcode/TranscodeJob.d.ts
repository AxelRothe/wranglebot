import { MetaFile } from "../library/MetaFile.js";
import { MetaCopy } from "../library/MetaCopy.js";
import { TranscodeTask } from "./TranscodeTask.js";
export declare class TranscodeJob {
    #private;
    id: string;
    status: number;
    metaFile: MetaFile;
    pathToExport: string;
    customName: string | undefined;
    task: TranscodeTask;
    metaCopy: MetaCopy | undefined;
    private cancelToken;
    constructor(task: any, options: {
        id?: string;
        metaFile: MetaFile;
        metaCopy?: MetaCopy;
        pathToExport: string;
        customName?: string;
        status?: number;
    });
    run(cancelToken: any, callback: any): Promise<MetaCopy | null>;
    cancel(): void;
    toJSON(): {
        id: string;
        status: number;
        metaFile: any;
        pathToExport: string;
    };
}
//# sourceMappingURL=TranscodeJob.d.ts.map