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
    requiredRole: ["admin", "editor"],
    requiredParams: ["libraryId", "metafileId"],
    requiredBody: ["engine", "metafiles", ""],
    url: "/library/:libraryId/metafiles/analyse",
    handler: (req, res, bot, server) => __awaiter(void 0, void 0, void 0, function* () {
        const libraryId = req.params.libraryId;
        const analyseOptions = req.body;
        const { engine, metafiles, resolution, save } = analyseOptions;
        for (let i = 0; i < analyseOptions.metafiles.length; i++) {
            const metafile = yield bot.query.library.one(libraryId).metafiles.one(analyseOptions.metafiles[i]).fetch();
            const frames = [];
            const step = Math.floor(metafile.thumbnails.length / Math.floor(metafile.thumbnails.length * (1 / analyseOptions.resolution)));
            for (let i = 0; i < metafile.thumbnails.length; i += step) {
                frames.push(metafile.thumbnails[i].id);
            }
            const result = yield metafile.analyse({
                engine: analyseOptions.engine,
                frames: frames,
                prompt: analyseOptions.prompt,
                temperature: Number(analyseOptions.temperature),
                max_tokens: Number(analyseOptions.max_tokens),
            });
            if (result) {
                if (analyseOptions.save) {
                    if (!analyseOptions.save.key)
                        throw new Error("Key is required for saving analyse result");
                    const res = yield metafile.query.metadata.put({
                        key: analyseOptions.save.key,
                        value: result.response,
                    });
                    if (!res)
                        throw new Error("Failed to save analyse result");
                }
                server.inform("database", "metafiles", metafile.toJSON());
            }
        }
        return new RouteResult_1.default(200, "Analysis completed");
    }),
};
//# sourceMappingURL=metafiles-analyse-many.js.map