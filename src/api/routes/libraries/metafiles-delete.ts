import LogBot from "logbotjs";
import { WrangleBot } from "../../../WrangleBot";
import { SocketServer } from "../../SocketServer";
import RouteResult from "../../RouteResult";

export default {
  method: "delete",
  requiredRole: ["admin", "maintainer"],
  url: "/library/:libraryName/metafiles/:fileId",
  handler: async (req, res, bot: WrangleBot, server: SocketServer) => {
    const { libraryName, fileId } = req.params;
    const lib = await bot.query.library.one(libraryName).fetch();
    return new RouteResult(200, await lib.query.metafiles.one(fileId).delete());
  },
};
