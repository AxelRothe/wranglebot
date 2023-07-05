import { WrangleBot } from "../../../core/WrangleBot.js";
import { SocketServer } from "../../SocketServer.js";
import RouteResult from "../../RouteResult.js";

export default {
  method: "post",
  requiredRole: ["admin", "maintainer", "contributor"],
  url: "/library/:id/tasks/generate",
  handler: async (req, res, bot: WrangleBot, server: SocketServer) => {
    const libraryId = req.params.id;
    const lib = bot.query.library.one(libraryId).fetch();

    let { label, types, source, destinations, settings } = req.body;

    const task = await lib.query.tasks.generate({
      label,
      types,
      source,
      destinations: destinations ? destinations : [],
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
