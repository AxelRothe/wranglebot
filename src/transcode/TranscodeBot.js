const pathToFfmpeg = require("ffmpeg-static");
const pathToFfprobe = require("ffprobe-static").path;
const ffmpeg = require("fluent-ffmpeg");

const { finder, config } = require("../system");
const { EventEmitter } = require("events");

const { v4: uuidv4 } = require("uuid");

const Jimp = require("jimp-compact");
const axios = require("axios");

ffmpeg.setFfmpegPath(pathToFfmpeg);
ffmpeg.setFfprobePath(pathToFfprobe);

class TranscodeFactory {
  command = null;
  constructor(inputPath, options, callback) {
    this.output = options.output;

    this.command = ffmpeg({
      logger: console,
    });
    //set path to input file
    this.command.input(inputPath);
    //settings
    this.command
      .inputOptions("-hwaccel auto")
      .videoCodec(options.videoCodec)
      .videoBitrate(options.videoBitrate)
      .size(options.width + "x" + options.height)
      .aspect("16:9")
      .autopad("black")
      .audioBitrate(options.audioBitrate)
      .audioChannels(options.audioChannels)
      .audioCodec(options.audioCodec)
      .outputOptions([`-pix_fmt ${options.pixelFormat || "yuv422p"}`])
      .fps(options.fps)
      .output(options.output);

    //LUTs
    if (options.lut) {
      if (finder.existsSync(options.lut) && !finder.isDirectory(options.lut)) {
        this.command.videoFilter("lut3d=" + options.lut);
      } else {
        const defaultPathToLuts = finder.join(config.getPathToUserData(), "LUTs", options.lut);
        if (finder.existsSync(defaultPathToLuts)) {
          options.lut = defaultPathToLuts;
          this.command.videoFilter("lut3d=" + options.lut);
        } else {
          options.lut = false;
        }
      }
    }
  }

  run(callback, cancelToken) {
    return new Promise((resolve, reject) => {
      if (!finder.existsSync(this.output)) {
        finder.mkdirSync(finder.dirname(this.output), { recursive: true });
      }
      this.command.on("error", (err, stdout, stderr) => {
        console.log(err, stdout, stderr);
      });
      this.command.on("codecData", (data) => {});
      this.command.on("progress", (progress) => {
        if (cancelToken.cancel) {
          this.command.kill();
          resolve(false);
        }
        callback(progress);
      });
      this.command.on("end", (err, stdout, stderr) => {
        resolve();
      });

      this.command.run();
    });
  }
}

class TranscodeSetFactory extends EventEmitter {
  constructor(transcodes) {
    super();
    this.transcodes = transcodes;
    this.transcodes.forEach((transcode) => {
      transcode.on("progress", (progress) => {
        this.emit("progress", progress);
      });
    });
  }

  runOne(transcode) {
    return new Promise((resolve, reject) => {
      transcode.on("error", (err) => {
        this.emit("error", err);
        reject(err);
      });
      transcode.on("end", (type) => {
        resolve(type);
      });
      transcode.run();
    });
  }

  run() {
    return new Promise((resolve, reject) => {
      let i = 0;
      const tick = () => {
        if (i >= this.transcodes.length) {
          resolve();
        } else {
          this.runOne(this.transcodes[i]).then(() => {
            i++;
            tick();
          });
        }
      };
      tick();
    });
  }
}

class ThumbnailFactory {
  constructor(pathToFile, options) {
    this.pathToFile = pathToFile;
    this.options = options;
  }

  generate(type = "jpg", callback) {
    return new Promise((resolve, reject) => {
      this.command = ffmpeg({
        logger: console,
      });
      this.command.input(this.pathToFile);

      const thumbId = uuidv4();
      const thumbnailFolder = finder.join(config.getPathToUserData(), "thumbnails", ".+" + thumbId);
      //create thumbnail dir if it does not exist
      finder.mkdirSync(thumbnailFolder, { recursive: true });

      const duration = Number(this.options.metaFile.getMetaData().get("video-duration"));
      let fps = 1;

      //if the duration is longer than 100 seconds, then we will create proportional number of thumbnails
      if (duration > 100) {
        fps = 1 / (duration / 100);
      }

      this.command
        .outputOptions("-q:v", "3", "-pix_fmt", "yuv420p", "-vf", `fps=${fps},scale=480:-1.77`)
        .output(finder.join(thumbnailFolder, thumbId + "-%03d." + type));

      this.command.on("error", (err, stdout, stderr) => {
        console.log(err, stdout, stderr);
        reject(err);
      });

      this.command.on("progress", (progress) => {
        callback(progress);
      });

      this.command.on("end", (err, stdout, stderr) => {
        console.log(err);

        const files = finder.getContentOfFolder(thumbnailFolder);
        let newGeneratedThumbnails = [];

        for (let file of files) {
          //unique id for each thumbnail
          const uniqueId = uuidv4();

          if (finder.renameAndMove(finder.join(thumbnailFolder, file), uniqueId, finder.join(thumbnailFolder, "../"))) {
            try {
              const imageFile = finder.readFileSync(`${finder.join(thumbnailFolder, "../", uniqueId + "." + type)}`);
              const data = Buffer.from(imageFile).toString("base64");

              newGeneratedThumbnails.push({
                id: uniqueId,
                frame: file.split("-")[1].split(".")[0],
                data,
              });
            } catch (error) {
              console.error(error);
              return "";
            }
          }
        }
        finder.rmSync(thumbnailFolder);
        resolve(newGeneratedThumbnails);
      });
      this.command.run();
    });
  }
}

class ThumbnailFromImageFactory {
  constructor(pathToFile, options) {
    this.pathToFile = pathToFile;
    this.options = options;
  }

  /**
   *
   * @param type
   * @returns {Promise<unknown>}
   */
  async generate(type = "jpg") {
    try {
      const thumbId = uuidv4();
      const thumbnailFolder = finder.join(config.getPathToUserData(), "thumbnails");
      //create thumbnail dir if it does not exist
      finder.mkdirSync(thumbnailFolder, { recursive: true });

      const outputPath = finder.join(thumbnailFolder, thumbId + ".jpg");
      const image = await Jimp.read(this.pathToFile);
      await image.contain(640, 360);
      await image.quality(70);
      await image.write(outputPath);

      const imageData = await image.getBase64Async(Jimp.AUTO);
      //strip base64 header
      const data = String(imageData.split(",")[1]);

      return [
        {
          id: thumbId,
          frame: 1,
          data: data,
        },
      ];
    } catch (e) {
      console.log(e);
    }
  }
}

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

module.exports = new TranscodeBot();
