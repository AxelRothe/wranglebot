import TranscodeFactoryOptions from "./TranscodeFactoryOptions";
import { config, finder } from "../system";
import ffmpeg, { FfmpegCommand } from "fluent-ffmpeg";

export default class TranscodeFactory {
  private command: FfmpegCommand;
  private output: string;
  constructor(inputPath, options: TranscodeFactoryOptions) {
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
        resolve(true);
      });

      this.command.run();
    });
  }
}
