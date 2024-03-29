import { SocketServer } from "../../SocketServer.js";
import { WrangleBot } from "../../../core/WrangleBot.js";
import RouteResult from "../../RouteResult.js";

export default {
  method: "post",
  url: "/library/:id/metafiles/:file/thumbnails",
  handler: async (req, res, bot: WrangleBot, server: SocketServer) => {
    const { id, file, grab } = req.params;

    const cb = (data) => {
      server.inform("thumbnails", file, data);
    };

    const metaFile = await bot.query.library.one(id).metafiles.one(file).fetch();

    if (metaFile.thumbnails.length === 0) {
      bot
        .generateThumbnails(id, [metaFile], cb)
        .then(() => {
          server.inform("thumbnails", file, { status: "done" });
        })
        .catch((e) => {
          console.error(e);
          server.inform("thumbnails", file, { error: e.message });
        });

      return new RouteResult(200, { success: true, message: "thumbnails are being generated." });
    } else {
      return new RouteResult(200, { success: true, message: "thumbnails already exist." });
    }
  },
};
