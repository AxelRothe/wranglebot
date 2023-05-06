"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logbotjs_1 = __importDefault(require("logbotjs"));
const RouteResult_1 = __importDefault(require("../../RouteResult"));
exports.default = {
    method: "post",
    requiredParams: ["username"],
    public: true,
    url: "/users/:username/reset-password",
    handler: (req, res, bot, socketServer) => __awaiter(void 0, void 0, void 0, function* () {
        const { username } = req.params;
        const user = yield bot.query.users.one({ id: username }).fetch();
        if (!user) {
            return new RouteResult_1.default(404, logbotjs_1.default.resolveErrorCode(404));
        }
        const password = yield bot.accountManager.resetPassword(user);
        try {
            yield socketServer.sendMail({
                from: {
                    fullName: "WrangleBot",
                },
                to: user,
                subject: "Password Reset",
                body: `Your password has been reset to ${password}. Please download your client at <a href="https://wranglebot.io">wranglebot.io</a> to get started.<br><br>`,
                button: {
                    text: "Download Client Here",
                    link: "https://wranglebot.io/download",
                },
            });
        }
        catch (e) {
            logbotjs_1.default.log(500, "Unable to send email");
        }
        return new RouteResult_1.default(200, { success: true });
    }),
};
//# sourceMappingURL=reset-password.js.map