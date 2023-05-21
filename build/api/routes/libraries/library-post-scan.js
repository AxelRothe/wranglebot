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
    method: "post",
    requiredRole: ["admin", "maintainer", "contributor"],
    url: "/library/:libraryId/scan",
    handler: (req, res, bot, server) => __awaiter(void 0, void 0, void 0, function* () {
        const libraryId = req.params.libraryId;
        const result = yield bot.query.library.one(libraryId).scan();
        if (result) {
            return new RouteResult(200, result.toJSON());
        }
        else {
            return new RouteResult(404, {
                status: "unchanged",
                message: `No new files found in library ${libraryId}`,
            });
        }
    }),
};
//# sourceMappingURL=library-post-scan.js.map