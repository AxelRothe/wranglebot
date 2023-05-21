import { WrangleBot } from "../../../core/WrangleBot.js";
import { SocketServer } from "../../SocketServer.js";
import LogBot from "logbotjs";
import RouteResult from "../../RouteResult.js";

export default {
  method: "post",
  requiredRole: ["admin", "maintainer", "contributor"],
  url: "/utility/index",
  handler: async (req, res, bot: WrangleBot, server: SocketServer) => {
    const { path, types } = req.body;

    if (bot.finder.existsSync(path)) {
      return new RouteResult(200, await bot.utility.index(path, types));
    } else {
      throw new Error("Path not found or missing required permissions");
    }
  },
};
