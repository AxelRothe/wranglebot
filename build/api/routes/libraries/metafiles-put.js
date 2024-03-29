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
    url: "/library/:id/metafiles/:file/metadata/:key",
    handler: (req, res, bot, server) => __awaiter(void 0, void 0, void 0, function* () {
        const { id, file, key } = req.params;
        const { value } = req.body;
        bot.query.library.one(id).metafiles.one(file).metadata.put({
            key,
            value,
        });
        return new RouteResult(200, {
            message: `Metadata ${key} updated`,
        });
    }),
};
//# sourceMappingURL=metafiles-put.js.map