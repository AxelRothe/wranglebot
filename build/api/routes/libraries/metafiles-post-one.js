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
    url: "/library/:id/metafiles/",
    handler: (req, res, bot, server) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        const { path, template } = req.body;
        if (!path && !template)
            throw new Error("Either path or template is required");
        const metafile = yield bot.query.library.one(id).metafiles.post(path || template);
        return new RouteResult(200, metafile.toJSON());
    }),
};
//# sourceMappingURL=metafiles-post-one.js.map