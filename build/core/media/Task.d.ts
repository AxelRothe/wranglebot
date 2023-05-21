import Job from "./Job.js";
import TaskStatusReturn from "./TaskStatusReturn.js";
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
    get stats(): TaskStatusReturn;
    toJSON(options?: {
        db: boolean;
    }): {
        id: string;
        creationDate: string;
        label: string;
        jobs: {
            result: Object;
            id: string;
            source: string;
            status: number;
        }[];
    };
}
//# sourceMappingURL=Task.d.ts.map