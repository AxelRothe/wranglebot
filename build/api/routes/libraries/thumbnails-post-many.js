var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import LogBot from "logbotjs";
import RouteResult from "../../RouteResult.js";
export default {
    method: "post",
    url: "/library/:id/metafiles/thumbnails/",
    handler: (req, res, bot, server) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        const { files } = req.body;
        let thumbnailGenerationQueue = server.getFromCache("thumbnailGenerationQueue");
        if (!thumbnailGenerationQueue) {
            thumbnailGenerationQueue = server.addToCache("thumbnailGenerationQueue", {});
        }
        const progressCallback = (data) => {
            server.inform("thumbnails", data.metaFile.id, data);
        };
        const jobFinishCallback = (metaFileId) => {
            server.inform("thumbnails", metaFileId, { status: "done" });
            thumbnailGenerationQueue[metaFileId] = false;
        };
        const failedCallback = (metaFileId, error) => {
            server.inform("thumbnails", metaFileId, { error: error.message });
            thumbnailGenerationQueue[metaFileId] = false;
        };
        let fileIds = files.filter((file) => !thumbnailGenerationQueue[file]);
        let filesToGenerate = bot.query.library.one(id).metafiles.many({ $ids: fileIds }).fetch();
        filesToGenerate = filesToGenerate.filter((f) => f.thumbnails.length === 0);
        files.forEach((file) => {
            thumbnailGenerationQueue[file] = true;
        });
        bot.generateThumbnails(id, filesToGenerate, progressCallback, jobFinishCallback).catch((e) => {
            LogBot.log(500, e.message);
            filesToGenerate.forEach((f) => {
                failedCallback(f.id, e);
            });
        });
        return new RouteResult(200, { success: true, message: "generating thumbnails for " + filesToGenerate.length + " files." });
    }),
};
//# sourceMappingURL=thumbnails-post-many.js.map