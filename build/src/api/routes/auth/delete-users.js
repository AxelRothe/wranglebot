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
    method: "delete",
    url: "/users/:username",
    handler: (req, res, bot, socketServer) => __awaiter(void 0, void 0, void 0, function* () {
        const { username } = req.params;
        const user = bot.accountManager.getOneUser(username);
        if (!user) {
            res.status(404).send({
                error: logbotjs_1.default.resolveErrorCode(404),
            });
            return;
        }
        const r = bot.accountManager.removeOneUser(user);
        if (r) {
            logbotjs_1.default.log(200, `DELETE /users/${username}`);
            return new RouteResult_1.default(200, 'user deleted');
        }
        else {
            throw new Error("User could not be deleted");
        }
    })
};
//# sourceMappingURL=delete-users.js.map