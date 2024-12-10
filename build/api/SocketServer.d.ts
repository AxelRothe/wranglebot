import Client from "./Client.js";
import { WrangleBot } from "../core/WrangleBot.js";
import express from "express";
import Betweeny from "./Betweeny.js";
import { EmailTemplate, EmailTemplateOptions } from "./EmailTemplate.js";
import { Server, Socket } from "socket.io";
import User from "../core/accounts/User.js";
interface SocketHook {
    event: string;
    callback: (data: any) => void;
}
declare class SocketServer {
    #private;
    server: Server;
    app: express.Application;
    users: never[];
    clients: Client[];
    hooks: SocketHook[];
    sockets: Set<unknown>;
    private readonly secret;
    bot: WrangleBot;
    mail: any;
    private cache;
    constructor(http: any, app: any, bot: any, mail: any, secret: string);
    addToCache(key: any, value: any): any;
    getFromCache(key: any): any;
    removeFromCache(key: any): void;
    start(): Promise<this>;
    close(): void;
    signInClient(username: any, password: any, token: any): User;
    checkAuth(username?: null, password?: null, token?: null): User | null;
    hasRole(userOrJWT: any, role: any): boolean;
    checkRequestAuthorization: (req: any, res: any, roles?: string[]) => User | false;
    isUser(req: any, res: any, username: any): boolean;
    getUser(req: any, res: any): User;
    sendMail(emailTemplate: any): Promise<any>;
    hook(event: any, callback: any): void;
    unhook(event: any): void;
    setHooks(client: Client, socket?: null): void;
    subscribe(client: Client, event: string, id: string): void;
    unsubscribe(client: Client, event: string, id: string): void;
    getSubscriptions(user: User): any;
    broadcast(event: any, betweeny: any): void;
    inform(event: any, id: any, data: any): void;
    response(status: any): {
        tween: (socket: Socket | null, event: string, data: any) => void;
    };
    createEmailTemplate(email: EmailTemplateOptions): EmailTemplate;
}
export default function (http: any, app: any, bot: any, mail: any, secret: any): Promise<SocketServer>;
export { SocketServer, Betweeny, Client };
//# sourceMappingURL=SocketServer.d.ts.map