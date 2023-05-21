import { WrangleBot } from "../../../core/WrangleBot.js";
import { SocketServer } from "../../SocketServer.js";
import RouteResult from "../../RouteResult.js";

export default {
  method: "delete",
  requiredRole: ["admin"],
  url: "/library/:name",
  handler: async (req, res, bot: WrangleBot, server: SocketServer) => {
    const name = req.params.name;
    const result = await bot.query.library.one(name).delete();

    if (result) {
      return new RouteResult(200, {
        status: "success",
        message: `Library ${name} deleted`,
      });
    } else {
      throw new Error(`Library ${name} not found`);
    }
  },
};
