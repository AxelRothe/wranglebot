import { WrangleBot } from "../../../core/WrangleBot.js";
import { SocketServer } from "../../SocketServer.js";
import RouteResult from "../../RouteResult.js";

export default {
  method: "post",
  url: "/library/:library/transcode/:transcodeId/cancel",
  handler: async (req, res, bot: WrangleBot, server: SocketServer) => {
    const { library, transcodeId } = req.params;

    let cancelTokens = server.getFromCache("cancelTokens");
    cancelTokens[transcodeId].cancel = true;

    return new RouteResult(200, {
      status: "success",
      message: `Stopped transcode job.`,
    });
  },
};
