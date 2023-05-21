import LogBot from "logbotjs";
import type { WrangleBot } from "../../../core/WrangleBot.js";
import { SocketServer } from "../../SocketServer.js";
import RouteResult from "../../RouteResult.js";

export default {
  method: "post",
  url: "/login",
  public: true,
  handler: async (req, res, bot: WrangleBot, server: SocketServer) => {
    const { username, password, token } = req.body;

    if ((!username || !password) && !token) {
      return new RouteResult(404, LogBot.resolveErrorCode(400) + ": username and password are required");
    }

    const client = server.signInClient(username || null, password || null, token || null);

    return new RouteResult(200, {
      token: client.token,
    });
  },
};
