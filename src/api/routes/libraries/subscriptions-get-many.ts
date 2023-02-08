import { WrangleBot } from "../../../WrangleBot";
import { SocketServer } from "../../SocketServer";
import RouteResult from "../../RouteResult";

export default {
  method: "get",
  url: "/users/subscriptions/",
  handler: async (req, res, bot: WrangleBot, server: SocketServer) => {
    const user = server.getUser(req, res);

    const subscriptions = server.getSubscriptions(user);
    return new RouteResult(200, subscriptions);
  },
};
