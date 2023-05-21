import { WrangleBot } from "../../../core/WrangleBot.js";
import { SocketServer } from "../../SocketServer.js";

import RouteResult from "../../RouteResult.js";

export default {
  method: "get",
  requiredRole: ["admin", "maintainer", "contributor"],
  url: "/volumes",
  handler: async (req, res, bot: WrangleBot, server: SocketServer) => {
    const drives = await bot.query.volumes.many().fetch();

    return new RouteResult(
      200,
      drives.map((drive) => drive.stats)
    );
  },
};
