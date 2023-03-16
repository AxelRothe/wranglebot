import RouteResult from "../../RouteResult";
import { WrangleBot } from "../../../core/WrangleBot";
import { SocketServer } from "../../SocketServer";

export default {
  method: "post",
  url: "/library/",
  requiredRole: ["admin", "maintainer"],
  handler: async (req, res, bot: WrangleBot, server: SocketServer) => {
    const { name, folders, pathToLibrary, drops } = req.body;

    if (!name || !folders || !pathToLibrary) {
      throw new Error("Missing required parameters");
    }

    await bot.query.library.post.one({ name, pathToLibrary, folders, drops });

    return new RouteResult(200, { status: "success", message: `Library ${name} created` });
  },
};
