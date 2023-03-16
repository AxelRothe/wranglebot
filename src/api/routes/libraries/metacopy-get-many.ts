import { WrangleBot } from "../../../core/WrangleBot";
import { SocketServer } from "../../SocketServer";
import LogBot from "logbotjs";
import RouteResult from "../../RouteResult";

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
