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
const logbotjs_1 = __importDefault(require("logbotjs"));
const RouteResult_1 = __importDefault(require("../../RouteResult"));
exports.default = {
    method: "delete",
    requiredRole: ["admin"],
    url: "/library/:libraryName/metafiles/:metaFileId/metacopies/:metaCopyId",
    handler: (req, res, bot, server) => __awaiter(void 0, void 0, void 0, function* () {
        const { libraryName, metaFileId, metaCopyId } = req.params;
        const { deleteFile } = req.body;
        const lib = yield bot.query.library.one(libraryName).fetch();
        const metaFile = lib.query.metafiles.one(metaFileId).fetch();
        yield metaFile.query.metacopies.one(metaCopyId).delete({
            deleteFile: deleteFile || false,
        });
        logbotjs_1.default.log(200, `[API] DELETE /library/${libraryName}/metafiles/${metaFileId}/metacopies/${metaCopyId} by IP ${req.ip}`);
        return new RouteResult_1.default(200, {
            status: "success",
            message: `Deleted metacopy ${metaCopyId} from ${metaFile.basename}`,
        });
    }),
};
//# sourceMappingURL=metacopy-delete.js.map