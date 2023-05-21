import express from "express";
import RouteResult from "../../RouteResult.js";
import { WrangleBot } from "../../../core/WrangleBot.js";
import { SocketServer } from "../../SocketServer.js";

import LogBot from "logbotjs";

export default {
  method: "post",
  requiredRole: ["admin", "maintainer"],
  url: "/library/:id/load",
  handler: async (req, res, bot: WrangleBot, server: SocketServer) => {
    const libraryId = req.params.id;

    const result = await bot.query.library.load(libraryId);

    if (result.status === 200) {
      return new RouteResult(200, {
        status: "success",
        message: `Library ${libraryId} loaded`,
      });
    } else {
      throw new Error(result.message);
    }
  },
};
