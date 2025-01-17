import express from "express";
import LogBot from "logbotjs";
import nodemailer from "nodemailer";
import SocketServer from "./SocketServer.js";
import http from "http";
import cors from "cors";
export default {
    init(bot, options) {
        return new Promise((resolve, reject) => {
            if (!options.secret || options.secret === "") {
                LogBot.log(500, "No secret specified.");
                reject(new Error("No Secret specified"));
            }
            if (!options.port) {
                LogBot.log(500, "No port specified.");
                reject(new Error("No Port"));
            }
            const app = express();
            let transporter;
            if (!options.mailConfig || !options.mailConfig.auth || !options.mailConfig.auth.user) {
                transporter = {
                    sendMail: () => {
                        return new Promise((resolve) => {
                            resolve(true);
                        });
                    },
                };
                LogBot.log(404, "No mail configuration found. Mails will not be sent.");
            }
            else {
                transporter = nodemailer.createTransport(options.mailConfig);
                LogBot.log(200, "Mail configuration found. Mails will be sent from " + options.mailConfig.auth.user);
            }
            app.use(cors({ origin: "*", methods: "GET,HEAD,PUT,PATCH,POST,DELETE,NOTIFY", allowedHeaders: ["Content-Type", "Authorization"] }));
            app.use(express.json({ limit: "100mb" }));
            app.use(express.urlencoded({ limit: "100mb", extended: true }));
            const httpServer = http.createServer(app);
            const socketServer = SocketServer(httpServer, app, bot, transporter, options.secret)
                .then((socketServer) => {
                httpServer.listen(options.port, () => {
                    LogBot.log(200, `WrangleBot listening on port ${options.port}`);
                    resolve({
                        httpServer,
                        transporter,
                        socketServer,
                    });
                });
                httpServer.on("error", (e) => {
                    if (e.code === "EADDRINUSE") {
                        reject(new Error("Address in use. Is another instance of WrangleBot running?"));
                        httpServer.close();
                    }
                });
            })
                .catch((e) => {
                reject(e);
            });
        });
    },
};
//# sourceMappingURL=index.js.map