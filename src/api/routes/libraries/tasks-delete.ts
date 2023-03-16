import { WrangleBot } from "../../../WrangleBot";
import { SocketServer } from "../../SocketServer";
import RouteResult from "../../RouteResult";

export default {
  method: "delete",
  requiredRole: ["admin"],
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
