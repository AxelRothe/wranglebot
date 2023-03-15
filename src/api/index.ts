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
   * @param {number} port the port number
   * @param key
   * @return {Promise<{httpServer,socketServer,transporter}>}
   */
  init(bot, port = 3200, key) {
    return new Promise((resolve, reject) => {
      const app = express();

      const transporter = nodemailer.createTransport({
        host: "mx2fd2.netcup.net",
        port: 25,
        auth: {
          user: "noreply@vanrothe.com",
          pass: "4Q32-ItAg-L2x1-FUA7",
        },
      });

      if (port) {
        app.use(cors({ origin: "*", methods: "GET,HEAD,PUT,PATCH,POST,DELETE,NOTIFY", allowedHeaders: ["Content-Type", "Authorization"] }));
        app.use(express.json({ limit: "100mb" }));
        app.use(express.urlencoded({ limit: "100mb", extended: true }));

        const httpServer = http.createServer(app);
        const socketServer = SocketServer(httpServer, app, bot, transporter, key).then((socketServer) => {
          httpServer.listen(port, () => {
            LogBot.log(200, `WrangleBot listening on port ${port}`);
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
