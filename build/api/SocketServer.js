var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _SocketServer_instances, _SocketServer_signToken, _SocketServer_jwtValid;
import Client from "./Client.js";
import Betweeny from "./Betweeny.js";
import { EmailTemplate } from "./EmailTemplate.js";
import { Server } from "socket.io";
import LogBot from "logbotjs";
import jwt from "jsonwebtoken";
import User from "../core/accounts/User.js";
import { finder } from "../core/system/index.js";
import routes from "./routes/index.js";
import RouteFactory from "./RouteFactory.js";
class SocketServer {
    constructor(http, app, bot, mail, secret) {
        _SocketServer_instances.add(this);
        this.users = [];
        this.clients = [];
        this.hooks = [];
        this.sockets = new Set();
        this.cache = {};
        this.checkRequestAuthorization = (req, res, roles = []) => {
            const auth = req.get("authorization");
            if (!auth || !auth.startsWith("Bearer ")) {
                res.status(401).send({ error: `Invalid Authorization Format or Token. Should be: Bearer <token>.` });
                return false;
            }
            const token = auth.split(" ")[1];
            const user = __classPrivateFieldGet(this, _SocketServer_instances, "m", _SocketServer_jwtValid).call(this, token);
            if (!user || (user && roles.length > 0 && !this.bot.accountManager.hasRole(user, roles))) {
                res.status(401).send({
                    status: "error",
                    message: `Invalid Token or no permission to access this resource. Clearance: ${roles}, ${user ? "roles assigned to your user: " + user.roles.join(",") : "you are not logged in"}`,
                });
                return false;
            }
            return user;
        };
        this.server = new Server(http, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"],
                allowedHeaders: ["Authorization"],
            },
        });
        this.bot = bot;
        this.mail = mail;
        this.app = app;
        this.secret = secret;
    }
    addToCache(key, value) {
        this.cache[key] = value;
        return this.cache[key];
    }
    getFromCache(key) {
        return this.cache[key];
    }
    removeFromCache(key) {
        delete this.cache[key];
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            this.server.on("connection", (socket) => {
                this.response(200).tween(socket, "connected", {
                    message: "Connected",
                });
                this.sockets.add(socket);
                LogBot.log(200, "new connection " + socket.id, true);
                this.server.on("reconnect", (socket) => {
                    LogBot.log(200, "reconnect " + socket.id, true);
                });
                socket.on("disconnect", () => {
                    LogBot.log(200, "disconnected " + socket.id, true);
                    this.sockets.delete(socket);
                });
                socket.once("auth", (betweeny) => {
                    const { username, password, token } = betweeny.data;
                    const user = this.checkAuth(username || null, password || null, token || null);
                    if (user) {
                        LogBot.log(200, "Authenticated " + user.username);
                        const client = this.clients.find((client) => client.username === user.username);
                        if (client) {
                            client.socket = socket;
                            client.syncHooks();
                            LogBot.log(200, "Client " + user.username + " has been remapped to previous socket");
                        }
                        else {
                            const newClient = new Client(socket, user.username);
                            this.clients.push(newClient);
                            this.setHooks(newClient);
                            user.token = __classPrivateFieldGet(this, _SocketServer_instances, "m", _SocketServer_signToken).call(this, user);
                            LogBot.log(200, "New session was opened for " + user.username);
                        }
                        this.response(200).tween(socket, "token", {
                            token: user.token,
                            username: user.username,
                            email: user.email,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            libraries: user.libraries,
                            roles: user.roles,
                        });
                    }
                    else {
                        LogBot.log(401, "Authentication of user " + username + " failed");
                        this.response(401).tween(socket, "token", {
                            status: "error",
                            message: "Authorization failed. Please check your username and password",
                        });
                        this.sockets.delete(socket);
                    }
                });
            });
            const routeFactory = new RouteFactory({
                baseUrl: "/api/v1",
                express: this.app,
                wrangleBot: this.bot,
                socketServer: this,
                mailServer: this.mail,
            });
            for (let route of routes) {
                routeFactory.build(route);
            }
            const pathToPlugins = finder.getPathToUserData("custom/");
            const plugins = finder.getContentOfFolder(pathToPlugins);
            for (let plugin of plugins) {
                const pluginFolders = finder.getContentOfFolder(pathToPlugins + plugin);
                if (pluginFolders.length === 0) {
                    continue;
                }
                LogBot.log(100, "Loading third party endpoints of " + plugin);
                for (let pluginFolder of pluginFolders) {
                    if (pluginFolder === "endpoints") {
                        const pluginRoutes = finder.getContentOfFolder(pathToPlugins + plugin + "/endpoints");
                        for (let r of pluginRoutes) {
                            LogBot.log(100, "Loading third party endpoint " + r + " of " + plugin);
                            const template = yield import(pathToPlugins + plugin + "/endpoints/" + r);
                            routeFactory.build(template.default);
                        }
                    }
                }
            }
            this.hook("subscribe", (client, betweeny) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const { data } = betweeny;
                    const { event, id } = data;
                    this.subscribe(client, event, id);
                }
                catch (e) {
                    console.error(e);
                }
            }));
            this.hook("unsubscribe", (client, betweeny) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const { data } = betweeny;
                    const { event, id } = data;
                    this.unsubscribe(client, event, id);
                }
                catch (e) {
                    console.error(e);
                }
            }));
            return this;
        });
    }
    close() {
        this.server.close();
    }
    signInClient(username, password, token) {
        const user = this.checkAuth(username, password, token);
        if (user === null) {
            throw new Error("Authentication failed");
        }
        if (!user.token)
            user.token = __classPrivateFieldGet(this, _SocketServer_instances, "m", _SocketServer_signToken).call(this, user);
        return user;
    }
    checkAuth(username = null, password = null, token = null) {
        if (token) {
            return __classPrivateFieldGet(this, _SocketServer_instances, "m", _SocketServer_jwtValid).call(this, token);
        }
        else if (username && password) {
            const res = this.bot.accountManager.checkAuth(username, password);
            if (res) {
                const u = this.bot.accountManager.getOneUser(username);
                return u ? u : null;
            }
        }
        return null;
    }
    hasRole(userOrJWT, role) {
        if (userOrJWT instanceof User) {
            return this.bot.accountManager.hasRole(userOrJWT, role);
        }
        else if (userOrJWT instanceof String) {
            const user = __classPrivateFieldGet(this, _SocketServer_instances, "m", _SocketServer_jwtValid).call(this, userOrJWT);
            if (user) {
                return this.bot.accountManager.hasRole(user, role);
            }
        }
        return false;
    }
    isUser(req, res, username) {
        const token = req.get("authorization");
        const user = __classPrivateFieldGet(this, _SocketServer_instances, "m", _SocketServer_jwtValid).call(this, token);
        return !(!user || user.username !== username);
    }
    getUser(req, res) {
        const auth = req.get("authorization");
        const token = auth.split(" ")[1];
        const user = __classPrivateFieldGet(this, _SocketServer_instances, "m", _SocketServer_jwtValid).call(this, token);
        if (user === null) {
            res.status(401).send({
                error: LogBot.resolveErrorCode(401),
            });
            throw new Error("Invalid token");
        }
        return user;
    }
    sendMail(emailTemplate) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.mail.sendMail(this.createEmailTemplate(emailTemplate).compile());
            }
            catch (e) {
                console.error(e);
                return false;
            }
        });
    }
    hook(event, callback) {
        LogBot.log(200, "Hooking " + event, true);
        this.hooks.push({
            event,
            callback,
        });
        for (let client of this.clients) {
            client.socket.removeAllListeners(event);
            client.addHook(event, callback);
        }
    }
    unhook(event) {
        LogBot.log(200, "Unhooking " + event, true);
        for (let client of this.clients) {
            client.socket.removeAllListeners(event);
        }
    }
    setHooks(client, socket = null) {
        for (let hook of this.hooks) {
            client.addHook(hook.event, hook.callback);
        }
    }
    subscribe(client, event, id) {
        if (!client.subscriptions[event])
            client.subscriptions[event] = [];
        client.subscriptions[event].push(id);
    }
    unsubscribe(client, event, id) {
        if (!client.subscriptions[event])
            return;
        client.subscriptions[event] = client.subscriptions[event].filter((sub) => sub !== id);
    }
    getSubscriptions(user) {
        const client = this.clients.find((client) => client.username === user.username);
        if (!client)
            return [];
        return client.subscriptions;
    }
    broadcast(event, betweeny) {
        this.clients.forEach((client) => {
            client.socket.emit(event, betweeny.toJSON());
            LogBot.log(100, "Broadcasting to " + client.username);
        });
    }
    inform(event, id, data) {
        for (let client of this.clients) {
            if (client.subscriptions[event] && client.subscriptions[event].includes(id)) {
                this.response(200).tween(client.socket, "subscription", {
                    event,
                    id,
                    data,
                });
            }
        }
    }
    response(status) {
        return {
            tween: (socket, event, data) => {
                if (socket === null) {
                    this.broadcast(event, new Betweeny(status, data));
                }
                else {
                    socket.emit(event, new Betweeny(status, data).toJSON());
                }
            },
        };
    }
    createEmailTemplate(email) {
        return new EmailTemplate(email);
    }
}
_SocketServer_instances = new WeakSet(), _SocketServer_signToken = function _SocketServer_signToken(user, expiresIn = "30 days") {
    return jwt.sign({
        user: user.username,
    }, this.secret, { expiresIn });
}, _SocketServer_jwtValid = function _SocketServer_jwtValid(token) {
    try {
        const decoded = jwt.verify(token, this.secret);
        const user = this.bot.accountManager.getOneUser(decoded.user);
        if (user)
            return user;
    }
    catch (e) {
        return null;
    }
    return null;
};
export default function (http, app, bot, mail, secret) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const socketServer = new SocketServer(http, app, bot, mail, secret);
            yield socketServer.start();
            LogBot.log(200, `Socket server started.`);
            return socketServer;
        }
        catch (e) {
            LogBot.log(500, `Socket server failed to start: ${e.message}`);
            throw e;
        }
    });
}
export { SocketServer, Betweeny, Client };
//# sourceMappingURL=SocketServer.js.map