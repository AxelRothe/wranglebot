import ThumbnailFactoryOptions from "./ThumbnailFactoryOptions";
import { config, finder } from "../system";
import { v4 as uuidv4 } from "uuid";
import ffmpeg, { FfmpegCommand } from "fluent-ffmpeg";

export default class ThumbnailFactory {
  private pathToFile: string;
  private options: ThumbnailFactoryOptions;
  private command: FfmpegCommand;
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
        .outputOptions("-q:v", "3", "-pix_fmt", "yuv420p", "-vf", `fps=${fps},scale=512:-1.77`)
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
        let newGeneratedThumbnails: { id: string; frame: string; data: any }[] = [];

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
