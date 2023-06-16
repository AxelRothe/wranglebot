import { WrangleBot } from "../../../core/WrangleBot.js";
import { SocketServer } from "../../SocketServer.js";
import RouteResult from "../../RouteResult.js";
export default {
  method: "post",
  requiredRole: ["admin", "maintainer", "contributor"],
  url: "/library/:id/tasks/:taskid/stop",
  handler: async (req, res, bot: WrangleBot, server: SocketServer) => {
    const libraryId = req.params.id;
    const taskId = req.params.taskid;
    const lib = bot.query.library.one(libraryId).fetch();

    const task = lib.query.tasks.one(taskId).fetch();
    let cancelTokens = server.getFromCache("cancelTokens");

    if (cancelTokens && cancelTokens[task.id]) {
      cancelTokens[task.id].abort();

      server.inform("task", task.id, {
        jobs: task.jobs.map((j) => j.toJSON()),
      });

      return new RouteResult(200, {
        status: "success",
        message: "task stopped",
      });
    } else {
      return new RouteResult(404, {
        status: "error",
        message: "task not running",
      });
    }
  },
};
