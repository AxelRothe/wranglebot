import express from "express";
import LogBot from "logbotjs";
import { WrangleBot } from "../../../core/WrangleBot";
import { SocketServer } from "../../SocketServer";
import RouteResult from "../../RouteResult";

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
