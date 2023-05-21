import { WrangleBot } from "../../../core/WrangleBot.js";
import { SocketServer } from "../../SocketServer.js";
import TranscodeTemplates from "../../../core/transcode/TranscodeTemplates.js";
import RouteResult from "../../RouteResult.js";

export default {
  method: "get",
  url: "/status/transcode",
  handler: async (req, res, bot: WrangleBot, server: SocketServer) => {
    const availableTranscodeTemplates = TranscodeTemplates.getAvailableTemplates();
    return new RouteResult(200, availableTranscodeTemplates);
  },
};
