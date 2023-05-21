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
/**
 * @description Get the authenticated users information
 */
export default {
    method: "get",
    url: "/users/me",
    handler: (req, res, bot, server) => __awaiter(void 0, void 0, void 0, function* () {
        const user = req.$user;
        return new RouteResult(200, user.toJSON());
    }),
};
//# sourceMappingURL=get-users-me.js.map