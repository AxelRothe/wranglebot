var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import LogBot from "logbotjs";
import RouteResult from "../../RouteResult.js";
export default {
    method: "put",
    requiredParams: ["username"],
    url: "/users/:username",
    handler: (req, res, wrangleBot, socketServer) => __awaiter(void 0, void 0, void 0, function* () {
        const { username } = req.params;
        if (!req.$user.hasRole(["admin", "maintainer"]) && req.$user.username !== username) {
            res.status(403).send({ error: LogBot.resolveErrorCode(403) });
            return;
        }
        const user = yield wrangleBot.query.users.one({ id: username }).fetch();
        if (!user) {
            res.status(404).send({ error: LogBot.resolveErrorCode(404) });
            return;
        }
        if (req.body.password)
            yield wrangleBot.accountManager.changePassword(user, req.body.password);
        if (req.$user.hasRole(["admin", "maintainer"])) {
            user.query.put({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                roles: req.body.roles,
                libraries: req.body.libraries,
                config: req.body.config,
            });
        }
        else {
            user.query.put({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                config: req.body.config,
            });
        }
        return new RouteResult(200, user.toJSON({ security: true }));
    }),
};
//# sourceMappingURL=put-users.js.map