import { WrangleBot } from "../../../core/WrangleBot.js";
import { SocketServer } from "../../SocketServer.js";
import RouteResult from "../../RouteResult.js";

export default {
  method: "get",
  requiredRole: ["admin", "maintainer", "contributor"],
  url: "/library/:libid/tasks/:taskid/metafiles",
  handler: async (req, res, bot: WrangleBot, server: SocketServer) => {
    const { libid, taskid } = req.params;
    const lib = await bot.query.library.one(libid).fetch();
    if (!lib) {
      throw new Error("Library not found");
    }
    const task = await lib.query.tasks.one(taskid).fetch();
    if (!task) {
      throw new Error("Task not found");
    }

    const files: any = [];
    task.metaFiles.forEach((file) => {
      files.push(file.toJSON());
    });

    return new RouteResult(200, files);
  },
};
