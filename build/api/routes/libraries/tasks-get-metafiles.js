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
export default {
    method: "get",
    requiredRole: ["admin", "maintainer", "contributor"],
    url: "/library/:libid/tasks/:taskid/metafiles",
    handler: (req, res, bot, server) => __awaiter(void 0, void 0, void 0, function* () {
        const { libid, taskid } = req.params;
        const lib = yield bot.query.library.one(libid).fetch();
        if (!lib) {
            throw new Error("Library not found");
        }
        const task = yield lib.query.tasks.one(taskid).fetch();
        if (!task) {
            throw new Error("Task not found");
        }
        const files = [];
        task.metaFiles.forEach((file) => {
            files.push(file.toJSON());
        });
        return new RouteResult(200, files);
    }),
};
//# sourceMappingURL=tasks-get-metafiles.js.map