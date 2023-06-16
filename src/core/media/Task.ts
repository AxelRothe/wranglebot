import { v4 as uuidv4 } from "uuid";
import Job from "./Job.js";
import Status from "./Status.js";
import TaskStatusReturn from "./TaskStatusReturn.js";

export default class Task {
  id;

  label;

  creationDate;

  jobs: Job[] = [];

  query;

  /**
   *
   * @param {any?} options
   */
  constructor(options) {
    //name
    this.label = options.label || "NaN";

    //creation object id
    this.id = options.id || uuidv4();

    this.creationDate = options.creationDate ? new Date(options.creationDate) : new Date();

    //import jobs if this is a rebuild
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

  /**
   * Returns the job by object
   *
   * @param job {Job}
   * @param cb {Function} callback to get progress
   * @param cancelToken {{cancel: boolean}} cancel token
   * @returns {Promise<Job>}
   */
  async runOneJob(job: Job, cb, cancelToken): Promise<Job> {
    try {
      return await job.run(cb, cancelToken);
    } catch (e) {
      throw e;
    }
  }

  get stats(): TaskStatusReturn {
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
    return {
      ...stats,
      totalSize,
      totalRead,
    };
  }

  toJSON(options: { db: boolean } = { db: false }): {
    id: string;
    creationDate: string;
    label: string;
    jobs: { result: Object; id: string; source: string; status: number }[];
  } {
    return {
      id: this.id,
      creationDate: this.creationDate.toISOString(),
      label: this.label,
      jobs: this.jobs.map((job) => job.toJSON({ db: options.db })),
    };
  }
}
