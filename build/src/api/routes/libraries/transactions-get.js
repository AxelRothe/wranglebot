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
    method: "get",
    requiredRole: ["admin", "editor"],
    url: "/library/:libraryName/transactions",
    handler: (req, res, bot, server) => __awaiter(void 0, void 0, void 0, function* () {
        const { libraryName } = req.params;
        const transactions = yield bot.query.library.one(libraryName).transactions.many({}).fetch();
        const transactionCounts = {
            count: transactions.length,
            pending: transactions.filter((t) => t.isPending()).length,
            committed: transactions.filter((t) => t.isCommitted()).length,
            failed: transactions.filter((t) => t.isRejected()).length,
            rollback: transactions.filter((t) => t.isRollback()).length,
        };
        return new RouteResult_1.default(200, {
            success: true,
            message: `Transactions for ${libraryName} fetched`,
            transactions: transactionCounts,
        });
    }),
};
//# sourceMappingURL=transactions-get.js.map