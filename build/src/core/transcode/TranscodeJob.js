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
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _TranscodeJob_instances, _TranscodeJob_transcodeOneMetaFile;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranscodeJob = void 0;
const MetaCopy_1 = require("../library/MetaCopy");
const uuid_1 = require("uuid");
const system_1 = require("../system");
const index_1 = require("./index");
const Espresso_1 = __importDefault(require("../media/Espresso"));
class TranscodeJob {
    constructor(task, options) {
        _TranscodeJob_instances.add(this);
        this.id = (0, uuid_1.v4)();
        this.status = 1; // 1 = pending, 2 = running, 3 = done, 4 = error
        this.cancelToken = { cancel: false };
        this.id = options.id || this.id;
        this.task = task;
        this.status = options.status || this.status;
        this.metaFile = options.metaFile || null;
        this.metaCopy = options.metaCopy || undefined;
        this.pathToExport = options.pathToExport;
        this.customName = options.customName || undefined;
        if (!this.task)
            throw new Error("TranscodeJob needs a task");
        if (!this.pathToExport) {
            throw new Error("No pathToExport supplied. TranscodeJob is corrupted.");
        }
        if (this.metaFile === null) {
            throw new Error("No metaFile supplied. TranscodeJob is corrupted.");
        }
    }
    run(cancelToken, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            this.cancelToken = cancelToken;
            try {
                const metaCopy = yield __classPrivateFieldGet(this, _TranscodeJob_instances, "m", _TranscodeJob_transcodeOneMetaFile).call(this, this.metaFile, callback);
                if (metaCopy) {
                    this.metaCopy = metaCopy;
                    this.status = 3;
                    return metaCopy;
                }
                else {
                    this.status = 4;
                    return null;
                }
            }
            catch (e) {
                this.status = 4;
                throw new Error("Could not transcode " + this.metaFile.name + " Reason: " + e.message);
            }
        });
    }
    cancel() {
        this.cancelToken.cancel = true;
    }
    toJSON() {
        return {
            id: this.id,
            status: this.status,
            metaFile: this.metaFile.id,
            pathToExport: this.pathToExport,
        };
    }
}
exports.TranscodeJob = TranscodeJob;
_TranscodeJob_instances = new WeakSet(), _TranscodeJob_transcodeOneMetaFile = function _TranscodeJob_transcodeOneMetaFile(metaFile, callback) {
    return __awaiter(this, void 0, void 0, function* () {
        //find reachable meta copy
        const reachableMetaCopy = metaFile.copies.find((copy) => {
            return system_1.finder.existsSync(copy.pathToBucket.file);
        });
        if (reachableMetaCopy) {
            const pathToExport = this.pathToExport;
            const pathToExportedFile = pathToExport + "/" + (this.customName || metaFile.name) + "." + this.task.template.extension;
            if (system_1.finder.existsSync(pathToExportedFile) && !this.task.overwrite) {
                throw new Error("File already exists.");
            }
            //transcode the meta file
            try {
                const transcode = index_1.TranscodeBot.generateTranscode(reachableMetaCopy.pathToBucket.file, Object.assign(Object.assign({}, this.task.template), { output: pathToExportedFile, lut: this.task.lut }));
                yield transcode.run(callback, this.cancelToken);
                if (this.cancelToken.cancel)
                    return null;
                const cup = new Espresso_1.default();
                const analyzedFile = yield cup.pour(pathToExportedFile).analyse(this.cancelToken, () => { });
                const newMetaCopy = new MetaCopy_1.MetaCopy({
                    hash: analyzedFile.hash,
                    pathToSource: reachableMetaCopy.pathToBucket.file,
                    pathToBucket: pathToExportedFile,
                    label: "transcode",
                    metaFile: metaFile,
                });
                return newMetaCopy;
            }
            catch (e) {
                console.log(e);
                throw new Error("Could not transcode " + reachableMetaCopy.pathToBucket.file + " to " + pathToExport);
            }
        }
        else {
            throw new Error("Could not find a reachable copy for " + metaFile.name);
        }
    });
};
//# sourceMappingURL=TranscodeJob.js.map