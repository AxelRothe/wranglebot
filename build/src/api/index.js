"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const logbotjs_1 = __importDefault(require("logbotjs"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const cors_1 = __importDefault(require("cors"));
const SocketServer_1 = __importDefault(require("./SocketServer"));
exports.default = {
    /**
     * Start the Express and listen to the specified port
     *
     * This will also enable any assets in the /assets/ folder to be called via http://localhost:port/assets/
     *
     * Note: This only launches an HTTP Server, if you require HTTPS you need to add an HTTPS configuration like NGINX in front of this app.
     *
     * @param {WrangleBot} bot
     * @param {{port:number, secret:string, mailConfig?: Object}} options
     * @return {Promise<{httpServer,socketServer,transporter}>}
     */
    init(bot, options) {
        return new Promise((resolve, reject) => {
            const app = (0, express_1.default)();
            let transporter;
            if (!options.mailConfig) {
                transporter = {
                    sendMail: () => {
                        return new Promise((resolve) => {
                            resolve(true);
                        });
                    },
                };
                logbotjs_1.default.log(404, "No mail configuration found. Mails will not be sent.");
            }
            else {
                transporter = nodemailer_1.default.createTransport(options.mailConfig);
                logbotjs_1.default.log(200, "Mail configuration found. Mails will be sent from " + options.mailConfig.auth.user);
            }
            if (options.port) {
                app.use((0, cors_1.default)({ origin: "*", methods: "GET,HEAD,PUT,PATCH,POST,DELETE,NOTIFY", allowedHeaders: ["Content-Type", "Authorization"] }));
                app.use(express_1.default.json({ limit: "100mb" }));
                app.use(express_1.default.urlencoded({ limit: "100mb", extended: true }));
                const httpServer = http_1.default.createServer(app);
                const socketServer = (0, SocketServer_1.default)(httpServer, app, bot, transporter, options.secret).then((socketServer) => {
                    httpServer.listen(options.port, () => {
                        logbotjs_1.default.log(200, `WrangleBot listening on port ${options.port}`);
                        resolve({
                            httpServer,
                            transporter,
                            socketServer,
                        });
                    });
                    httpServer.on("error", (e) => {
                        // @ts-ignore
                        if (e.code === "EADDRINUSE") {
                            reject(new Error("Address in use. Please set a different port in the config.json file."));
                            httpServer.close();
                        }
                    });
                });
            }
            else {
                logbotjs_1.default.log(500, "No listening port specified.");
                return false;
            }
        });
    },
};
//# sourceMappingURL=index.js.map