import { SocketServer } from "../../SocketServer.js";
import { WrangleBot } from "../../../core/WrangleBot.js";
import RouteResult from "../../RouteResult.js";
import LogBot from "logbotjs";

export default {
  method: "post",
  requiredParams: ["libraryId", "metafileId"],
  requiredBody: ["engine", "frames"],
  url: "/library/:libraryId/metafiles/:metafileId/thumbnails/analyse",
  handler: async (req, res, bot: WrangleBot, server: SocketServer) => {
    if (!bot.ML) {
      return new RouteResult(404, "Machine Learning module not loaded");
    }

    const libraryId = req.params.libraryId;
    const metafileId = req.params.metafileId;

    const analyseOptions = req.body;

    if (analyseOptions.engine === "aleph-alpha" && !analyseOptions.prompt) throw new Error("Prompt is required for aleph-alpha engine");
    if (analyseOptions.frames.length === 0) throw new Error("Frames are required for analyse. The array must contain at least one frame UUID");

    const result = await bot.query.library
      .one(libraryId)
      .metafiles.one(metafileId)
      .analyse({
        engine: analyseOptions.engine,
        frames: analyseOptions.frames,
        prompt: analyseOptions.prompt,
        temperature: Number(analyseOptions.temperature),
        max_tokens: Number(analyseOptions.max_tokens),
      });

    if (result) {
      if (analyseOptions.save) {
        if (!analyseOptions.save.key) throw new Error("Key is required for saving analyse result");

        const res = bot.query.library.one(libraryId).metafiles.one(metafileId).metadata.put({
          key: analyseOptions.save.key,
          value: result.response,
        });
        if (!res) throw new Error("Failed to save analyse result");
      }

      const metafile = await bot.query.library.one(libraryId).metafiles.one(metafileId).fetch();
      server.inform("database", "metafiles", metafile.toJSON());

      return new RouteResult(200, result);
    } else {
      return new RouteResult(404, {
        status: "error",
        message: `No metafile found with id ${metafileId}`,
      });
    }
  },
};
