var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import ffmpeg from "fluent-ffmpeg";
import { finder } from "../system/index.js";
import TranscodeFactory from "./TranscodeFactory.js";
import TranscodeSetFactory from "./TranscodeSetFactory.js";
import ThumbnailFromImageFactory from "./ThumbnailFromImageFactory.js";
import ThumbnailFactory from "./ThumbnailFactory.js";
import { path as ffmpegPath } from "@ffmpeg-installer/ffmpeg";
import { path as ffprobePath } from "@ffprobe-installer/ffprobe";
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);
class TranscodeBot {
    constructor() { }
    generateTranscode(inputPath, options) {
        try {
            return new TranscodeFactory(inputPath, options);
        }
        catch (e) {
            console.log(e);
            return null;
        }
    }
    generateTranscodeSet(metaFiles, options) {
        const transcodeSet = metaFiles.map((metaFile) => {
            return this.generateTranscode(metaFile.getMetaCopy().pathToBucket.file, options);
        });
        return new TranscodeSetFactory(transcodeSet);
    }
    generateThumbnails(inputPath, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const type = finder.getFileType(inputPath);
            if (type === "photo") {
                const thumbnail = new ThumbnailFromImageFactory(inputPath, options);
                return yield thumbnail.generate();
            }
            else if (type === "video") {
                const thumbs = new ThumbnailFactory(inputPath, options);
                return yield thumbs.generate("jpg", options.callback);
            }
        });
    }
}
export default new TranscodeBot();
//# sourceMappingURL=TranscodeBot.js.map