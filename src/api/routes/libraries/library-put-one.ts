import { WrangleBot } from "../../../WrangleBot";
import { SocketServer } from "../../SocketServer";
import RouteResult from "../../RouteResult";

export default {
  method: "put",
  requiredRole: ["admin"],
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
