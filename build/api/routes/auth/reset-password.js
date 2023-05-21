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
    requiredParams: ["username"],
    public: true,
    url: "/users/:username/reset-password",
    handler: (req, res, bot, socketServer) => __awaiter(void 0, void 0, void 0, function* () {
        const { username } = req.params;
        const user = yield bot.query.users.one({ id: username }).fetch();
        if (!user) {
            return new RouteResult(404, LogBot.resolveErrorCode(404));
        }
        const password = yield bot.accountManager.resetPassword(user);
        try {
            yield socketServer.sendMail({
                from: {
                    fullName: "WrangleBot",
                },
                to: user,
                subject: "Password Reset",
                body: `Your password has been reset to <code>${password}</code>. Please download your client at <a href="https://wranglebot.io">wranglebot.io</a> to get started.<br><br>`,
                button: {
                    text: "Download Client Here",
                    link: "https://wranglebot.io/download",
                },
            });
        }
        catch (e) {
            LogBot.log(500, "Unable to send email");
        }
        return new RouteResult(200, { success: true });
    }),
};
//# sourceMappingURL=reset-password.js.map