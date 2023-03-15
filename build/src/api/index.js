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
     * @param {number} port the port number
     * @param key
     * @return {Promise<{httpServer,socketServer,transporter}>}
     */
    init(bot, port = 3200, key) {
        return new Promise((resolve, reject) => {
            const app = (0, express_1.default)();
            const transporter = nodemailer_1.default.createTransport({
                host: "mx2fd2.netcup.net",
                port: 25,
                auth: {
                    user: "noreply@vanrothe.com",
                    pass: "4Q32-ItAg-L2x1-FUA7",
                },
            });
            if (port) {
                app.use((0, cors_1.default)({ origin: "*", methods: "GET,HEAD,PUT,PATCH,POST,DELETE,NOTIFY", allowedHeaders: ["Content-Type", "Authorization"] }));
                app.use(express_1.default.json({ limit: "100mb" }));
                app.use(express_1.default.urlencoded({ limit: "100mb", extended: true }));
                const httpServer = http_1.default.createServer(app);
                const socketServer = (0, SocketServer_1.default)(httpServer, app, bot, transporter, key).then((socketServer) => {
                    httpServer.listen(port, () => {
                        logbotjs_1.default.log(200, `WrangleBot listening on port ${port}`);
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