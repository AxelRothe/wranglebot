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
    url: "/library/:id/metafiles/:file/thumbnails/:grab",
    handler: (req, res, bot, server) => __awaiter(void 0, void 0, void 0, function* () {
        const { id, file, grab } = req.params;
        const { pagination, paginationStart, paginationEnd, extended } = req.query;
        const metaFile = yield bot.query.library.one(id).metafiles.one(file).fetch();
        try {
            switch (grab) {
                case "all":
                    const thumbnails = yield metaFile.query.thumbnails.many().fetch();
                    let t = [];
                    if (extended) {
                        t = thumbnails.map((thumbnail) => thumbnail.toJSON());
                    }
                    else {
                        t = thumbnails.map((t) => t.id);
                    }
                    if (pagination) {
                        if (!paginationStart || !paginationEnd)
                            throw new Error("Missing pagination parameters");
                        t = t.slice(paginationStart, paginationEnd);
                    }
                    return new RouteResult(200, t);
                case "first":
                    const tFirst = yield metaFile.query.thumbnails.first.fetch();
                    return new RouteResult(200, tFirst.toJSON());
                case "last":
                    const tLast = yield metaFile.query.thumbnails.last.fetch();
                    return new RouteResult(200, tLast.toJSON());
                case "center":
                    const tCenter = yield metaFile.query.thumbnails.center.fetch();
                    return new RouteResult(200, tCenter.toJSON());
                default:
                    const thumbnail = yield metaFile.query.thumbnails.one(grab).fetch();
                    return new RouteResult(200, thumbnail.toJSON());
            }
        }
        catch (e) {
            return new RouteResult(404, { success: false, message: "thumbnail not found" });
        }
    }),
};
//# sourceMappingURL=thumbnails-get.js.map