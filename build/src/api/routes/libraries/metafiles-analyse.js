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
    requiredBody: ["frames"],
    url: "/library/:libraryId/metafiles/:metafileId/analyse",
    handler: (req, res, bot, server) => __awaiter(void 0, void 0, void 0, function* () {
        const libraryId = req.params.libraryId;
        const metafileId = req.params.metafileId;
        const analyseOptions = req.body;
        const result = yield bot.query.library.one(libraryId).metafiles.one(metafileId).analyse({
            frames: analyseOptions.frames,
            prompt: analyseOptions.prompt,
        });
        if (result) {
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
//# sourceMappingURL=metafiles-analyse.js.map