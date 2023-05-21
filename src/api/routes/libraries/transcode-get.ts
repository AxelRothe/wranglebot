import { WrangleBot } from "../../../core/WrangleBot.js";
import { SocketServer } from "../../SocketServer.js";
import RouteResult from "../../RouteResult.js";

export default {
  method: "get",
  url: "/library/:libraryName/transcode",
  handler: async (req, res, bot: WrangleBot, server: SocketServer) => {
    const { libraryName } = req.params;

    const lib = await bot.query.library.one(libraryName).fetch();
    const transcodeJobs = lib.query.transcodes.many().fetch();

    return new RouteResult(
      200,
      transcodeJobs.map((t) => t.toJSON())
    );
  },
};
