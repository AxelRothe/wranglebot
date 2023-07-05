import { WrangleBot } from "../../../core/WrangleBot.js";
import { SocketServer } from "../../SocketServer.js";
import RouteResult from "../../RouteResult.js";

export default {
  method: "post",
  url: "/library/:id/metafiles/",
  handler: async (req, res, bot: WrangleBot, server: SocketServer) => {
    const { id } = req.params;
    const { path, template } = req.body;
    if (!path && !template) throw new Error("Either path or template is required");

    const metafile = await bot.query.library.one(id).metafiles.post(path || template);

    return new RouteResult(200, metafile.toJSON());
  },
};
