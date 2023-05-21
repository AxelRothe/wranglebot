import { WrangleBot } from "../../../core/WrangleBot.js";
import { SocketServer } from "../../SocketServer.js";
import LogBot from "logbotjs";
import RouteResult from "../../RouteResult.js";

export default {
  method: "get",
  url: `/library/:id/metafiles/:file/metacopies/`,
  handler: async (req, res, bot: WrangleBot, server: SocketServer) => {
    const libraryId = req.params.id;
    const file = req.params.file;

    const metaCopies = await bot.query.library.one(libraryId).metafiles.one(file).metacopies.many().fetch();

    return new RouteResult(
      200,
      metaCopies.map((metaCopy) => metaCopy.toJSON())
    );
  },
};
