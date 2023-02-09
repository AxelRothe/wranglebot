import { WrangleBot } from "../../../WrangleBot";
import { SocketServer } from "../../SocketServer";
import RouteResult from "../../RouteResult";

export default {
  method: "put",
  url: "/library/:libraryId/folders/",
  handler: async (req, res, bot: WrangleBot, server: SocketServer) => {
    const { libraryId } = req.params;
    const { pathToFolder, overwrite } = req.body;

    if (!pathToFolder) throw new Error("Folder is required");
    if (!overwrite) throw new Error("Overwrite Options are required");

    const lib = bot.query.library.one(libraryId).fetch();
    const result = await lib.query.folders.put(pathToFolder, overwrite);
    if (!result) {
      throw new Error("Failed to update folders");
    }

    return new RouteResult(200, {
      status: "success",
      message: `Updated folder ${pathToFolder} for library ${libraryId}`,
      result,
    });
  },
};