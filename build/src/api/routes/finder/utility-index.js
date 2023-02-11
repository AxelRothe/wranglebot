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
    url: "/utility/index",
    handler: (req, res, bot, server) => __awaiter(void 0, void 0, void 0, function* () {
        const { path, types } = req.body;
        if (bot.finder.existsSync(path)) {
            return new RouteResult_1.default(200, yield bot.utility.index(path, types));
        }
        else {
            throw new Error("Path not found or missing required permissions");
        }
    }),
};
//# sourceMappingURL=utility-index.js.map