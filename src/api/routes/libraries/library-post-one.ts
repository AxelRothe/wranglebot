import RouteResult from "../../RouteResult";
import { WrangleBot } from "../../../WrangleBot";
import { SocketServer } from "../../SocketServer";

export default {
  method: "post",
  url: "/library/",
  handler: async (req, res, bot: WrangleBot, server: SocketServer) => {
    const { name, folders, pathToLibrary } = req.body;

    if (!name || !folders || !pathToLibrary) {
      throw new Error("Missing required parameters");
    }

    await bot.query.library.post.one({ name, pathToLibrary, folders });

    return new RouteResult(200, { status: "success", message: `Library ${name} created` });
  },
};