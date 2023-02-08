import { WrangleBot } from "../../../WrangleBot";
import { SocketServer } from "../../SocketServer";
import RouteResult from "../../RouteResult";

export default {
  method: "post",
  url: "/library/:id/drops/",
  handler: async (req, res, bot: WrangleBot, server: SocketServer) => {
    const libraryId = req.params.id;
    const pairs = req.body;

    const library = await bot.query.library.one(libraryId).fetch();

    for (let [key, value] of Object.entries(pairs)) {
      await library.updateMetaData(key, value);
    }

    return new RouteResult(200, {
      status: "success",
      message: `Updated drops for library ${library.name}`,
    });
  },
};
