import express from "express";
import { WrangleBot } from "../core/WrangleBot.js";
import { SocketServer } from "./SocketServer.js";
interface RouteOptions {
    method: string;
    url: string;
    requiredRole?: string[];
    requiredParams?: string[] | undefined;
    requiredBody?: string[] | undefined;
    public?: boolean;
    handler: (req: express.Request, res: express.Response, bot: WrangleBot, server: SocketServer) => Promise<any>;
}
interface FactoryOptions {
    baseUrl: string;
    express: express.Application;
    wrangleBot: WrangleBot;
    socketServer: SocketServer;
    mailServer: any;
}
export default class RouteFactory {
    private readonly app;
    private readonly bot;
    private readonly server;
    private readonly mail;
    private readonly baseUrl;
    constructor(options: FactoryOptions);
    build(options: RouteOptions): void;
}
export {};
//# sourceMappingURL=RouteFactory.d.ts.map