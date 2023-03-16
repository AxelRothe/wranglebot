import express from "express";
import RouteResult from "../../RouteResult";

const LogBot = require("logbotjs");
import { WrangleBot } from "../../../core/WrangleBot";
import { SocketServer } from "../../SocketServer";

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
