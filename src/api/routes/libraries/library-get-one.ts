import { WrangleBot } from "../../../core/WrangleBot.js";
import { SocketServer } from "../../SocketServer.js";
import express from "express";
import RouteResult from "../../RouteResult.js";
import LogBot from "logbotjs";

export default {
  method: "get",
  url: "/library/:id",
  handler: async (req, res, bot: WrangleBot, server: SocketServer) => {
    const libraryId = req.params.id;
    const library = bot.query.library.one(libraryId).fetch();

    if (library) {
      return new RouteResult(200, library.toJSON());
    } else {
      throw new Error("Library not found");
    }
  },
};
