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
/**
 * @description Retrieves the balance that is associated with the authenticated user
 */
export default {
    method: "get",
    url: "/users/me/balance",
    handler: (req, res, bot, server) => __awaiter(void 0, void 0, void 0, function* () {
        if (!bot.ML) {
            return new RouteResult(404, "Machine Learning module not loaded");
        }
        return new RouteResult(200, {
            balance: yield bot.ML.getBalance(),
        });
    }),
};
//# sourceMappingURL=get-users-me-balance.js.map