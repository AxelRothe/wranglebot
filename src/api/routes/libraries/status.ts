import { WrangleBot } from "../../../core/WrangleBot.js";
import { SocketServer } from "../../SocketServer.js";
import RouteResult from "../../RouteResult.js";

export default {
  method: "get",
  url: "/status",
  handler: async (req, res, bot: WrangleBot, server: SocketServer) => {
    return new RouteResult(200, {
      database: bot.db.offline ? "offline" : "online",
    });
  },
};
