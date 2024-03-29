import { WrangleBot } from "../../../core/WrangleBot.js";
import { SocketServer } from "../../SocketServer.js";
import RouteResult from "../../RouteResult.js";

export default {
  method: "get",
  url: "/library/",
  handler: async (req, res, bot: WrangleBot, server: SocketServer) => {
    const libraries = await bot.query.library.many().fetch();

    return new RouteResult(200, libraries.length > 0 ? libraries.map((l) => l.toJSON()) : []);
  },
};
