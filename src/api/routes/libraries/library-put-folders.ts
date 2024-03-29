import { WrangleBot } from "../../../core/WrangleBot.js";
import { SocketServer } from "../../SocketServer.js";
import RouteResult from "../../RouteResult.js";

export default {
  method: "put",
  requiredRole: ["admin", "maintainer"],
  url: "/library/:libraryId/folders/",
  handler: async (req, res, bot: WrangleBot, server: SocketServer) => {
    const { libraryId } = req.params;
    const { pathToFolder, overwrite } = req.body;

    if (!pathToFolder) throw new Error("Folder is required");
    if (!overwrite) throw new Error("Overwrite Options are required");

    const lib = bot.query.library.one(libraryId).fetch();

    const result = await lib.query.folders.put({
      path: pathToFolder,
      options: overwrite,
    });

    return new RouteResult(200, {
      status: "success",
      message: `Updated folder ${pathToFolder} for library ${libraryId}`,
      result,
    });
  },
};
