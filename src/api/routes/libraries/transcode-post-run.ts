import { WrangleBot } from "../../../WrangleBot";
import { SocketServer } from "../../SocketServer";
import RouteResult from "../../RouteResult";

export default {
  method: "post",
  requiredRole: ["admin", "maintainer", "contributor"],
  url: "/library/:library/transcode/:transcodeId",
  handler: async (req, res, bot: WrangleBot, server: SocketServer) => {
    const { library, transcodeId } = req.params;

    const lib = await bot.query.library.one(library).fetch();

    const cb = (progress) => {
      server.inform("transcode", transcodeId, progress);
    };

    const cancelToken = { cancel: false };
    let cancelTokens = server.getFromCache("cancelTokens");
    if (!cancelTokens) {
      cancelTokens = server.addToCache("cancelTokens", {});
    }
    cancelTokens[transcodeId] = cancelToken;

    const transcodeJob = lib.query.transcodes.one(transcodeId);

    transcodeJob
      .run(cb, cancelToken)
      .then(() => {
        server.inform("transcode", transcodeId, { task: transcodeJob.fetch().toJSON() });
      })
      .catch((e) => {
        console.error(e);
        server.inform("transcode", transcodeId, { error: e.message });
      });

    return new RouteResult(200, {
      status: "success",
      message: `Started transcode job ${await transcodeJob.fetch()
        .label}. Subscribe to Channel: 'transcode' with ${transcodeId} for progress updates.`,
    });
  },
};
