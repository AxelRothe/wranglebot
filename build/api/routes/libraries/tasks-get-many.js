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
    url: "/library/:id/tasks/",
    handler: (req, res, bot, server) => __awaiter(void 0, void 0, void 0, function* () {
        const libraryId = req.params.id;
        const lib = bot.query.library.one(libraryId).fetch();
        if (!lib) {
            throw new Error(`Library ${libraryId} not found.`);
        }
        const tasks = lib.query.tasks.many().fetch();
        return new RouteResult(200, tasks.map((task) => task.toJSON()));
    }),
};
//# sourceMappingURL=tasks-get-many.js.map