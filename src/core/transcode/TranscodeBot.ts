import ffmpeg from "fluent-ffmpeg";
import { finder } from "../system/index.js";
import TranscodeFactory from "./TranscodeFactory.js";
import TranscodeSetFactory from "./TranscodeSetFactory.js";
import ThumbnailFromImageFactory from "./ThumbnailFromImageFactory.js";
import ThumbnailFactory from "./ThumbnailFactory.js";
import { path as ffmpegPath } from "@ffmpeg-installer/ffmpeg";
import { path as ffprobePath } from "@ffprobe-installer/ffprobe";

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

class TranscodeBot {
  constructor() {}

  /**
   *
   * @param inputPath
   * @param options
   * @returns {TranscodeFactory}
   */
  generateTranscode(inputPath, options) {
    try {
      return new TranscodeFactory(inputPath, options);
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  /**
   * Creates a Set of Transcode from a list of metafiles
   * @param {MetaFile[]} metaFiles
   * @param options
   */
  generateTranscodeSet(metaFiles, options) {
    const transcodeSet = metaFiles.map((metaFile) => {
      return this.generateTranscode(metaFile.getMetaCopy().pathToBucket.file, options);
    });
    return new TranscodeSetFactory(transcodeSet);
  }

  /**
   * Generates Thumbnails for a given video file
   *
   * @param inputPath
   * @param options
   * @returns {Promise<{id: string, label: string, data: string}[]>} the id of the generated thumbnail
   */
  async generateThumbnails(inputPath, options) {
    const type = finder.getFileType(inputPath);
    if (type === "photo") {
      const thumbnail = new ThumbnailFromImageFactory(inputPath, options);
      return await thumbnail.generate();
    } else if (type === "video") {
      const thumbs = new ThumbnailFactory(inputPath, options);
      return await thumbs.generate("jpg", options.callback);
    }
  }
}

export default new TranscodeBot();
