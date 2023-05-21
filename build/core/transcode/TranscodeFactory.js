"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const system_1 = require("../system");
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
class TranscodeFactory {
    constructor(inputPath, options) {
        this.output = options.output;
        this.command = (0, fluent_ffmpeg_1.default)({
            logger: console,
        });
        //set path to input file
        this.command.input(inputPath);
        //settings
        this.command
            .inputOptions("-hwaccel auto")
            .videoCodec(options.videoCodec)
            .videoBitrate(options.videoBitrate)
            .size(options.width + "x" + options.height)
            .aspect("16:9")
            .autopad("black")
            .audioBitrate(options.audioBitrate)
            .audioChannels(options.audioChannels)
            .audioCodec(options.audioCodec)
            .outputOptions([`-pix_fmt ${options.pixelFormat || "yuv422p"}`])
            .fps(options.fps)
            .output(options.output);
        //LUTs
        if (options.lut) {
            if (system_1.finder.existsSync(options.lut) && !system_1.finder.isDirectory(options.lut)) {
                this.command.videoFilter("lut3d=" + options.lut);
            }
            else {
                const defaultPathToLuts = system_1.finder.join(system_1.config.getPathToUserData(), "LUTs", options.lut);
                if (system_1.finder.existsSync(defaultPathToLuts)) {
                    options.lut = defaultPathToLuts;
                    this.command.videoFilter("lut3d=" + options.lut);
                }
                else {
                    options.lut = false;
                }
            }
        }
    }
    run(callback, cancelToken) {
        return new Promise((resolve, reject) => {
            if (!system_1.finder.existsSync(this.output)) {
                system_1.finder.mkdirSync(system_1.finder.dirname(this.output), { recursive: true });
            }
            this.command.on("error", (err, stdout, stderr) => {
                console.log(err, stdout, stderr);
            });
            this.command.on("codecData", (data) => { });
            this.command.on("progress", (progress) => {
                if (cancelToken.cancel) {
                    this.command.kill();
                    resolve(false);
                }
                callback(progress);
            });
            this.command.on("end", (err, stdout, stderr) => {
                resolve(true);
            });
            this.command.run();
        });
    }
}
exports.default = TranscodeFactory;
//# sourceMappingURL=TranscodeFactory.js.map