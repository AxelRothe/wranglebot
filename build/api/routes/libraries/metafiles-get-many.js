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
    method: "get",
    url: "/library/:libraryName/metafiles",
    handler: (req, res, bot, server) => __awaiter(void 0, void 0, void 0, function* () {
        const { libraryName } = req.params;
        const { pagination, paginationStart, paginationEnd, extended } = req.query;
        const metaFiles = bot.query.library.one(libraryName).metafiles.many({}).fetch();
        if (extended) {
            return new RouteResult(200, metaFiles.map((metaFile) => metaFile.toJSON()));
        }
        else if (pagination) {
            return new RouteResult(200, metaFiles.slice(paginationStart, paginationEnd).map((f) => f.id));
        }
        else {
            return new RouteResult(200, metaFiles.map((f) => f.id));
        }
    }),
};
//# sourceMappingURL=metafiles-get-many.js.map