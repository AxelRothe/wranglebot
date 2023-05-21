import { WrangleBot } from "../../../core/WrangleBot.js";
import { SocketServer } from "../../SocketServer.js";
import RouteResult from "../../RouteResult.js";

export default {
  method: "put",
  requiredRole: ["admin", "maintainer"],
  url: "/library/:id",
  handler: async (req, res, bot: WrangleBot, server: SocketServer) => {
    const libraryId = req.params.id;
    const { folders, pathToLibrary, drops } = req.body;
    const lib = await bot.query.library.one(libraryId).fetch();

    await lib.query.put({
      folders,
      pathToLibrary,
      drops,
    });

    return new RouteResult(200, `Updated library ${lib.name}`);
  },
};
