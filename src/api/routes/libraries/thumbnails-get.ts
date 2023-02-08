import { SocketServer } from "../../SocketServer";
import { WrangleBot } from "../../../WrangleBot";
import RouteResult from "../../RouteResult";

export default {
  method: "get",
  url: "/library/:id/metafiles/:file/thumbnails/:grab",
  handler: async (req, res, bot: WrangleBot, server: SocketServer) => {
    const { id, file, grab } = req.params;

    const metaFile = await bot.query.library.one(id).metafiles.one(file).fetch();

    try {
      switch (grab) {
        case "all":
          const thumbnails = await metaFile.query.thumbnails.all.fetch();
          const t = thumbnails.map((thumbnail) => thumbnail.toJSON());
          return new RouteResult(200, await Promise.all(t));
        case "first":
          const tFirst = await metaFile.query.thumbnails.first.fetch();
          return new RouteResult(200, await tFirst.toJSON());
        case "last":
          const tLast = await metaFile.query.thumbnails.last.fetch();
          return new RouteResult(200, await tLast.toJSON());
        case "center":
          const tCenter = await metaFile.query.thumbnails.center.fetch();
          return new RouteResult(200, await tCenter.toJSON());
        default:
          const thumbnail = await metaFile.query.thumbnails.one(grab).fetch();
          return new RouteResult(200, await thumbnail.toJSON());
      }
    } catch (e) {
      return new RouteResult(404, { success: false, message: "thumbnail not found" });
    }
  },
};
