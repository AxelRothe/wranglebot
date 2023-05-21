import { WrangleBot } from "../../../core/WrangleBot.js";
import { SocketServer } from "../../SocketServer.js";
import RouteResult from "../../RouteResult.js";

export default {
  method: "get",
  requiredRole: ["admin", "maintainer", "contributor"],
  url: "/library/:id/tasks/",
  handler: async (req, res, bot: WrangleBot, server: SocketServer) => {
    const libraryId = req.params.id;

    const lib = bot.query.library.one(libraryId).fetch();
    if (!lib) {
      throw new Error(`Library ${libraryId} not found.`);
    }

    const tasks = lib.query.tasks.many().fetch();
    return new RouteResult(
      200,
      tasks.map((task) => task.toJSON())
    );
  },
};
