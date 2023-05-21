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
    method: "post",
    url: "/login",
    public: true,
    handler: (req, res, bot, server) => __awaiter(void 0, void 0, void 0, function* () {
        const { username, password, token } = req.body;
        if ((!username || !password) && !token) {
            return new RouteResult(404, LogBot.resolveErrorCode(400) + ": username and password are required");
        }
        const client = server.signInClient(username || null, password || null, token || null);
        return new RouteResult(200, {
            token: client.token,
        });
    }),
};
//# sourceMappingURL=login.js.map