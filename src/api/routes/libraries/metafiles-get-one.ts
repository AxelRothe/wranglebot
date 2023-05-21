import { WrangleBot } from "../../../core/WrangleBot.js";
import { SocketServer } from "../../SocketServer.js";
import RouteResult from "../../RouteResult.js";

export default {
  method: "get",
  url: "/library/:id/metafiles/:file",
  handler: async (req, res, bot: WrangleBot, server: SocketServer) => {
    const metafileId = req.params.file;
    const libraryId = req.params.id;

    const metafile = bot.query.library.one(libraryId).metafiles.one(metafileId).fetch();
    if (metafile) {
      return new RouteResult(200, metafile.toJSON());
    } else {
      throw new Error("Metafile not found");
    }
  },
};
