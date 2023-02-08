import { WrangleBot } from "../../../WrangleBot";
import { SocketServer } from "../../SocketServer";

import LogBot from "logbotjs";
import RouteResult from "../../RouteResult";

export default {
  method: "get",
  url: "/volumes",
  handler: async (req, res, bot: WrangleBot, server: SocketServer) => {
    const drives = await bot.query.volumes.many().fetch();

    return new RouteResult(
      200,
      drives.map((drive) => drive.stats)
    );
  },
};
