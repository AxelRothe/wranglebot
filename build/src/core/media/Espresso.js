"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _Espresso_instances, _Espresso_createMediaInfoInstance;
Object.defineProperty(exports, "__esModule", { value: true });
const streamspeed_1 = __importDefault(require("streamspeed"));
const path_1 = __importDefault(require("path"));
const string_decoder_1 = require("string_decoder");
const mediainfo_js_1 = __importDefault(require("mediainfo.js"));
const xxhash_addon_1 = require("xxhash-addon");
const fs_1 = __importDefault(require("fs"));
class Espresso {
    /**
     * Grab an Espresso Cup
     * @param hashStyle hash style to use, default is xxhash64
     * @param key key to use for the hash, default is 12345678
     * */
    constructor(hashStyle = Espresso.hashStyle, key = Espresso.key) {
        _Espresso_instances.add(this);
        this.pathToFile = "";
        switch (hashStyle) {
            case "xxhash128":
                this.hash = new xxhash_addon_1.XXHash128(Buffer.from(Espresso.key));
                break;
            case "xxhash64":
                this.hash = new xxhash_addon_1.XXHash64(Buffer.from(Espresso.key));
                break;
            case "xxhash32":
                this.hash = new xxhash_addon_1.XXHash32(Buffer.from(Espresso.key));
                break;
            case "xxhash3":
                this.hash = new xxhash_addon_1.XXHash3(Buffer.from(Espresso.key));
                break;
            default:
                this.hash = new xxhash_addon_1.XXHash64(Buffer.from(Espresso.key));
        }
    }
    /**
     * Pour yourself a sweet cup of joe.
     * Set the path to the file you want to read
     *
     * @param pathToFile path to the file
     * @returns {Espresso} returns the current instance
     */
    pour(pathToFile) {
        this.pathToFile = pathToFile;
        return this;
    }
    /**
     * analyzes the file and returns the metadata and hash
     *
     * @param {{cancel:boolean}} cancelToken cancel token to cancel the operation during read
     * @param {Function} callback callback function to get the progress and speed
     * @returns {Promise<{metaData: Object, hash: string, bytesPerSecond: number, bytesRead: number, size: number}>}
     */
    analyse(cancelToken, callback) {
        return new Promise((resolve, reject) => {
            this.drink([], cancelToken, callback)
                .then((result) => {
                resolve(result);
            })
                .catch((e) => {
                reject(e);
            });
        });
    }
    /**
     * analyses the file and pipes the chunks to the target path and returns the metadata and hash at the end
     *
     * @param pathToTargets path to the target file location, if the does not exist it will be created
     * @param cancelToken cancel token to cancel the operation during read
     * @param callback callback function to get the progress and speed
     * @returns {Promise<{metaData: Object, hash: string, bytesPerSecond: number, bytesRead: number, size: number}>}
     */
    drink(pathToTargets = [], cancelToken, callback) {
        return new Promise((resolve, reject) => {
            //set options for HighWaterMarks and chunk size for MediaInfo
            const options = { highWaterMark: Math.pow(1024, 2) * 10 };
            //init streamSpeed Instance with a second interval
            const streamSpeed = new streamspeed_1.default({ timeUnit: 1 });
            let speedInBytes = 0; //current speed in bytes per second
            let totalBytesRead = 0; //total bytes read so far
            __classPrivateFieldGet(this, _Espresso_instances, "m", _Espresso_createMediaInfoInstance).call(this).then((mediaInfo) => {
                //get size of file
                const readStream = fs_1.default.createReadStream(this.pathToFile, options);
                let writeStreams = [];
                if (pathToTargets.length > 0) {
                    for (let i = 0; i < pathToTargets.length; i++) {
                        writeStreams.push(fs_1.default.createWriteStream(pathToTargets[i], options));
                    }
                }
                //get size of file
                const stats = fs_1.default.statSync(this.pathToFile);
                const fileSizeInBytes = stats.size;
                let startTime = 0;
                let lastTime = 0;
                let tick = 0;
                //start parsing the file with mediainfo
                mediaInfo.openBufferInit(fileSizeInBytes, 0);
                //start streamspeed
                streamSpeed.add(readStream);
                //listen to streamspeed
                streamSpeed.on("speed", (speed) => {
                    speedInBytes = speed * 1024;
                });
                //error handle
                readStream.on("error", (err) => {
                    reject(new Error("Failed"));
                });
                readStream.on("open", () => {
                    startTime = lastTime = Date.now();
                });
                //on each chunk
                readStream.on("data", (chunk) => {
                    if (cancelToken !== null && cancelToken.cancel) {
                        readStream.close();
                        reject(new Error("Cancelled"));
                        return;
                    }
                    totalBytesRead += chunk.length;
                    mediaInfo.openBufferContinue(chunk, chunk.length);
                    this.hash.update(chunk);
                    tick++;
                    if (callback && tick % 10 === 0) {
                        callback({
                            bytesPerSecond: speedInBytes,
                            bytesRead: totalBytesRead,
                            size: fileSizeInBytes,
                        });
                    }
                });
                //on end of stream
                readStream.on("end", () => {
                    mediaInfo.openBufferFinalize();
                    const metaData = mediaInfo.inform();
                    mediaInfo.close();
                    let digest = this.hash.digest();
                    const decoder = new string_decoder_1.StringDecoder("base64");
                    resolve({
                        metaData: JSON.parse(metaData),
                        hash: decoder.write(digest),
                        bytesPerSecond: speedInBytes,
                        bytesRead: totalBytesRead,
                        size: fileSizeInBytes,
                    });
                });
                if (pathToTargets.length > 0) {
                    for (let i = 0; i < writeStreams.length; i++) {
                        if (!fs_1.default.existsSync(path_1.default.dirname(pathToTargets[i]))) {
                            fs_1.default.mkdirSync(path_1.default.dirname(pathToTargets[i]), { recursive: true });
                        }
                        readStream.pipe(writeStreams[i]);
                    }
                }
            });
        });
    }
}
exports.default = Espresso;
_Espresso_instances = new WeakSet(), _Espresso_createMediaInfoInstance = function _Espresso_createMediaInfoInstance() {
    return new Promise((resolve) => {
        (0, mediainfo_js_1.default)({ chunkSize: Math.pow(1024, 2) * 10, coverData: false, format: "object" }, (mediaInfo) => {
            resolve(mediaInfo);
        });
    });
};
Espresso.key = "12345678";
Espresso.hashStyle = "xxhash64";
//# sourceMappingURL=Espresso.js.map