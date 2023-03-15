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
const RouteResult_1 = __importDefault(require("../../RouteResult"));
exports.default = {
    method: "post",
    requiredParams: ["libraryId", "metafileId"],
    requiredBody: ["engine", "frames"],
    url: "/library/:libraryId/metafiles/:metafileId/thumbnails/analyse",
    handler: (req, res, bot, server) => __awaiter(void 0, void 0, void 0, function* () {
        const libraryId = req.params.libraryId;
        const metafileId = req.params.metafileId;
        const analyseOptions = req.body;
        if (analyseOptions.engine === "aleph-alpha" && !analyseOptions.prompt)
            throw new Error("Prompt is required for aleph-alpha engine");
        if (analyseOptions.frames.length === 0)
            throw new Error("Frames are required for analyse. The array must contain at least one frame UUID");
        const result = yield bot.query.library
            .one(libraryId)
            .metafiles.one(metafileId)
            .analyse({
            engine: analyseOptions.engine,
            frames: analyseOptions.frames,
            prompt: analyseOptions.prompt,
            temperature: Number(analyseOptions.temperature),
            max_tokens: Number(analyseOptions.max_tokens),
        });
        if (result) {
            if (analyseOptions.save) {
                if (!analyseOptions.save.key)
                    throw new Error("Key is required for saving analyse result");
                const res = yield bot.query.library.one(libraryId).metafiles.one(metafileId).metadata.put({
                    key: analyseOptions.save.key,
                    value: result.response,
                });
                if (!res)
                    throw new Error("Failed to save analyse result");
            }
            const metafile = yield bot.query.library.one(libraryId).metafiles.one(metafileId).fetch();
            server.inform("database", "metafiles", metafile.toJSON());
            return new RouteResult_1.default(200, result);
        }
        else {
            return new RouteResult_1.default(404, {
                status: "error",
                message: `No metafile found with id ${metafileId}`,
            });
        }
    }),
};
//# sourceMappingURL=metafiles-analyse-one.js.map