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
/**
 * @description Retrieves all users in the database
 */
exports.default = {
    method: "get",
    url: "/users",
    handler: (req, res, bot, socketServer) => __awaiter(void 0, void 0, void 0, function* () {
        if (req.$user.hasRole(["admin", "maintainer"])) {
            const users = bot.query.users.many().fetch();
            const map = users.map((user) => {
                return user.toJSON();
            });
            return new RouteResult_1.default(200, map);
        }
        if (req.$user.hasRole("contributor", "curator")) {
            return new RouteResult_1.default(200, [req.$user.toJSON()]);
        }
        return new RouteResult_1.default(404, logbotjs_1.default.resolveErrorCode(403));
    }),
};
//# sourceMappingURL=get-users.js.map