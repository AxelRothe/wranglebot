"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const system_1 = require("../system");
const uuid_1 = require("uuid");
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
class ThumbnailFactory {
    constructor(pathToFile, options) {
        this.pathToFile = pathToFile;
        this.options = options;
    }
    generate(type = "jpg", callback) {
        return new Promise((resolve, reject) => {
            this.command = (0, fluent_ffmpeg_1.default)({
                logger: console,
            });
            this.command.input(this.pathToFile);
            const thumbId = (0, uuid_1.v4)();
            const thumbnailFolder = system_1.finder.join(system_1.config.getPathToUserData(), "thumbnails", ".+" + thumbId);
            //create thumbnail dir if it does not exist
            system_1.finder.mkdirSync(thumbnailFolder, { recursive: true });
            const duration = Number(this.options.metaFile.getMetaData().get("video-duration"));
            let fps = 1;
            //if the duration is longer than 100 seconds, then we will create proportional number of thumbnails
            if (duration > 100) {
                fps = 1 / (duration / 100);
            }
            this.command
                .outputOptions("-q:v", "3", "-pix_fmt", "yuv420p", "-vf", `fps=${fps},scale=512:-1.77`)
                .output(system_1.finder.join(thumbnailFolder, thumbId + "-%03d." + type));
            this.command.on("error", (err, stdout, stderr) => {
                console.log(err, stdout, stderr);
                reject(err);
            });
            this.command.on("progress", (progress) => {
                callback(progress);
            });
            this.command.on("end", (err, stdout, stderr) => {
                console.log(err);
                const files = system_1.finder.getContentOfFolder(thumbnailFolder);
                let newGeneratedThumbnails = [];
                for (let file of files) {
                    //unique id for each thumbnail
                    const uniqueId = (0, uuid_1.v4)();
                    if (system_1.finder.renameAndMove(system_1.finder.join(thumbnailFolder, file), uniqueId, system_1.finder.join(thumbnailFolder, "../"))) {
                        try {
                            const imageFile = system_1.finder.readFileSync(`${system_1.finder.join(thumbnailFolder, "../", uniqueId + "." + type)}`);
                            const data = Buffer.from(imageFile).toString("base64");
                            newGeneratedThumbnails.push({
                                id: uniqueId,
                                frame: file.split("-")[1].split(".")[0],
                                data,
                            });
                        }
                        catch (error) {
                            console.error(error);
                            return "";
                        }
                    }
                }
                system_1.finder.rmSync(thumbnailFolder);
                resolve(newGeneratedThumbnails);
            });
            this.command.run();
        });
    }
}
exports.default = ThumbnailFactory;
//# sourceMappingURL=ThumbnailFactory.js.map