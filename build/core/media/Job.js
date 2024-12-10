var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import CopyTool from "./CopyTool.js";
import { v4 as uuidv4 } from "uuid";
import Status from "./Status.js";
export default class Job {
    constructor(options) {
        this.result = {};
        this.stats = {
            size: 0,
        };
        this.id = options.id || uuidv4();
        this.status = options.status || Status.PENDING;
        this.source = options.source ? options.source : null;
        this.destinations = options.destinations ? options.destinations : null;
        this.result = options.result || {};
        this.stats = options.stats || {
            size: 0,
        };
    }
    run(callback, abort) {
        return __awaiter(this, void 0, void 0, function* () {
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
                    }
                    catch (e) {
                        this.status = Status.FAILED;
                        reject(e);
                        return;
                    }
                    abort.addCallback(() => {
                        cpytl.abort();
                    });
                    if (this.destinations !== null) {
                        cpytl
                            .destinations(this.destinations)
                            .copy(callback)
                            .then((result) => {
                            if (result) {
                                this.result = result;
                                this.status = Status.DONE;
                            }
                            else {
                                this.status = Status.PENDING;
                            }
                            resolve(this);
                        })
                            .catch((e) => {
                            this.status = Status.FAILED;
                            reject(e);
                        });
                    }
                    else {
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
                }
                else {
                    resolve(this);
                }
            });
        });
    }
    toJSON(options = { db: false }) {
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
//# sourceMappingURL=Job.js.map