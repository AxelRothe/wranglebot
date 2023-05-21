var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import LogBot from "logbotjs";
import RouteResult from "../../RouteResult.js";
export default {
    method: "delete",
    requiredRole: ["admin", "maintainer"],
    url: "/library/:libraryName/metafiles/:metaFileId/metacopies/:metaCopyId",
    handler: (req, res, bot, server) => __awaiter(void 0, void 0, void 0, function* () {
        const { libraryName, metaFileId, metaCopyId } = req.params;
        const { deleteFile } = req.body;
        const lib = yield bot.query.library.one(libraryName).fetch();
        const metaFile = lib.query.metafiles.one(metaFileId).fetch();
        yield metaFile.query.metacopies.one(metaCopyId).delete({
            deleteFile: deleteFile || false,
        });
        LogBot.log(200, `[API] DELETE /library/${libraryName}/metafiles/${metaFileId}/metacopies/${metaCopyId} by IP ${req.ip}`);
        return new RouteResult(200, {
            status: "success",
            message: `Deleted metacopy ${metaCopyId} from ${metaFile.basename}`,
        });
    }),
};
//# sourceMappingURL=metacopy-delete.js.map