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
const logbotjs_1 = __importDefault(require("logbotjs"));
const RouteResult_1 = __importDefault(require("../../RouteResult"));
exports.default = {
    method: "put",
    requiredParams: ["username"],
    url: "/users/:username",
    handler: (req, res, wrangleBot, socketServer) => __awaiter(void 0, void 0, void 0, function* () {
        const { username } = req.params;
        if (!socketServer.isUser(req, res, username) && !socketServer.checkRequestAuthorization(req, res, ["admin", "maintainer"]))
            return;
        const user = yield wrangleBot.query.users.one({ id: username }).fetch();
        if (!user) {
            res.status(404).send({ error: logbotjs_1.default.resolveErrorCode(404) });
            return;
        }
        if (req.body.password)
            yield wrangleBot.accountManager.changePassword(user, req.body.password);
        if (req.body.firstName) {
            yield wrangleBot.accountManager.changeFirstName(user, req.body.firstName);
        }
        if (req.body.lastName) {
            yield wrangleBot.accountManager.changeLastName(user, req.body.lastName);
        }
        if (req.body.email) {
            yield wrangleBot.accountManager.changeEmail(user, req.body.email);
        }
        if (req.body.roles) {
            wrangleBot.accountManager.setRoles(user, req.body.roles);
        }
        return new RouteResult_1.default(200, user.toJSON({ security: true }));
    }),
};
//# sourceMappingURL=put-users.js.map