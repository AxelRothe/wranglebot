import { WrangleBot } from "../../../WrangleBot";
import { SocketServer } from "../../SocketServer";
import RouteResult from "../../RouteResult";

export default {
  method: "post",
  url: "/library/:id/tasks/generate",
  handler: async (req, res, bot: WrangleBot, server: SocketServer) => {
    const libraryId = req.params.id;
    const lib = bot.query.library.one(libraryId).fetch();

    let { label, types, source, destinations, settings } = req.body;

    //remove trailing slashes from source and destinations
    source = source.replace(/\/+$/, "");
    destinations = destinations.map((d) => d.replace(/\/+$/, ""));

    const task = await lib.query.tasks.post.generate({
      label,
      types,
      source,
      destinations,
      settings,
    });
    if (task) {
      return new RouteResult(200, task.toJSON());
    } else {
      return new RouteResult(400, {
        status: "error",
        message: `No task generated`,
      });
    }
  },
};
