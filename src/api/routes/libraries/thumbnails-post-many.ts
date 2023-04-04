import LogBot from "logbotjs";
import { WrangleBot } from "../../../core/WrangleBot";
import { SocketServer } from "../../SocketServer";
import RouteResult from "../../RouteResult";

export default {
  method: "post",
  url: "/library/:id/metafiles/thumbnails/",
  handler: async (req, res, bot: WrangleBot, server: SocketServer) => {
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
      LogBot.log(500, e.message);
      filesToGenerate.forEach((f) => {
        failedCallback(f.id, e);
      });
    });

    return new RouteResult(200, { success: true, message: "generating thumbnails for " + filesToGenerate.length + " files." });
  },
};
