import { WrangleBot } from "../../../WrangleBot";
import { SocketServer } from "../../SocketServer";
import LogBot from "logbotjs";
import RouteResult from "../../RouteResult";

export default {
  method: "delete",
  requiredRole: ["admin", "maintainer"],
  url: "/library/:libraryName/metafiles/:metaFileId/metacopies/:metaCopyId",
  handler: async (req, res, bot: WrangleBot, server: SocketServer) => {
    const { libraryName, metaFileId, metaCopyId } = req.params;
    const { deleteFile } = req.body;

    const lib = await bot.query.library.one(libraryName).fetch();
    const metaFile = lib.query.metafiles.one(metaFileId).fetch();
    await metaFile.query.metacopies.one(metaCopyId).delete({
      deleteFile: deleteFile || false,
    });

    LogBot.log(200, `[API] DELETE /library/${libraryName}/metafiles/${metaFileId}/metacopies/${metaCopyId} by IP ${req.ip}`);
    return new RouteResult(200, {
      status: "success",
      message: `Deleted metacopy ${metaCopyId} from ${metaFile.basename}`,
    });
  },
};
