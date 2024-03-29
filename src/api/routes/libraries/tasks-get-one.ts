import { WrangleBot } from "../../../core/WrangleBot.js";
import { SocketServer } from "../../SocketServer.js";
import RouteResult from "../../RouteResult.js";

export default {
  method: "get",
  requiredRole: ["admin", "maintainer", "contributor"],
  url: "/library/:id/tasks/:taskid",
  handler: async (req, res, bot: WrangleBot, server: SocketServer) => {
    const libraryId = req.params.id;
    const taskId = req.params.taskid;

    const lib = bot.query.library.one(libraryId).fetch();
    if (!lib) {
      throw new Error(`Library ${libraryId} not found.`);
    }

    const task = lib.query.tasks.one(taskId).fetch();
    return new RouteResult(200, task.toJSON());
  },
};
