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
/**
 * @description Retrieves all users in the database
 */
export default {
    method: "get",
    url: "/users",
    handler: (req, res, bot, socketServer) => __awaiter(void 0, void 0, void 0, function* () {
        if (req.$user.hasRole(["admin", "maintainer"])) {
            const users = bot.query.users.many().fetch();
            const map = users.map((user) => {
                return user.toJSON();
            });
            return new RouteResult(200, map);
        }
        if (req.$user.hasRole(["contributor", "curator"])) {
            return new RouteResult(200, [req.$user.toJSON()]);
        }
        return new RouteResult(404, LogBot.resolveErrorCode(403));
    }),
};
//# sourceMappingURL=get-users.js.map