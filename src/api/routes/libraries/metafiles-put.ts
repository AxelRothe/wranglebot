import { WrangleBot } from "../../../core/WrangleBot";
import { SocketServer } from "../../SocketServer";
import RouteResult from "../../RouteResult";

export default {
  method: "put",
  url: "/library/:id/metafiles/:file/metadata/:key",
  handler: async (req, res, bot: WrangleBot, server: SocketServer) => {
    const { id, file, key } = req.params;
    const { value } = req.body;

    bot.query.library.one(id).metafiles.one(file).metadata.put({
      key,
      value,
    });

    return new RouteResult(200, {
      message: `Metadata ${key} updated`,
    });
  },
};
