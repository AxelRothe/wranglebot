import Espresso from "./Espresso";
import { v4 as uuidv4 } from "uuid";
import Status from "./Status";

export default class Job {
  id: string;
  source: string;

  destinations: string[];

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
    this.destinations = options.destinations || [];
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
  async run(callback, cancelToken) {
    return new Promise((resolve, reject) => {
      if (this.status !== Status.DONE || !this.result) {
        this.status = Status.RUNNING;
        const cup = new Espresso();

        //copy and analyse
        if (this.destinations !== null) {
          cup
            .pour(this.source)
            .drink(this.destinations, cancelToken, callback)
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
          cup
            .pour(this.source)
            .analyse(cancelToken, callback)
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
        }
      } else {
        //already done return the result
        resolve(this);
      }
    });
  }

  /**
   * Returns the job as a json object
   * @returns {{result: {}, destination: string, id: string, source: string, status}}
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
