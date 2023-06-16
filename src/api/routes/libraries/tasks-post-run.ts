import { WrangleBot } from "../../../core/WrangleBot.js";
import { SocketServer } from "../../SocketServer.js";
import RouteResult from "../../RouteResult.js";
import CancelToken from "../../../core/media/CancelToken.js";

export default {
  method: "post",
  requiredRole: ["admin", "maintainer", "contributor"],
  url: "/library/:id/tasks/:taskid/run",
  handler: async (req, res, bot: WrangleBot, server: SocketServer) => {
    const libraryId = req.params.id;
    const taskId = req.params.taskid;
    const lib = bot.query.library.one(libraryId).fetch();

    const task = lib.query.tasks.one(taskId).fetch();

    const cb = (data) => {
      server.inform("task", task.id, {
        status: "running",
        jobs: task.jobs.map((j) => j.toJSON()),
        ...data,
      });
    };

    const cancelToken = new CancelToken();

    let cancelTokens = server.getFromCache("cancelTokens");
    if (!cancelTokens) {
      cancelTokens = server.addToCache("cancelTokens", {});
    }

    cancelTokens[task.id] = cancelToken;

    lib.query.tasks
      .one(taskId)
      .run(cb, cancelToken)
      .then((result) => {
        server.inform("task", task.id, {
          status: "complete",
          jobs: task.jobs.map((j) => j.toJSON()),
        });
      })
      .catch((e) => {
        console.log(e);
        server.inform("task", task.id, {
          status: "error",
          jobs: task.jobs.map((j) => j.toJSON()),
        });
      });

    return new RouteResult(200, task.toJSON());
  },
};
