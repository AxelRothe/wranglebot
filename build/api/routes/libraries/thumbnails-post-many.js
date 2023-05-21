"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logbotjs_1 = __importDefault(require("logbotjs"));
const RouteResult_1 = __importDefault(require("../../RouteResult"));
exports.default = {
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
            //remove job from queue
            thumbnailGenerationQueue[metaFileId] = false;
        };
        const failedCallback = (metaFileId, error) => {
            server.inform("thumbnails", metaFileId, { error: error.message });
            //remove job from queue
            thumbnailGenerationQueue[metaFileId] = false;
        };
        //check if any of the files are already in the queue
        let fileIds = files.filter((file) => !thumbnailGenerationQueue[file]);
        let filesToGenerate = bot.query.library.one(id).metafiles.many({ $ids: fileIds }).fetch();
        filesToGenerate = filesToGenerate.filter((f) => f.thumbnails.length === 0);
        //add metafile ids to the queue
        files.forEach((file) => {
            thumbnailGenerationQueue[file] = true;
        });
        //dont wait for the job to finish
        bot.generateThumbnails(id, filesToGenerate, progressCallback, jobFinishCallback).catch((e) => {
            logbotjs_1.default.log(500, e.message);
            filesToGenerate.forEach((f) => {
                failedCallback(f.id, e);
            });
        });
        return new RouteResult_1.default(200, { success: true, message: "generating thumbnails for " + filesToGenerate.length + " files." });
    }),
};
//# sourceMappingURL=thumbnails-post-many.js.map