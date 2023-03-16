"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RouteResult_1 = __importDefault(require("../../RouteResult"));
exports.default = {
    method: "post",
    requiredRole: ["admin", "maintainer", "contributor"],
    url: "/library/:id/tasks/:taskid/stop",
    handler: (req, res, bot, server) => __awaiter(void 0, void 0, void 0, function* () {
        const libraryId = req.params.id;
        const taskId = req.params.taskid;
        const lib = bot.query.library.one(libraryId).fetch();
        const task = lib.query.tasks.one(taskId).fetch();
        let cancelTokens = server.getFromCache("cancelTokens");
        if (cancelTokens && cancelTokens[task.id]) {
            cancelTokens[task.id].cancel = true;
            server.inform("task", task.id, {
                jobs: task.jobs.map((j) => j.toJSON()),
            });
            return new RouteResult_1.default(200, {
                status: "success",
                message: "task stopped",
            });
        }
        else {
            return new RouteResult_1.default(404, {
                status: "error",
                message: "task not running",
            });
        }
    }),
};
//# sourceMappingURL=tasks-post-stop.js.map