import express from "express";
import { WrangleBot } from "../WrangleBot";
import { SocketServer } from "./SocketServer";
const LogBot = require("logbotjs");

interface routeOptions {
  method: string; //"get" | "post" | "put" | "delete"
  url: string;
  requiredRole?: string;
  requiredParams?: string[] | undefined;
  requiredBody?: string[] | undefined;
  handler: (req: express.Request, res: express.Response, bot: WrangleBot, server: SocketServer) => Promise<any>;
}

interface FactoryOptions {
  baseUrl: string;
  express: express.Application;
  wrangleBot: WrangleBot;
  socketServer: SocketServer;
  mailServer;
}

export default class RouteFactory {
  private readonly app: express.Application;
  private readonly bot: WrangleBot;
  private readonly server: SocketServer;
  private readonly mail: any;
  private readonly baseUrl: string;
  constructor(options: FactoryOptions) {
    this.baseUrl = options.baseUrl;
    this.app = options.express;
    this.bot = options.wrangleBot;
    this.server = options.socketServer;
    this.mail = options.mailServer;
  }

  build(options: routeOptions) {
    if (!options.method) throw new Error("Method is required");

    LogBot.log(100, `Building route ${options.method.toUpperCase()} ${this.baseUrl}${options.url}`);

    this.app[options.method](`${this.baseUrl}${options.url}`, async (req, res) => {
      try {
        if (options.requiredRole && !this.server.checkRequestAuthorization(req, res, options.requiredRole)) return;

        const resolvedHandler = await options.handler(req, res, this.bot, this.server);

        if (resolvedHandler) {
          res.status(resolvedHandler.status).send(resolvedHandler.result);
          LogBot.log(200, `[API] ${options.method.toUpperCase()} ${this.baseUrl}${options.url} by IP ${req.ip}`);
        }
      } catch (e: any) {
        LogBot.log(500, `[API] ${options.method.toUpperCase()} ${this.baseUrl}${options.url} by IP ${req.ip}`);
        console.error(e);
        res.status(500).send({
          status: "error",
          message: e.message,
        });
      }
    });
  }
}
