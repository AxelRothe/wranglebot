import { v4 as uuidv4 } from "uuid";
import Job from "./Job";
import Status from "./Status";

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
   * @returns {Promise<Job|Error>}
   */
  async runOneJob(job: Job, cb, cancelToken) {
    try {
      return await job.run(cb, cancelToken);
    } catch (e) {
      throw e;
    }
  }

  /**
   * Returns all stats of the task
   * @returns {{running: number, totalSize: number, pending: number, failed: number, totalRead: number, done: number}}
   */
  get stats() {
    const stats = {
      pending: 0,
      running: 0,
      done: 0,
      failed: 0,
      totalSize: 0,
      totalRead: 0,
    };
    for (let job of this.jobs) {
      stats[job.status]++;
      stats.totalSize += job.result.size || 0;
      stats.totalRead += job.status === Status.DONE ? job.result.size : 0;
    }
    return stats;
  }

  /**
   * to JSON
   * @returns {{jobs: {result: {}, destination: *, id: *, source: *, status: *}[], id: string, label: string}}
   */
  toJSON({ db: boolean } = { db: false }) {
    return {
      id: this.id,
      creationDate: this.creationDate.toISOString(),
      label: this.label,
      jobs: this.jobs.map((job) => job.toJSON()),
    };
  }
}
