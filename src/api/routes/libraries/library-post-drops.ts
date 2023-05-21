import { WrangleBot } from "../../../core/WrangleBot.js";
import { SocketServer } from "../../SocketServer.js";
import RouteResult from "../../RouteResult.js";

export default {
  method: "post",
  requiredRole: ["admin", "maintainer"],
  url: "/library/:id/drops/",
  handler: async (req, res, bot: WrangleBot, server: SocketServer) => {
    const libraryId = req.params.id;
    const pairs = req.body;

    const library = await bot.query.library.one(libraryId).fetch();

    for (let [key, value] of Object.entries(pairs)) {
      await library.updateMetaData(key, value);
    }

    return new RouteResult(200, {
      status: "success",
      message: `Updated drops for library ${library.name}`,
    });
  },
};
