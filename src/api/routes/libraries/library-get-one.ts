import { WrangleBot } from "../../../WrangleBot";
import { SocketServer } from "../../SocketServer";
import express from "express";
const LogBot = require("logbotjs");
import RouteResult from "../../RouteResult";

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
