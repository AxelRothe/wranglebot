import LogBot from "logbotjs";
import { WrangleBot } from "../../../WrangleBot";
import { SocketServer } from "../../SocketServer";
import RouteResult from "../../RouteResult";

export default {
  method: "post",
  requiredParams: ["path"],
  requiredRole: ["admin", "maintainer", "contributor"],
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
