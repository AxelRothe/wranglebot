export default class Job {
    id: string;
    source: string;
    destinations: string[];
    status: number;
    result: any;
    stats: any;
    /**
     * Creates a Copy Job
     *
     * @param options {Object}
     */
    constructor(options: any);
    /**
     * Runs the job
     *
     * @return Promise<Job>
     */
    run(callback: any, cancelToken: any): Promise<unknown>;
    /**
     * Returns the job as a json object
     * @returns {{result: {}, destination: string, id: string, source: string, status}}
     */
    toJSON(options?: {
        db: boolean;
    }): {
        id: string;
        source: string;
        destinations: string[];
        status: number;
        result: any;
        stats: any;
    };
}
//# sourceMappingURL=Job.d.ts.map