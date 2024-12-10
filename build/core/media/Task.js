var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { v4 as uuidv4 } from "uuid";
import Job from "./Job.js";
import Status from "./Status.js";
export default class Task {
    constructor(options) {
        this.jobs = [];
        this.label = options.label || "NaN";
        this.id = options.id || uuidv4();
        this.creationDate = options.creationDate ? new Date(options.creationDate) : new Date();
        if (options.jobs) {
            for (let job of options.jobs) {
                this.jobs.push(new Job(job));
            }
        }
    }
    update(document, save = true) {
        this.label = document.label;
        this.jobs = [];
        for (let job of document.jobs) {
            this.jobs.push(new Job(job));
        }
    }
    runOneJob(job, cb, cancelToken) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield job.run(cb, cancelToken);
            }
            catch (e) {
                throw e;
            }
        });
    }
    get stats() {
        const stats = {
            pending: 0,
            running: 0,
            done: 0,
            failed: 0,
        };
        let totalSize = 0;
        let totalRead = 0;
        for (let job of this.jobs) {
            stats[job.status - 1]++;
            totalSize += job.result.size || 0;
            totalRead += job.status === Status.DONE ? job.result.size : 0;
        }
        return Object.assign(Object.assign({}, stats), { totalSize,
            totalRead });
    }
    toJSON(options = { db: false }) {
        return {
            id: this.id,
            creationDate: this.creationDate.toISOString(),
            label: this.label,
            jobs: this.jobs.map((job) => job.toJSON({ db: options.db })),
        };
    }
}
//# sourceMappingURL=Task.js.map