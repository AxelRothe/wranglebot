import { WrangleBot } from "../../../core/WrangleBot.js";
import { SocketServer } from "../../SocketServer.js";
import RouteResult from "../../RouteResult.js";

export default {
  method: "get",
  url: "/library/:libraryName/metafiles",
  handler: async (req, res, bot: WrangleBot, server: SocketServer) => {
    const { libraryName } = req.params;
    const { pagination, paginationStart, paginationEnd, extended } = req.query;

    const metaFiles = bot.query.library.one(libraryName).metafiles.many({}).fetch();
    if (extended) {
      return new RouteResult(
        200,
        metaFiles.map((metaFile) => metaFile.toJSON())
      );
    } else if (pagination) {
      return new RouteResult(
        200,
        metaFiles.slice(paginationStart, paginationEnd).map((f) => f.id)
      );
    } else {
      return new RouteResult(
        200,
        metaFiles.map((f) => f.id)
      );
    }
  },
};
