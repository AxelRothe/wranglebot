import LogBot from "logbotjs";
import { WrangleBot } from "../../../core/WrangleBot";
import { SocketServer } from "../../SocketServer";
import express from "express";
import TranscodeTemplates from "../../../core/transcode/TranscodeTemplates";
import RouteResult from "../../RouteResult";

export default {
  method: "post",
  requiredRole: ["admin", "maintainer", "contributor"],
  url: "/library/:libraryName/transcode/",
  handler: async (req, res, bot: WrangleBot, server: SocketServer) => {
    const { libraryName } = req.params;
    const transcode = req.body;

    const lib = await bot.query.library.one(libraryName).fetch();
    const metaFiles = lib.query.metafiles.many({ $ids: transcode.files });

    if (metaFiles.fetch().length === 0) {
      throw new Error("No files found with ids supplied");
    }

    if (
      !transcode.codec ||
      !transcode.frameRate ||
      !transcode.flavour ||
      !transcode.audioCodec ||
      !transcode.audioBitrate ||
      !transcode.audioChannels
    ) {
      throw new Error(
        "Missing parameters in transcode request. You must supply codec, frameRate, flavour, audioCodec, audioBitrate and audioChannels"
      );
    }

    const transcodeTemplate = TranscodeTemplates.get(
      transcode.codec,
      transcode.frameRate,
      transcode.flavour,
      transcode.container,
      transcode.audioCodec,
      transcode.audioBitrate,
      transcode.audioChannels
    );

    if (!transcodeTemplate) {
      throw new Error("No transcode template found");
    }

    const transcodeJob = await metaFiles.export.transcode.post({
      label: transcode.label,
      pathToExport: transcode.path,
      overwrite: transcode.overwrite,
      template: transcodeTemplate,
      lut: transcode.lut,
    });

    return new RouteResult(200, {
      status: "success",
      message: `Created transcode job ${transcodeJob.label}`,
      id: transcodeJob.id,
    });
  },
};
