import LogBot from "logbotjs";
import { WrangleBot } from "../../../core/WrangleBot.js";
import { SocketServer } from "../../SocketServer.js";
import RouteResult from "../../RouteResult.js";

export default {
  method: "delete",
  requiredRole: ["admin", "maintainer"],
  url: "/library/:libraryName/transcode/:transcodeId",
  handler: async (req, res, bot: WrangleBot, server: SocketServer) => {
    const { libraryName, transcodeId } = req.params;
    const result = await bot.query.library.one(libraryName).transcodes.one(transcodeId).delete();
    return new RouteResult(200, { message: "Transcode job deleted" });
  },
};
