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
    method: "delete",
    requiredRole: ["admin", "maintainer"],
    url: "/library/:id/tasks/:taskid",
    handler: (req, res, bot, server) => __awaiter(void 0, void 0, void 0, function* () {
        const libraryId = req.params.id;
        const taskId = req.params.taskid;
        const lib = yield bot.query.library.one(libraryId).fetch();
        const result = yield lib.query.tasks.one(taskId).delete();
        return new RouteResult(200, {
            success: true,
            message: `Task ${taskId} removed from library ${libraryId}`,
        });
    }),
};
//# sourceMappingURL=tasks-delete.js.map