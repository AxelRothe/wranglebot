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
export default class RouteFactory {
    constructor(options) {
        this.baseUrl = options.baseUrl;
        this.app = options.express;
        this.bot = options.wrangleBot;
        this.server = options.socketServer;
        this.mail = options.mailServer;
    }
    build(options) {
        if (!options.method)
            throw new Error("Method is required");
        LogBot.log(100, `Building route ${options.method.toUpperCase()} ${this.baseUrl}${options.url}`);
        this.app[options.method](`${this.baseUrl}${options.url}`, (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (options.requiredRole) {
                    req.$user = this.server.checkRequestAuthorization(req, res, options.requiredRole);
                    if (!req.$user)
                        return;
                }
                else if (!options.public) {
                    req.$user = this.server.checkRequestAuthorization(req, res);
                    if (!req.$user)
                        return;
                }
                const resolvedHandler = yield options.handler(req, res, this.bot, this.server);
                if (resolvedHandler) {
                    res.status(resolvedHandler.status).send(resolvedHandler.result);
                    LogBot.log(200, `[API] ${options.method.toUpperCase()} ${this.baseUrl}${options.url} by IP ${req.ip}`);
                }
            }
            catch (e) {
                LogBot.log(500, `[API] ${options.method.toUpperCase()} ${this.baseUrl}${options.url} by IP ${req.ip}`);
                console.error(e);
                if (!res.headersSent) {
                    res.status(500).send({
                        status: "error",
                        message: e.message,
                    });
                }
            }
        }));
    }
}
//# sourceMappingURL=RouteFactory.js.map