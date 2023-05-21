import { v4 as uuidv4 } from "uuid";
import { TranscodeJob } from "./TranscodeJob.js";
import { finder } from "../system/index.js";

export class TranscodeTask {
  id: string;
  label: string;
  template: any;

  status: number; // 1 = pending, 2 = running, 3 = done, 4 = error
  overwrite: boolean;

  creationDate;

  lut: string;

  cancelToken: any;

  jobs: TranscodeJob[] = [];

  query: any;

  constructor(files, options) {
    this.id = options.id || uuidv4();
    this.label = options.label;
    this.template = options.template;
    this.status = options.status || 1;
    this.overwrite = options.overwrite;
    this.lut = options.lut || undefined;

    this.creationDate = options.creationDate ? new Date(options.creationDate) : new Date();

    if (options.jobs) {
      this.jobs = options.jobs.map((job) => new TranscodeJob(this, job));
    } else if (files) {
      this.jobs = files.map((metaFile) => new TranscodeJob(this, { metaFile: metaFile, pathToExport: options.pathToExport }));
    }
  }

  async run(library, callback: Function, cancelToken, jobCallback: Function) {
    this.status = 2;
    this.cancelToken = cancelToken;

    const cb = (progress) => {
      return callback({
        progress: progress,
        task: this,
      });
    };

    for (let job of this.jobs) {
      if (!finder.isReachable(job.pathToExport)) throw new Error("Path to export is not reachable. Connect the volume first.");

      await job.run(cancelToken, cb);
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
    } else if (this.jobs.some((job) => job.status === 4)) {
      this.status = 4;
    } else {
      this.status = 1;
    }
  }

  update(document) {
    if (document.label) this.label = document.label;
    if (document.template) this.template = document.template;
    if (document.overwrite) this.overwrite = document.overwrite;
    if (document.status) this.status = document.status;

    if (document.jobs) {
      this.jobs = document.jobs.map((job) => new TranscodeJob(this, job));
    }
  }

  async cancel() {
    this.cancelToken.cancel = true;
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
