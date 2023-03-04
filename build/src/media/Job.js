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
const Espresso_1 = __importDefault(require("./Espresso"));
const uuid_1 = require("uuid");
const Status_1 = __importDefault(require("./Status"));
class Job {
    /**
     * Creates a Copy Job
     *
     * @param options {Object}
     */
    constructor(options) {
        this.result = {};
        this.stats = {
            size: 0,
        };
        this.id = options.id || (0, uuid_1.v4)();
        this.status = options.status || Status_1.default.PENDING;
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
    run(callback, cancelToken) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                if (this.status !== Status_1.default.DONE || !this.result) {
                    this.status = Status_1.default.RUNNING;
                    const cup = new Espresso_1.default();
                    //copy and analyse
                    if (this.destinations !== null) {
                        cup
                            .pour(this.source)
                            .drink(this.destinations, cancelToken, callback)
                            .then((result) => {
                            if (result) {
                                this.result = result;
                                this.status = Status_1.default.DONE;
                            }
                            else {
                                this.status = Status_1.default.PENDING;
                            }
                            resolve(this);
                        })
                            .catch((e) => {
                            this.status = Status_1.default.FAILED;
                            reject(e);
                        });
                    }
                    else {
                        //analyse only
                        cup
                            .pour(this.source)
                            .analyse(cancelToken, callback)
                            .then((result) => {
                            if (result) {
                                this.result = result;
                                this.status = Status_1.default.DONE;
                            }
                            else {
                                this.status = Status_1.default.PENDING;
                            }
                            resolve(this);
                        })
                            .catch((e) => {
                            this.status = Status_1.default.FAILED;
                            reject(e);
                        });
                    }
                }
                else {
                    //already done return the result
                    resolve(this);
                }
            });
        });
    }
    /**
     * Returns the job as a json object
     * @returns {{result: {}, destination: string, id: string, source: string, status}}
     */
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
exports.default = Job;
//# sourceMappingURL=Job.js.map