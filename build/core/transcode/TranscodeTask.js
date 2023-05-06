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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranscodeTask = void 0;
const uuid_1 = require("uuid");
const TranscodeJob_1 = require("./TranscodeJob");
const system_1 = require("../system");
class TranscodeTask {
    constructor(files, options) {
        this.jobs = [];
        this.id = options.id || (0, uuid_1.v4)();
        this.label = options.label;
        this.template = options.template;
        this.status = options.status || 1;
        this.overwrite = options.overwrite;
        this.lut = options.lut || undefined;
        this.creationDate = options.creationDate ? new Date(options.creationDate) : new Date();
        if (options.jobs) {
            this.jobs = options.jobs.map((job) => new TranscodeJob_1.TranscodeJob(this, job));
        }
        else if (files) {
            this.jobs = files.map((metaFile) => new TranscodeJob_1.TranscodeJob(this, { metaFile: metaFile, pathToExport: options.pathToExport }));
        }
    }
    run(library, callback, cancelToken, jobCallback) {
        return __awaiter(this, void 0, void 0, function* () {
            this.status = 2;
            this.cancelToken = cancelToken;
            const cb = (progress) => {
                return callback({
                    progress: progress,
                    task: this,
                });
            };
            for (let job of this.jobs) {
                if (!system_1.finder.isReachable(job.pathToExport))
                    throw new Error("Path to export is not reachable. Connect the volume first.");
                yield job.run(cancelToken, cb);
                jobCallback(job);
                if (cancelToken.cancel) {
                    this.status = 1;
                    return;
                }
                //if (job.metaCopy) await library.addOneMetaFile(job.metaCopy);
            }
            //check if all jobs are done
            if (this.jobs.every((job) => job.status === 3)) {
                this.status = 3;
            }
            else if (this.jobs.some((job) => job.status === 4)) {
                this.status = 4;
            }
            else {
                this.status = 1;
            }
        });
    }
    update(document) {
        if (document.label)
            this.label = document.label;
        if (document.template)
            this.template = document.template;
        if (document.overwrite)
            this.overwrite = document.overwrite;
        if (document.status)
            this.status = document.status;
        if (document.jobs) {
            this.jobs = document.jobs.map((job) => new TranscodeJob_1.TranscodeJob(this, job));
        }
    }
    cancel() {
        return __awaiter(this, void 0, void 0, function* () {
            this.cancelToken.cancel = true;
        });
    }
    toJSON(options = { db: false }) {
        return {
            id: this.id,
            creationDate: this.creationDate.toISOString(),
            status: this.status,
            label: this.label,
            overwrite: this.overwrite,
            template: this.template,
            lut: this.lut,
            jobs: this.jobs.map((job) => job.toJSON()),
        };
    }
}
exports.TranscodeTask = TranscodeTask;
//# sourceMappingURL=TranscodeTask.js.map