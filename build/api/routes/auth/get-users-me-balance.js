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
/**
 * @description Retrieves the balance that is associated with the authenticated user
 */
exports.default = {
    method: "get",
    url: "/users/me/balance",
    handler: (req, res, bot, server) => __awaiter(void 0, void 0, void 0, function* () {
        if (!bot.ML) {
            return new RouteResult_1.default(404, "Machine Learning module not loaded");
        }
        return new RouteResult_1.default(200, {
            balance: yield bot.ML.getBalance(),
        });
    }),
};
//# sourceMappingURL=get-users-me-balance.js.map