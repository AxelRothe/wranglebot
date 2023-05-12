import LogBot from "logbotjs";
import type { WrangleBot } from "../../../core/WrangleBot.js";
import { SocketServer } from "../../SocketServer";
import RouteResult from "../../RouteResult";

/**
 * @description Get the authenticated users information
 */
export default {
  method: "get",
  url: "/users/me",
  handler: async (req, res, bot: WrangleBot, server: SocketServer) => {
    const user = req.$user;

    return new RouteResult(200, user.toJSON());
  },
};
