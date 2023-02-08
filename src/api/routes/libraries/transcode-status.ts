import { WrangleBot } from "../../../WrangleBot";
import { SocketServer } from "../../SocketServer";
import TranscodeTemplates from "../../../transcode/TranscodeTemplates";
import RouteResult from "../../RouteResult";

export default {
  method: "get",
  url: "/status/transcode",
  handler: async (req, res, bot: WrangleBot, server: SocketServer) => {
    const availableTranscodeTemplates = TranscodeTemplates.getAvailableTemplates();
    return new RouteResult(200, availableTranscodeTemplates);
  },
};
