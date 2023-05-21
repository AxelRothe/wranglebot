import LogBot from "logbotjs";
import { WrangleBot } from "../../../core/WrangleBot.js";
import { SocketServer } from "../../SocketServer.js";
import RouteResult from "../../RouteResult.js";

export default {
  method: "post",
  requiredParams: ["path"],
  url: "/utility/list",
  handler: async (req, res, bot: WrangleBot, socketServer: SocketServer) => {
    let { path, options } = req.body;

    const result = bot.utility.list(path, options);
    if (!result) {
      throw new Error("Error listing files");
    }
    return new RouteResult(200, result);
  },
};
