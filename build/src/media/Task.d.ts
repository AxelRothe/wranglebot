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
    /**
     * Returns all stats of the task
     * @returns {{running: number, totalSize: number, pending: number, failed: number, totalRead: number, done: number}}
     */
    get stats(): {
        pending: number;
        running: number;
        done: number;
        failed: number;
        totalSize: number;
        totalRead: number;
    };
    /**
     * to JSON
     * @returns {{jobs: {result: {}, destination: *, id: *, source: *, status: *}[], id: string, label: string}}
     */
    toJSON({ db }?: {
        db: boolean;
    }): {
        id: any;
        creationDate: any;
        label: any;
        jobs: {
            id: string;
            source: string;
            destinations: string[];
            status: number;
            result: any;
            stats: any;
        }[];
    };
}
//# sourceMappingURL=Task.d.ts.map