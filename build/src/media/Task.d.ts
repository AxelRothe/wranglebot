import Job from "./Job";
export default class Task {
    id: any;
    label: any;
    creationDate: any;
    jobs: Job[];
    query: any;
    /**
     *
     * @param {any?} options
     */
    constructor(options: any);
    update(document: any, save?: boolean): void;
    /**
     * Returns the job by object
     *
     * @param job {Job}
     * @param cb {Function} callback to get progress
     * @param cancelToken {{cancel: boolean}} cancel token
     * @returns {Promise<Job|Error>}
     */
    runOneJob(job: Job, cb: any, cancelToken: any): Promise<unknown>;
    get stats(): {
        running: number;
        totalSize: number;
        pending: number;
        failed: number;
        totalRead: number;
        done: number;
    };
    toJSON(options?: {
        db: boolean;
    }): {
        id: string;
        creationDate: string;
        label: string;
        jobs: {
            result: {};
            id: string;
            source: string;
            status: number;
        }[];
    };
}
//# sourceMappingURL=Task.d.ts.map