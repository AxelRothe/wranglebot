import { SocketServer } from "../../SocketServer";
import { WrangleBot } from "../../../core/WrangleBot";
import RouteResult from "../../RouteResult";

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
      bot.generateThumbnails(id, [metaFile], cb).then(() => {
        server.inform("thumbnails", file, { status: "done" });
      });

      return new RouteResult(200, { success: true, message: "thumbnails are being generated." });
    } else {
      return new RouteResult(200, { success: true, message: "thumbnails already exist." });
    }
  },
};
