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
    /**
     * Signs in a client with a given username and password
     *
     * @param username {string|null}
     * @param password {string|null}
     * @param token {string|null}
     * @returns {Error|{Client}}
     */
    signInClient(username: any, password: any, token: any): User;
    /**
     * Returns a User object if the username and password or token are correct
     *
     * @param username
     * @param password
     * @param token
     * @returns {User}
     */
    checkAuth(username?: null, password?: null, token?: null): User | null;
    hasRole(userOrJWT: any, role: any): boolean;
    /**
     * Checks if the token is valid
     * @param req the request
     * @param res the response
     * @param {string[]} roles
     * @returns {boolean} true if the token is valid
     */
    checkRequestAuthorization: (req: any, res: any, roles?: string[]) => User | false;
    isUser(req: any, res: any, username: any): boolean;
    /**
     *
     * @param req
     * @param res
     * @returns {User}
     */
    getUser(req: any, res: any): User;
    sendMail(emailTemplate: any): Promise<any>;
    hook(event: any, callback: any): void;
    unhook(event: any): void;
    setHooks(client: Client, socket?: null): void;
    /**
     * Subscribes a client to a given event
     *
     * @example
     * this.subscribe(client, "tasks", "cbc34a59-74ee-4dba-9d50-4bbdc03d52e0");
     *
     * @param client {Client} the client to subscribe
     * @param event {string} the event to subscribe to
     * @param id {string} the uuid of the object to track
     */
    subscribe(client: Client, event: string, id: string): void;
    /**
     * Unsubscribes a client to a given event
     *
     * @example
     * this.unsubscribe(client, "tasks", "cbc34a59-74ee-4dba-9d50-4bbdc03d52e0");
     *
     * @param client {Client} the client to subscribe
     * @param event {string} the event to subscribe to
     * @param id {string} the uuid of the object to track
     */
    unsubscribe(client: Client, event: string, id: string): void;
    getSubscriptions(user: User): any;
    /**
     * Emits data to all connected sockets
     *
     * @example
     * this.broadcast("tasks", new Betweeny(200,{
     *    id: "cbc34a59-74ee-4dba-9d50-4bbdc03d52e0",
     *    name: "My Task",
     *   }));
     *
     * @param {string} event
     * @param {Betweeny} betweeny
     */
    broadcast(event: any, betweeny: any): void;
    /**
     * emits data to subscribed sockets
     *
     * @example
     * this.inform("tasks", "cbc34a59-74ee-4dba-9d50-4bbdc03d52e0")
     *
     * @param event {string} the event to emit
     * @param id {string} the id of the subscription
     * @param data {Object} the data to send
     */
    inform(event: any, id: any, data: any): void;
    /**
     * Creates a response
     * @param {number} status the status code
     * @returns {{tween: function(socket : Socket, event : string, data: any)}}
     */
    response(status: any): {
        /**
         * Sends a Package to a socket
         *
         * @example
         *
         * this.response(200).tween(socket, "tasks", {
         *    id: "cbc34a59-74ee-4dba-9d50-4bbdc03d52e0",
         *    name: "My Task",
         *    description: "My Task Description",
         *   });
         *
         * @param socket {Socket|null} the socket to send to, if null, the response will be sent to all clients
         * @param event {string} the event to send
         * @param data {any} the data to send
         */
        tween: (socket: Socket | null, event: string, data: any) => void;
    };
    createEmailTemplate(email: EmailTemplateOptions): EmailTemplate;
}
export default function (http: any, app: any, bot: any, mail: any, secret: any): Promise<SocketServer>;
export { SocketServer, Betweeny, Client };
//# sourceMappingURL=SocketServer.d.ts.map