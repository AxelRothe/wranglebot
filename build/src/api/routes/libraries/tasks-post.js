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
    url: "/library/:libraryId/tasks",
    handler: (req, res, bot, server) => __awaiter(void 0, void 0, void 0, function* () {
        const { libraryId } = req.params;
        const { label, jobs } = req.body;
        if (!label) {
            throw new Error("Label is required");
        }
        for (const job of jobs) {
            if (!job.source)
                throw new Error("Job source is not defined");
            if (!job.destinations || !(job.destinations instanceof Array))
                throw new Error("Job destinations is not defined. if you are using a single destination, please use an array");
        }
        const lib = yield bot.query.library.one(libraryId).fetch();
        const task = yield lib.query.tasks.post({
            label,
            jobs,
        });
        return new RouteResult_1.default(200, {
            status: "200",
            id: task.id,
        });
    }),
};
//# sourceMappingURL=tasks-post.js.map