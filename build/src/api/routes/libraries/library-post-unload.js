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
const LogBot = require("logbotjs");
const RouteResult_1 = __importDefault(require("../../RouteResult"));
exports.default = {
    method: "post",
    url: "/library/:id/unload",
    requiredRole: ["admin", "maintainer"],
    handler: (req, res, bot, server) => __awaiter(void 0, void 0, void 0, function* () {
        const libraryId = req.params.id;
        LogBot.log(200, `[API] POST /library/${libraryId}/unload by IP ${req.ip}`);
        const result = yield bot.query.library.unload(libraryId);
        if (result.status === 200) {
            return new RouteResult_1.default(200, {
                status: "success",
                message: `Library ${libraryId} unloaded`,
            });
        }
        else {
            return new RouteResult_1.default(result.status, {
                status: result.status,
                message: result.message,
            });
        }
    }),
};
//# sourceMappingURL=library-post-unload.js.map