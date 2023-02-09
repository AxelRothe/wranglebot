import { WrangleBot } from "../../../WrangleBot";
import { SocketServer } from "../../SocketServer";
import RouteResult from "../../RouteResult";

export default {
  method: "put",
  url: "/library/:id/metafiles/:file/metadata/:key",
  handler: async (req, res, bot: WrangleBot, server: SocketServer) => {
    const { id, file, key } = req.params;
    const { value } = req.body;

    const library = await bot.query.library.one(id).fetch();

    if (!library) {
      throw new Error(`Library ${id} not found`);
    }

    await library.updateMetaDataOfFile(file, key, value);

    return new RouteResult(200, {
      message: `Metadata ${key} updated`,
    });
  },
};