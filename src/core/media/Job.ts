import CopyTool from "./CopyTool.js";
import { v4 as uuidv4 } from "uuid";
import Status from "./Status.js";

export default class Job {
  id: string;
  source: string;

  destinations: string[] | null;

  status: number;

  result: any = {};

  stats: any = {
    size: 0,
  };

  /**
   * Creates a Copy Job
   *
   * @param options {Object}
   */
  constructor(options) {
    this.id = options.id || uuidv4();
    this.status = options.status || Status.PENDING;
    this.source = options.source ? options.source : null;
    this.destinations = options.destinations ? options.destinations : null;
    this.result = options.result || {};
    this.stats = options.stats || {
      size: 0,
    };
  }

  /**
   * Runs the job
   *
   * @return Promise<Job>
   */
  async run(callback, abort): Promise<Job> {
    return new Promise((resolve, reject) => {
      if (this.status !== Status.DONE || !this.result) {
        this.status = Status.RUNNING;
        const cpytl = new CopyTool({
          paranoid: true,
          hash: "xxhash64",
          overwrite: true,
        });

        try {
          cpytl.source(this.source);
        } catch (e) {
          this.status = Status.FAILED;
          reject(e);
          return;
        }

        abort.addCallback(() => {
          cpytl.abort();
        });

        //copy and analyse
        if (this.destinations !== null) {
          cpytl
            .destinations(this.destinations)
            .copy(callback)
            .then((result) => {
              if (result) {
                this.result = result;
                this.status = Status.DONE;
              } else {
                this.status = Status.PENDING;
              }
              resolve(this);
            })
            .catch((e) => {
              this.status = Status.FAILED;
              reject(e);
            });
        } else {
          //analyse only
          cpytl
            .hashFile(this.source, callback)
            .then((hash) => {
              CopyTool.analyseFile(this.source)
                .then((metaData) => {
                  this.result = { hash, metaData, size: this.stats.size };
                  this.status = Status.DONE;
                  resolve(this);
                })
                .catch((e) => {
                  this.status = Status.FAILED;
                  reject(e);
                });
            })
            .catch((e) => {
              this.status = Status.FAILED;
              reject(e);
            });
        }
      } else {
        //already done return the result
        resolve(this);
      }
    });
  }

  /**
   * Returns the job as a json object
   */
  toJSON(options: { db: boolean } = { db: false }) {
    return {
      id: this.id,
      source: this.source,
      destinations: this.destinations,
      status: this.status,
      result: this.result,
      stats: this.stats,
    };
  }
}
