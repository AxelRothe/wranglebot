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
    method: "post",
    requiredRole: ["admin", "maintainer", "contributor"],
    url: "/library/:id/tasks/generate",
    handler: (req, res, bot, server) => __awaiter(void 0, void 0, void 0, function* () {
        const libraryId = req.params.id;
        const lib = bot.query.library.one(libraryId).fetch();
        let { label, types, source, destinations, settings } = req.body;
        const task = yield lib.query.tasks.generate({
            label,
            types,
            source,
            destinations,
            settings,
        });
        if (task) {
            return new RouteResult(200, task.toJSON());
        }
        else {
            return new RouteResult(400, {
                status: "error",
                message: `No task generated`,
            });
        }
    }),
};
//# sourceMappingURL=tasks-post-generate.js.map