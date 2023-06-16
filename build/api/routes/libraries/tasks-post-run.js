var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import RouteResult from "../../RouteResult.js";
import CancelToken from "../../../core/media/CancelToken.js";
export default {
    method: "post",
    requiredRole: ["admin", "maintainer", "contributor"],
    url: "/library/:id/tasks/:taskid/run",
    handler: (req, res, bot, server) => __awaiter(void 0, void 0, void 0, function* () {
        const libraryId = req.params.id;
        const taskId = req.params.taskid;
        const lib = bot.query.library.one(libraryId).fetch();
        const task = lib.query.tasks.one(taskId).fetch();
        const cb = (data) => {
            server.inform("task", task.id, Object.assign({ status: "running", jobs: task.jobs.map((j) => j.toJSON()) }, data));
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
    }),
};
//# sourceMappingURL=tasks-post-run.js.map