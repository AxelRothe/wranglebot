import RouteResult from "../../RouteResult.js";
import { WrangleBot } from "../../../core/WrangleBot.js";
import { SocketServer } from "../../SocketServer.js";

export default {
  method: "post",
  url: "/library/",
  requiredRole: ["admin"],
  handler: async (req, res, bot: WrangleBot, server: SocketServer) => {
    const { name, folders, pathToLibrary, drops } = req.body;

    if (!name || !folders || !pathToLibrary) {
      throw new Error("Missing required parameters");
    }

    await bot.query.library.post({ name, pathToLibrary, folders, drops });

    return new RouteResult(200, { status: "success", message: `Library ${name} created` });
  },
};
