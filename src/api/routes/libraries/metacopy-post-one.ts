import { WrangleBot } from "../../../core/WrangleBot.js";
import { SocketServer } from "../../SocketServer.js";
import RouteResult from "../../RouteResult.js";

export default {
  method: "post",
  url: "/library/:id/metafiles/:file/metacopies/",
  handler: async (req, res, bot: WrangleBot, server: SocketServer) => {
    const { id, file } = req.params;
    const body = req.body;

    const metacopy = await bot.query.library.one(id).metafiles.one(file).metacopies.post(body);

    return new RouteResult(200, metacopy.toJSON());
  },
};
