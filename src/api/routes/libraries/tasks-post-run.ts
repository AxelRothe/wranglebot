import { WrangleBot } from "../../../core/WrangleBot";
import { SocketServer } from "../../SocketServer";
import RouteResult from "../../RouteResult";

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
        jobs: task.jobs.map((j) => j.toJSON()),
        ...data,
      });
    };

    const cancelToken = { cancel: false };

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
          jobs: task.jobs.map((j) => j.toJSON()),
        });
      })
      .catch((e) => {
        console.log(e);
        server.inform("task", task.id, {
          jobs: task.jobs.map((j) => j.toJSON()),
        });
      });

    return new RouteResult(200, task.toJSON());
  },
};
