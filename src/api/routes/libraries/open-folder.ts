import { WrangleBot } from "../../../core/WrangleBot";
import { SocketServer } from "../../SocketServer";
import LogBot from "logbotjs";
import RouteResult from "../../RouteResult";

export default {
  method: "post",
  url: "/library/:library/metafiles/:metafile/metacopies/:metaCopy/show",
  handler: async (req, res, bot: WrangleBot, server: SocketServer) => {
    const { library, metafile, metaCopy } = req.params;
    const copy = await bot.query.library.one(library).metafiles.one(metafile).metacopies.one(metaCopy).fetch();

    if (bot.finder.isReachable(copy.pathToBucket.folder)) {
      bot.finder.openInFinder(copy.pathToBucket.folder, (error, stdout, stderr) => {
        if (error) {
          console.log(`error: ${error.message}`);
          return;
        }
        if (stderr) {
          console.log(`stderr: ${stderr}`);
          return;
        }
        LogBot.log(200, `Showing metafile ${copy.metaFile.name} in finder`);
        return new RouteResult(200, {
          message: `Showing metafile ${copy.metaFile.name} in finder`,
        });
      });
    }
  },
};
