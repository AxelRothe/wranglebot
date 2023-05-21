import express from "express";
import LogBot from "logbotjs";
import { WrangleBot } from "../../../core/WrangleBot.js";
import { SocketServer } from "../../SocketServer.js";
import RouteResult from "../../RouteResult.js";

export default {
  method: "post",
  requiredRole: ["admin", "maintainer", "contributor"],
  url: "/library/:libraryId/scan",
  handler: async (req, res, bot: WrangleBot, server: SocketServer) => {
    const libraryId = req.params.libraryId;

    const result = await bot.query.library.one(libraryId).scan();
    if (result) {
      return new RouteResult(200, result.toJSON());
    } else {
      return new RouteResult(404, {
        status: "unchanged",
        message: `No new files found in library ${libraryId}`,
      });
    }
  },
};
