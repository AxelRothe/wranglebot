import { WrangleBot } from "../../../WrangleBot";
import { SocketServer } from "../../SocketServer";
import RouteResult from "../../RouteResult";

export default {
  method: "get",
  requiredRole: ["admin", "maintainer", "contributor"],
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
