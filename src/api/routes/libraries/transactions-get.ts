import Transaction from "../../../core/database/Transaction.js";
import { WrangleBot } from "../../../core/WrangleBot.js";
import { SocketServer } from "../../SocketServer.js";
import RouteResult from "../../RouteResult.js";

export default {
  method: "get",
  requiredRole: ["admin", "maintainer", "contributor"],
  url: "/library/:libraryName/transactions",
  handler: async (req, res, bot: WrangleBot, server: SocketServer) => {
    const { libraryName } = req.params;

    const transactions: Transaction[] = await bot.query.library.one(libraryName).transactions.many({}).fetch();

    const transactionCounts = {
      count: transactions.length,
      pending: transactions.filter((t) => t.isPending()).length,
      committed: transactions.filter((t) => t.isCommitted()).length,
      failed: transactions.filter((t) => t.isRejected()).length,
      rollback: transactions.filter((t) => t.isRollback()).length,
    };

    return new RouteResult(200, {
      success: true,
      message: `Transactions for ${libraryName} fetched`,
      transactions: transactionCounts,
    });
  },
};
