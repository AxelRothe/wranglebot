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
    requiredParams: ["path"],
    requiredRole: ["admin", "editor"],
    url: "/utility/list",
    handler: (req, res, bot, socketServer) => __awaiter(void 0, void 0, void 0, function* () {
        let { path, options } = req.body;
        const result = bot.utility.list(path, options);
        if (!result) {
            throw new Error("Error listing files");
        }
        return new RouteResult_1.default(200, result);
    }),
};
//# sourceMappingURL=folders-get.js.map