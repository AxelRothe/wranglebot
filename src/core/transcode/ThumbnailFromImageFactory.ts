import { config, finder } from "../system/index.js";
import Jimp from "jimp-compact";
import { v4 as uuidv4 } from "uuid";

export default class ThumbnailFromImageFactory {
  private pathToFile: any;
  private options: any;
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
