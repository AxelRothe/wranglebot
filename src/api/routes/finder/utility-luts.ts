import { WrangleBot } from "../../../core/WrangleBot.js";
import { SocketServer } from "../../SocketServer.js";
import LogBot from "logbotjs";
import RouteResult from "../../RouteResult.js";

export default {
  method: "get",
  url: "/utility/luts",
  handler: async (req, res, bot: WrangleBot, server: SocketServer) => {
    return new RouteResult(200, bot.utility.luts());
  },
};
