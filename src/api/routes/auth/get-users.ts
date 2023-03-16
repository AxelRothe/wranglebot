import LogBot from "logbotjs";
import type { WrangleBot } from "../../../WrangleBot.js";
import { SocketServer } from "../../SocketServer";
import RouteResult from "../../RouteResult";

export default {
  method: "get",
  url: "/users",
  requiredRole: ["admin", "maintainer"],
  handler: async (req, res, bot: WrangleBot, socketServer: SocketServer) => {
    LogBot.log(200, `GET /users/`);

    const users = bot.query.users.many().fetch();
    const map = users.map((user) => {
      return user.toJSON({
        security: true,
      });
    });
    return new RouteResult(200, map);
  },
};
