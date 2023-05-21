import { SocketServer } from "../../SocketServer.js";
import { WrangleBot } from "../../../core/WrangleBot.js";
import RouteResult from "../../RouteResult.js";

export default {
  method: "get",
  url: "/library/:id/metafiles/:file/thumbnails/:grab",
  handler: async (req, res, bot: WrangleBot, server: SocketServer) => {
    const { id, file, grab } = req.params;
    const { pagination, paginationStart, paginationEnd, extended } = req.query;

    const metaFile = await bot.query.library.one(id).metafiles.one(file).fetch();

    try {
      switch (grab) {
        case "all":
          const thumbnails = await metaFile.query.thumbnails.many().fetch();

          let t = [];

          if (extended) {
            t = thumbnails.map((thumbnail) => thumbnail.toJSON());
          } else {
            t = thumbnails.map((t) => t.id);
          }

          if (pagination) {
            if (!paginationStart || !paginationEnd) throw new Error("Missing pagination parameters");
            t = t.slice(paginationStart, paginationEnd);
          }

          return new RouteResult(200, t);
        case "first":
          const tFirst = await metaFile.query.thumbnails.first.fetch();
          return new RouteResult(200, tFirst.toJSON());
        case "last":
          const tLast = await metaFile.query.thumbnails.last.fetch();
          return new RouteResult(200, tLast.toJSON());
        case "center":
          const tCenter = await metaFile.query.thumbnails.center.fetch();
          return new RouteResult(200, tCenter.toJSON());
        default:
          const thumbnail = await metaFile.query.thumbnails.one(grab).fetch();
          return new RouteResult(200, thumbnail.toJSON());
      }
    } catch (e) {
      return new RouteResult(404, { success: false, message: "thumbnail not found" });
    }
  },
};
