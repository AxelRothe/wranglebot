var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import RouteResult from "../../RouteResult.js";
export default {
    method: "post",
    url: "/library/:library/transcode/:transcodeId/cancel",
    handler: (req, res, bot, server) => __awaiter(void 0, void 0, void 0, function* () {
        const { library, transcodeId } = req.params;
        let cancelTokens = server.getFromCache("cancelTokens");
        cancelTokens[transcodeId].cancel = true;
        return new RouteResult(200, {
            status: "success",
            message: `Stopped transcode job.`,
        });
    }),
};
//# sourceMappingURL=transcode-post-stop.js.map