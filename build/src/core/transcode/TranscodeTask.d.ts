import { TranscodeJob } from "./TranscodeJob";
export declare class TranscodeTask {
    id: string;
    label: string;
    template: any;
    status: number;
    overwrite: boolean;
    creationDate: any;
    lut: string;
    cancelToken: any;
    jobs: TranscodeJob[];
    query: any;
    constructor(files: any, options: any);
    run(library: any, callback: Function, cancelToken: any, jobCallback: Function): Promise<void>;
    update(document: any): void;
    cancel(): Promise<void>;
    toJSON(options?: {
        db: boolean;
    }): {
        id: string;
        creationDate: any;
        status: number;
        label: string;
        overwrite: boolean;
        template: any;
        lut: string;
        jobs: {
            id: string;
            status: number;
            metaFile: any;
            pathToExport: string;
        }[];
    };
}
//# sourceMappingURL=TranscodeTask.d.ts.map