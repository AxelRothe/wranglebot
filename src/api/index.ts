import express from "express";
import http from "http";
import LogBot from "logbotjs";

import nodemailer from "nodemailer";
import cors from "cors";
import SocketServer from "./SocketServer";

export default {
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
      const app = express();

      let transporter;

      if (!options.mailConfig) {
        transporter = {
          sendMail: () => {
            return new Promise((resolve) => {
              resolve(true);
            });
          },
        };
        LogBot.log(404, "No mail configuration found. Mails will not be sent.");
      } else {
        transporter = nodemailer.createTransport(options.mailConfig);
        LogBot.log(200, "Mail configuration found. Mails will be sent from " + options.mailConfig.auth.user);
      }

      if (options.port) {
        app.use(cors({ origin: "*", methods: "GET,HEAD,PUT,PATCH,POST,DELETE,NOTIFY", allowedHeaders: ["Content-Type", "Authorization"] }));
        app.use(express.json({ limit: "100mb" }));
        app.use(express.urlencoded({ limit: "100mb", extended: true }));

        const httpServer = http.createServer(app);
        const socketServer = SocketServer(httpServer, app, bot, transporter, options.secret).then((socketServer) => {
          httpServer.listen(options.port, () => {
            LogBot.log(200, `WrangleBot listening on port ${options.port}`);
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
      } else {
        LogBot.log(500, "No listening port specified.");
        return false;
      }
    });
  },
};
