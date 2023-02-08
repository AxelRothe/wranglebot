import Transaction from "../../../database/Transaction";
import { WrangleBot } from "../../../WrangleBot";
import { SocketServer } from "../../SocketServer";
import RouteResult from "../../RouteResult";

export default {
  method: "get",
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
