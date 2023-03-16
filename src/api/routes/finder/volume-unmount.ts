import { WrangleBot } from "../../../WrangleBot";
import { SocketServer } from "../../SocketServer";
import LogBot from "logbotjs";
import RouteResult from "../../RouteResult";

export default {
  method: "post",
  requiredRole: ["admin", "editor"],
  url: "/volumes/:volumeId/eject",
  handler: async (req, res, bot: WrangleBot, server: SocketServer) => {
    const { volumeId } = req.params;

    await bot.query.volumes.one(volumeId).eject();

    return new RouteResult(200, "Volume ejected");
  },
};
