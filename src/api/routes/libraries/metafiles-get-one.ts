import { WrangleBot } from "../../../WrangleBot";
import { SocketServer } from "../../SocketServer";
import express from "express";
import RouteResult from "../../RouteResult";

const bodyParser = require("body-parser");
const LogBot = require("logbotjs");

export default {
  method: "get",
  url: "/library/:id/metafiles/:file",
  handler: async (req, res, bot: WrangleBot, server: SocketServer) => {
    const metafileId = req.params.file;
    const libraryId = req.params.id;

    const metafile = bot.query.library.one(libraryId).metafiles.one(metafileId).fetch();
    if (metafile) {
      return new RouteResult(200, metafile.toJSON());
    } else {
      throw new Error("Metafile not found");
    }
  },
};
