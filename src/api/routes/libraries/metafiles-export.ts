import { WrangleBot } from "../../../core/WrangleBot.js";
import { SocketServer } from "../../SocketServer.js";
import RouteResult from "../../RouteResult.js";

export default {
  method: "post",
  url: "/library/:libraryName/metafiles/export",
  handler: async (req, res, bot: WrangleBot, server: SocketServer) => {
    const libraryName = req.params.libraryName;
    const { files, path, reportName, format, template, credits } = req.body;

    const lib = await bot.query.library.one(libraryName).fetch();

    const result = lib.query.metafiles
      .many({
        $ids: [...files],
      })
      .export.report({
        reportName: reportName,
        pathToExport: path,
        uniqueNames: true,
        format: format,
        template: template,
        credits: {
          owner: credits.owner || lib.drops.getCols()["owner"] || "Unknown",
          title: credits.title || "Clip Report",
        },
      });

    if (result) {
      return new RouteResult(200, {
        status: "success",
        message: `Exported ${files.length} files to ${path}`,
      });
    } else {
      throw new Error("Could not export report");
    }
  },
};
