import LogBot from "logbotjs";
import type { WrangleBot } from "../../../core/WrangleBot.js";
import { SocketServer } from "../../SocketServer";
import RouteResult from "../../RouteResult";

/**
 * @description Retrieves the balance that is associated with the authenticated user
 */
export default {
  method: "get",
  url: "/users/me/balance",
  handler: async (req, res, bot: WrangleBot, server: SocketServer) => {
    if (!bot.ML) {
      return new RouteResult(404, "Machine Learning module not loaded");
    }

    return new RouteResult(200, {
      balance: await bot.ML.getBalance(),
    });
  },
};
