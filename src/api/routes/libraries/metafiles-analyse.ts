import { SocketServer } from "../../SocketServer";
import { WrangleBot } from "../../../WrangleBot";
import RouteResult from "../../RouteResult";

export default {
  method: "post",
  requiredParams: ["libraryId", "metafileId"],
  requiredBody: ["frames"],
  url: "/library/:libraryId/metafiles/:metafileId/analyse",
  handler: async (req, res, bot: WrangleBot, server: SocketServer) => {
    const libraryId = req.params.libraryId;
    const metafileId = req.params.metafileId;

    const analyseOptions = req.body;

    const result = await bot.query.library.one(libraryId).metafiles.one(metafileId).analyse({
      frames: analyseOptions.frames,
      prompt: analyseOptions.prompt,
    });

    if (result) {
      return new RouteResult(200, result);
    } else {
      return new RouteResult(404, {
        status: "error",
        message: `No metafile found with id ${metafileId}`,
      });
    }
  },
};
