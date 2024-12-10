import Client from "./Client.js";
import { WrangleBot } from "../core/WrangleBot.js";
import express from "express";
import Betweeny from "./Betweeny.js";
import { EmailTemplate, EmailTemplateOptions } from "./EmailTemplate.js";

import { Server, Socket } from "socket.io";
import LogBot from "logbotjs";
import jwt from "jsonwebtoken";
import User from "../core/accounts/User.js";
import { config, finder } from "../core/system/index.js";

/* IMPORT ROUTES */

import routes from "./routes/index.js";
import RouteFactory from "./RouteFactory.js";

/* INTERFACES */

interface SocketHook {
  event: string;
  callback: (data: any) => void;
}

/* CLASS */

class SocketServer {
  server: Server;
  app: express.Application;
  // this is temp until we have a better way to manage sockets
  users = [];
  clients: Client[] = [];
  hooks: SocketHook[] = [];
  sockets = new Set();

  private readonly secret: string;
  bot: WrangleBot;
  mail;

  private cache = {};

  constructor(http, app, bot, mail, secret: string) {
    // @ts-ignore
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

  async start() {
    this.server.on("connection", (socket) => {
      //Send back the client that it has connected
      this.response(200).tween(socket, "connected", {
        message: "Connected",
      });

      this.sockets.add(socket); //add the socket to the set of sockets
      LogBot.log(200, "new connection " + socket.id, true);

      /*
      Open reconnect listener
       */
      this.server.on("reconnect", (socket) => {
        LogBot.log(200, "reconnect " + socket.id, true);
      });

      /*
      Open disconnect listener
       */

      socket.on("disconnect", () => {
        LogBot.log(200, "disconnected " + socket.id, true);
        this.sockets.delete(socket);
      });

      /* AUTHENTICATION */

      socket.once("auth", (betweeny) => {
        const { username, password, token } = betweeny.data;
        const user = this.checkAuth(username || null, password || null, token || null);

        if (user) {
          //User has been authenticated
          LogBot.log(200, "Authenticated " + user.username);

          //find client in existing clients
          const client: Client | undefined = this.clients.find((client) => client.username === user.username);

          if (client) {
            //if client exists, update the socket
            client.socket = socket;
            client.syncHooks();
            LogBot.log(200, "Client " + user.username + " has been remapped to previous socket");
          } else {
            //if client does not exist, create a new client
            const newClient = new Client(socket, user.username);
            this.clients.push(newClient);
            this.setHooks(newClient);

            user.token = this.#signToken(user);
            LogBot.log(200, "New session was opened for " + user.username);
          }

          //Send back the client that it has connected
          this.response(200).tween(socket, "token", {
            token: user.token,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            libraries: user.libraries,
            roles: user.roles,
          });
        } else {
          LogBot.log(401, "Authentication of user " + username + " failed");
          this.response(401).tween(socket, "token", {
            status: "error",
            message: "Authorization failed. Please check your username and password",
          });
          this.sockets.delete(socket);
        }
      });
    });

    /* ROUTES */

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

    //scan the plugins folder in the wranglebot directory
    //and load the routes from the plugins
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

            const template = await import(pathToPlugins + plugin + "/endpoints/" + r);

            routeFactory.build(template.default);
          }
        }
      }
    }

    /*
    SUBSCRIPTIONS
     */

    //subscribe the client to changes and updates to the task
    this.hook("subscribe", async (client: Client, betweeny: Betweeny) => {
      try {
        const { data } = betweeny;
        const { event, id } = data;

        this.subscribe(client, event, id);
      } catch (e: any) {
        console.error(e);
      }
    });

    //unsubscribe the client to changes and updates to the task
    this.hook("unsubscribe", async (client: Client, betweeny: Betweeny) => {
      try {
        const { data } = betweeny;
        const { event, id } = data;

        this.unsubscribe(client, event, id);
      } catch (e: any) {
        console.error(e);
      }
    });

    /*
    End start
     */

    return this;
  }

  close() {
    this.server.close();
  }

  #signToken(user, expiresIn = "30 days") {
    return jwt.sign(
      {
        user: user.username,
      },
      this.secret,
      { expiresIn }
    );
  }

  /**
   * Signs in a client with a given username and password
   *
   * @param username {string|null}
   * @param password {string|null}
   * @param token {string|null}
   * @returns {Error|{Client}}
   */
  signInClient(username, password, token) {
    const user = this.checkAuth(username, password, token);
    if (user === null) {
      throw new Error("Authentication failed");
    }
    if (!user.token) user.token = this.#signToken(user);
    return user;
  }

  /**
   * Returns a User object if the username and password or token are correct
   *
   * @param username
   * @param password
   * @param token
   * @returns {User}
   */
  checkAuth(username = null, password = null, token = null): User | null {
    if (token) {
      return this.#jwtValid(token);
    } else if (username && password) {
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
    } else if (userOrJWT instanceof String) {
      const user = this.#jwtValid(userOrJWT);
      if (user) {
        return this.bot.accountManager.hasRole(user, role);
      }
    }
    return false;
  }

  /**
   *
   * @param token
   * @returns {User|null}
   */
  #jwtValid(token): User | null {
    try {
      const decoded = jwt.verify(token, this.secret);
      const user = this.bot.accountManager.getOneUser(decoded.user);
      if (user) return user;
    } catch (e) {
      return null;
    }
    return null;
  }

  /**
   * Checks if the token is valid
   * @param req the request
   * @param res the response
   * @param {string[]} roles
   * @returns {boolean} true if the token is valid
   */
  checkRequestAuthorization = (req, res, roles: string[] = []): User | false => {
    const auth = req.get("authorization");
    if (!auth || !auth.startsWith("Bearer ")) {
      res.status(401).send({ error: `Invalid Authorization Format or Token. Should be: Bearer <token>.` });
      return false;
    }

    const token = auth.split(" ")[1];

    const user = this.#jwtValid(token);

    if (!user || (user && roles.length > 0 && !this.bot.accountManager.hasRole(user, roles))) {
      res.status(401).send({
        status: "error",
        message: `Invalid Token or no permission to access this resource. Clearance: ${roles}, ${
          user ? "roles assigned to your user: " + user.roles.join(",") : "you are not logged in"
        }`,
      });
      return false;
    }
    return user;
  };

  isUser(req, res, username) {
    const token = req.get("authorization");
    const user = this.#jwtValid(token);
    return !(!user || user.username !== username);
  }

  /**
   *
   * @param req
   * @param res
   * @returns {User}
   */
  getUser(req, res): User {
    const auth = req.get("authorization");
    const token = auth.split(" ")[1];
    const user = this.#jwtValid(token);
    if (user === null) {
      res.status(401).send({
        error: LogBot.resolveErrorCode(401),
      });
      throw new Error("Invalid token");
    }
    return user;
  }

  async sendMail(emailTemplate) {
    try {
      return await this.mail.sendMail(this.createEmailTemplate(emailTemplate).compile());
    } catch (e) {
      console.error(e);
      return false;
    }
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

  setHooks(client: Client, socket = null) {
    for (let hook of this.hooks) {
      client.addHook(hook.event, hook.callback);
    }
  }

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
  subscribe(client: Client, event: string, id: string): void {
    if (!client.subscriptions[event]) client.subscriptions[event] = [];
    client.subscriptions[event].push(id);
  }

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
  unsubscribe(client: Client, event: string, id: string) {
    if (!client.subscriptions[event]) return;
    client.subscriptions[event] = client.subscriptions[event].filter((sub) => sub !== id);
  }

  getSubscriptions(user: User): any {
    //find the client of the user
    const client = this.clients.find((client) => client.username === user.username);
    if (!client) return [];
    return client.subscriptions;
  }

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
  broadcast(event, betweeny) {
    this.clients.forEach((client) => {
      client.socket.emit(event, betweeny.toJSON());
      LogBot.log(100, "Broadcasting to " + client.username);
    });
  }

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

  /**
   * Creates a response
   * @param {number} status the status code
   * @returns {{tween: function(socket : Socket, event : string, data: any)}}
   */
  response(status) {
    return {
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
      tween: (socket: Socket | null, event: string, data: any) => {
        if (socket === null) {
          this.broadcast(event, new Betweeny(status, data));
        } else {
          socket.emit(event, new Betweeny(status, data).toJSON());
        }
      },
    };
  }

  createEmailTemplate(email: EmailTemplateOptions) {
    return new EmailTemplate(email);
  }
}

export default async function (http, app, bot, mail, secret) {
  try {
    const socketServer = new SocketServer(http, app, bot, mail, secret);
    await socketServer.start();
    LogBot.log(200, `Socket server started.`);

    return socketServer;
  } catch (e: any) {
    LogBot.log(500, `Socket server failed to start: ${e.message}`);
    throw e;
  }
}
export { SocketServer, Betweeny, Client };
