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
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const system_1 = require("../system");
const TranscodeFactory_1 = __importDefault(require("./TranscodeFactory"));
const TranscodeSetFactory_1 = __importDefault(require("./TranscodeSetFactory"));
const ThumbnailFromImageFactory_1 = __importDefault(require("./ThumbnailFromImageFactory"));
const ThumbnailFactory_1 = __importDefault(require("./ThumbnailFactory"));
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffprobePath = require("@ffprobe-installer/ffprobe").path;
fluent_ffmpeg_1.default.setFfmpegPath(ffmpegPath);
fluent_ffmpeg_1.default.setFfprobePath(ffprobePath);
class TranscodeBot {
    constructor() { }
    /**
     *
     * @param inputPath
     * @param options
     * @returns {TranscodeFactory}
     */
    generateTranscode(inputPath, options) {
        try {
            return new TranscodeFactory_1.default(inputPath, options);
        }
        catch (e) {
            console.log(e);
            return null;
        }
    }
    /**
     * Creates a Set of Transcode from a list of metafiles
     * @param {MetaFile[]} metaFiles
     * @param options
     */
    generateTranscodeSet(metaFiles, options) {
        const transcodeSet = metaFiles.map((metaFile) => {
            return this.generateTranscode(metaFile.getMetaCopy().pathToBucket.file, options);
        });
        return new TranscodeSetFactory_1.default(transcodeSet);
    }
    /**
     * Generates Thumbnails for a given video file
     *
     * @param inputPath
     * @param options
     * @returns {Promise<{id: string, label: string, data: string}[]>} the id of the generated thumbnail
     */
    generateThumbnails(inputPath, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const type = system_1.finder.getFileType(inputPath);
            if (type === "photo") {
                const thumbnail = new ThumbnailFromImageFactory_1.default(inputPath, options);
                return yield thumbnail.generate();
            }
            else if (type === "video") {
                const thumbs = new ThumbnailFactory_1.default(inputPath, options);
                return yield thumbs.generate("jpg", options.callback);
            }
        });
    }
}
exports.default = new TranscodeBot();
//# sourceMappingURL=TranscodeBot.js.map