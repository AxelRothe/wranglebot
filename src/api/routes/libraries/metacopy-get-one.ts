import { WrangleBot } from "../../../core/WrangleBot.js";
import { SocketServer } from "../../SocketServer.js";
import RouteResult from "../../RouteResult.js";

export default {
  method: "get",
  url: "/library/:id/metafiles/:file/metacopies/:copy",
  handler: async (req, res, bot: WrangleBot, server: SocketServer) => {
    const libraryId = req.params.id;
    const file = req.params.file;
    const copy = req.params.copy;
    const metaCopy = await bot.query.library.one(libraryId).metafiles.one(file).metacopies.one(copy).fetch();

    return new RouteResult(200, metaCopy.toJSON());
  },
};
