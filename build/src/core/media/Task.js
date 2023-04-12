"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
const Job_1 = __importDefault(require("./Job"));
const Status_1 = __importDefault(require("./Status"));
class Task {
    /**
     *
     * @param {any?} options
     */
    constructor(options) {
        this.jobs = [];
        //name
        this.label = options.label || "NaN";
        //creation object id
        this.id = options.id || (0, uuid_1.v4)();
        this.creationDate = options.creationDate ? new Date(options.creationDate) : new Date();
        //import jobs if this is a rebuild
        if (options.jobs) {
            for (let job of options.jobs) {
                this.jobs.push(new Job_1.default(job));
            }
        }
    }
    update(document, save = true) {
        this.label = document.label;
        this.jobs = [];
        for (let job of document.jobs) {
            this.jobs.push(new Job_1.default(job));
        }
    }
    /**
     * Returns the job by object
     *
     * @param job {Job}
     * @param cb {Function} callback to get progress
     * @param cancelToken {{cancel: boolean}} cancel token
     * @returns {Promise<Job|Error>}
     */
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
            totalRead += job.status === Status_1.default.DONE ? job.result.size : 0;
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
exports.default = Task;
//# sourceMappingURL=Task.js.map