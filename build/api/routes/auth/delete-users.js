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
export default {
    method: "delete",
    requiredRole: ["admin", "maintainer"],
    url: "/users/:username",
    handler: (req, res, bot, socketServer) => __awaiter(void 0, void 0, void 0, function* () {
        const { username } = req.params;
        const user = bot.accountManager.getOneUser(username);
        if (!user) {
            res.status(404).send({
                error: LogBot.resolveErrorCode(404),
            });
            return;
        }
        const r = bot.accountManager.removeOneUser(user);
        if (r) {
            LogBot.log(200, `DELETE /users/${username}`);
            return new RouteResult(200, "user deleted");
        }
        else {
            throw new Error("User could not be deleted");
        }
    }),
};
//# sourceMappingURL=delete-users.js.map