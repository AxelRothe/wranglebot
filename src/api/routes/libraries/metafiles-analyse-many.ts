import { SocketServer } from "../../SocketServer";
import { WrangleBot } from "../../../core/WrangleBot";
import RouteResult from "../../RouteResult";
import LogBot from "logbotjs";

export default {
  method: "post",
  requiredRole: ["admin", "maintainer", "contributor"],
  requiredParams: ["libraryId", "metafileId"],
  requiredBody: ["engine", "metafiles", ""],
  url: "/library/:libraryId/metafiles/analyse",
  handler: async (req, res, bot: WrangleBot, server: SocketServer) => {
    if (!bot.ML) {
      return new RouteResult(404, "Machine Learning module not loaded");
    }

    const libraryId = req.params.libraryId;

    const analyseOptions = req.body;
    const { engine, metafiles, resolution, save } = analyseOptions;

    for (let i = 0; i < analyseOptions.metafiles.length; i++) {
      const metafile = await bot.query.library.one(libraryId).metafiles.one(analyseOptions.metafiles[i]).fetch();

      const frames: string[] = [];
      const step = Math.floor(metafile.thumbnails.length / Math.floor(metafile.thumbnails.length * (1 / analyseOptions.resolution)));
      for (let i = 0; i < metafile.thumbnails.length; i += step) {
        frames.push(metafile.thumbnails[i].id);
      }

      const result = await metafile.analyse({
        engine: analyseOptions.engine,
        frames: frames,
        prompt: analyseOptions.prompt,
        temperature: Number(analyseOptions.temperature),
        max_tokens: Number(analyseOptions.max_tokens),
      });

      if (result) {
        if (analyseOptions.save) {
          if (!analyseOptions.save.key) throw new Error("Key is required for saving analyse result");

          const res = await metafile.query.metadata.put({
            key: analyseOptions.save.key,
            value: result.response,
          });
          if (!res) throw new Error("Failed to save analyse result");
        }

        server.inform("database", "metafiles", metafile.toJSON());
      }
    }

    return new RouteResult(200, "Analysis completed");
  },
};
