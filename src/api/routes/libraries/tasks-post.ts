import LogBot from "logbotjs";
import { WrangleBot } from "../../../core/WrangleBot.js";
import { SocketServer } from "../../SocketServer.js";
import RouteResult from "../../RouteResult.js";

export default {
  method: "post",
  requiredRole: ["admin", "maintainer", "contributor"],
  url: "/library/:libraryId/tasks",
  handler: async (req, res, bot: WrangleBot, server: SocketServer) => {
    const { libraryId } = req.params;
    const { label, jobs } = req.body;

    console.log("jobs", jobs);

    const lib = await bot.query.library.one(libraryId).fetch();

    const task = await lib.query.tasks.post({
      label,
      jobs,
    });

    return new RouteResult(200, {
      status: "200",
      id: task.id,
    });
  },
};
