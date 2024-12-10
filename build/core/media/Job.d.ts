export default class Job {
    id: string;
    source: string;
    destinations: string[] | null;
    status: number;
    result: any;
    stats: any;
    constructor(options: any);
    run(callback: any, abort: any): Promise<Job>;
    toJSON(options?: {
        db: boolean;
    }): {
        id: string;
        source: string;
        destinations: string[] | null;
        status: number;
        result: any;
        stats: any;
    };
}
//# sourceMappingURL=Job.d.ts.map