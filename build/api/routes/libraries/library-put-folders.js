var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import RouteResult from "../../RouteResult.js";
export default {
    method: "put",
    requiredRole: ["admin", "maintainer"],
    url: "/library/:libraryId/folders/",
    handler: (req, res, bot, server) => __awaiter(void 0, void 0, void 0, function* () {
        const { libraryId } = req.params;
        const { pathToFolder, overwrite } = req.body;
        if (!pathToFolder)
            throw new Error("Folder is required");
        if (!overwrite)
            throw new Error("Overwrite Options are required");
        const lib = bot.query.library.one(libraryId).fetch();
        const result = yield lib.query.folders.put({
            path: pathToFolder,
            options: overwrite,
        });
        return new RouteResult(200, {
            status: "success",
            message: `Updated folder ${pathToFolder} for library ${libraryId}`,
            result,
        });
    }),
};
//# sourceMappingURL=library-put-folders.js.map