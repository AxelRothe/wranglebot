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
    url: `/library/:id/metafiles/:file/metacopies/`,
    handler: (req, res, bot, server) => __awaiter(void 0, void 0, void 0, function* () {
        const libraryId = req.params.id;
        const file = req.params.file;
        const metaCopies = yield bot.query.library.one(libraryId).metafiles.one(file).metacopies.many().fetch();
        return new RouteResult(200, metaCopies.map((metaCopy) => metaCopy.toJSON()));
    }),
};
//# sourceMappingURL=metacopy-get-many.js.map