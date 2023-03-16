import LogBot from "logbotjs";
import { WrangleBot } from "../../../core/WrangleBot";
import { SocketServer } from "../../SocketServer";
import RouteResult from "../../RouteResult";

export default {
  method: "post",
  requiredRole: ["admin", "maintainer", "contributor"],
  url: "/library/:libraryId/tasks",
  handler: async (req, res, bot: WrangleBot, server: SocketServer) => {
    const { libraryId } = req.params;
    const { label, jobs } = req.body;

    if (!label) {
      throw new Error("Label is required");
    }

    for (const job of jobs) {
      if (!job.source) throw new Error("Job source is not defined");
      if (!job.destinations || !(job.destinations instanceof Array))
        throw new Error("Job destinations is not defined. if you are using a single destination, please use an array");
    }

    const lib = await bot.query.library.one(libraryId).fetch();

    const task = await lib.query.tasks.post.one({
      label,
      jobs,
    });

    return new RouteResult(200, {
      status: "200",
      id: task.id,
    });
  },
};
