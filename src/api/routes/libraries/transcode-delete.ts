import LogBot from "logbotjs";
import { WrangleBot } from "../../../WrangleBot";
import { SocketServer } from "../../SocketServer";
import RouteResult from "../../RouteResult";

export default {
  method: "delete",
  url: "/library/:libraryName/transcode/:transcodeId",
  handler: async (req, res, bot: WrangleBot, server: SocketServer) => {
    const { libraryName, transcodeId } = req.params;
    const result = await bot.query.library.one(libraryName).transcodes.one(transcodeId).delete();
    return new RouteResult(200, { message: "Transcode job deleted" });
  },
};
