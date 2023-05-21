import { WrangleBot } from "../../../core/WrangleBot.js";
import { SocketServer } from "../../SocketServer.js";
import LogBot from "logbotjs";
import RouteResult from "../../RouteResult.js";

export default {
  method: "post",
  requiredRole: ["admin", "maintainer", "contributor"],
  url: "/volumes/:volumeId/eject",
  handler: async (req, res, bot: WrangleBot, server: SocketServer) => {
    const { volumeId } = req.params;

    await bot.query.volumes.one(volumeId).eject();

    return new RouteResult(200, "Volume ejected");
  },
};
