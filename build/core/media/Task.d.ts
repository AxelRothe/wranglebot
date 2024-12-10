import Job from "./Job.js";
import TaskStatusReturn from "./TaskStatusReturn.js";
export default class Task {
    id: any;
    label: any;
    creationDate: any;
    jobs: Job[];
    query: any;
    constructor(options: any);
    update(document: any, save?: boolean): void;
    runOneJob(job: Job, cb: any, cancelToken: any): Promise<Job>;
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