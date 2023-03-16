import { WrangleBot } from "../../../WrangleBot";
import { SocketServer } from "../../SocketServer";
import RouteResult from "../../RouteResult";

export default {
  method: "post",
  requiredRole: ["admin", "maintainer", "contributor"],
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
