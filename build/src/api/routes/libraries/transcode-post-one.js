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
const TranscodeTemplates_1 = __importDefault(require("../../../core/transcode/TranscodeTemplates"));
const RouteResult_1 = __importDefault(require("../../RouteResult"));
exports.default = {
    method: "post",
    requiredRole: ["admin", "maintainer", "contributor"],
    url: "/library/:libraryName/transcode/",
    handler: (req, res, bot, server) => __awaiter(void 0, void 0, void 0, function* () {
        const { libraryName } = req.params;
        const transcode = req.body;
        const lib = yield bot.query.library.one(libraryName).fetch();
        const metaFiles = lib.query.metafiles.many({ $ids: transcode.files });
        if (metaFiles.fetch().length === 0) {
            throw new Error("No files found with ids supplied");
        }
        if (!transcode.codec ||
            !transcode.frameRate ||
            !transcode.flavour ||
            !transcode.audioCodec ||
            !transcode.audioBitrate ||
            !transcode.audioChannels) {
            throw new Error("Missing parameters in transcode request. You must supply codec, frameRate, flavour, audioCodec, audioBitrate and audioChannels");
        }
        const transcodeTemplate = TranscodeTemplates_1.default.get(transcode.codec, transcode.frameRate, transcode.flavour, transcode.container, transcode.audioCodec, transcode.audioBitrate, transcode.audioChannels);
        if (!transcodeTemplate) {
            throw new Error("No transcode template found");
        }
        const transcodeJob = yield metaFiles.export.transcode.post({
            label: transcode.label,
            pathToExport: transcode.path,
            overwrite: transcode.overwrite,
            template: transcodeTemplate,
            lut: transcode.lut,
        });
        return new RouteResult_1.default(200, {
            status: "success",
            message: `Created transcode job ${transcodeJob.label}`,
            id: transcodeJob.id,
        });
    }),
};
//# sourceMappingURL=transcode-post-one.js.map