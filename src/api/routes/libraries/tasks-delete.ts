import { WrangleBot } from "../../../core/WrangleBot.js";
import { SocketServer } from "../../SocketServer.js";
import RouteResult from "../../RouteResult.js";

export default {
  method: "delete",
  requiredRole: ["admin", "maintainer"],
  url: "/library/:id/tasks/:taskid",
  handler: async (req, res, bot: WrangleBot, server: SocketServer) => {
    const libraryId = req.params.id;
    const taskId = req.params.taskid;

    const lib = await bot.query.library.one(libraryId).fetch();
    const result = await lib.query.tasks.one(taskId).delete();
    return new RouteResult(200, {
      success: true,
      message: `Task ${taskId} removed from library ${libraryId}`,
    });
  },
};
