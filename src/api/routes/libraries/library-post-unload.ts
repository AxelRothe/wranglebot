import express from "express";
import { WrangleBot } from "../../../core/WrangleBot.js";
import { SocketServer } from "../../SocketServer.js";
import RouteResult from "../../RouteResult.js";

import LogBot from "logbotjs";

export default {
  method: "post",
  url: "/library/:id/unload",
  requiredRole: ["admin", "maintainer"],
  handler: async (req, res, bot: WrangleBot, server: SocketServer) => {
    const libraryId = req.params.id;

    LogBot.log(200, `[API] POST /library/${libraryId}/unload by IP ${req.ip}`);

    const result = await bot.query.library.unload(libraryId);

    if (result.status === 200) {
      return new RouteResult(200, {
        status: "success",
        message: `Library ${libraryId} unloaded`,
      });
    } else {
      return new RouteResult(result.status, {
        status: result.status,
        message: result.message,
      });
    }
  },
};
