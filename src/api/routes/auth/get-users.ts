import LogBot from "logbotjs";
import type { WrangleBot } from "../../../core/WrangleBot.js";
import { SocketServer } from "../../SocketServer";
import RouteResult from "../../RouteResult";

/**
 * @description Retrieves all users in the database
 */
export default {
  method: "get",
  url: "/users",
  handler: async (req, res, bot: WrangleBot, socketServer: SocketServer) => {
    if (req.$user.hasRole(["admin", "maintainer"])) {
      const users = bot.query.users.many().fetch();
      const map = users.map((user) => {
        return user.toJSON();
      });
      return new RouteResult(200, map);
    }

    if (req.$user.hasRole(["contributor", "curator"])) {
      return new RouteResult(200, [req.$user.toJSON()]);
    }

    return new RouteResult(404, LogBot.resolveErrorCode(403));
  },
};
