import { WrangleBot } from "../../../WrangleBot";
import { SocketServer } from "../../SocketServer";
import LogBot from "logbotjs";
import RouteResult from "../../RouteResult";

export default {
  method: "get",
  url: "/utility/luts",
  handler: async (req, res, bot: WrangleBot, server: SocketServer) => {
    return new RouteResult(200, bot.utility.luts());
  },
};