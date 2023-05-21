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
    requiredParams: ["path"],
    url: "/utility/list",
    handler: (req, res, bot, socketServer) => __awaiter(void 0, void 0, void 0, function* () {
        let { path, options } = req.body;
        const result = bot.utility.list(path, options);
        if (!result) {
            throw new Error("Error listing files");
        }
        return new RouteResult(200, result);
    }),
};
//# sourceMappingURL=folders-get.js.map