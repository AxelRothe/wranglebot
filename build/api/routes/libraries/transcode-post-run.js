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
    url: "/library/:library/transcode/:transcodeId",
    handler: (req, res, bot, server) => __awaiter(void 0, void 0, void 0, function* () {
        const { library, transcodeId } = req.params;
        const lib = yield bot.query.library.one(library).fetch();
        const cb = (progress) => {
            server.inform("transcode", transcodeId, progress);
        };
        const cancelToken = { cancel: false };
        let cancelTokens = server.getFromCache("cancelTokens");
        if (!cancelTokens) {
            cancelTokens = server.addToCache("cancelTokens", {});
        }
        cancelTokens[transcodeId] = cancelToken;
        const transcodeJob = lib.query.transcodes.one(transcodeId).fetch();
        transcodeJob.query
            .run(cb, cancelToken)
            .then(() => {
            server.inform("transcode", transcodeId, { task: transcodeJob.toJSON() });
        })
            .catch((e) => {
            console.error(e);
            server.inform("transcode", transcodeId, { error: e.message });
        });
        return new RouteResult(200, {
            status: "success",
            message: `Started transcode job ${yield transcodeJob.label}. Subscribe to Channel: 'transcode' with ${transcodeId} for progress updates.`,
        });
    }),
};
//# sourceMappingURL=transcode-post-run.js.map