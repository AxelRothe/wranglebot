import MLInterfaceOptions from "./MLInterfaceOptions";
import analyseOneMetaFileOptions from "./analyseOneMetaFileOptions";
import axios from "axios";
import Jimp from "jimp-compact";

class MLInterfaceSingleton {
  private readonly token: string;
  private readonly url: string;
  constructor(options: MLInterfaceOptions) {
    this.token = options.token;
    this.url = options.url;
  }

  async analyseFrames(options: analyseOneMetaFileOptions) {
    const frames = options.frames;

    if (frames.length === 0) {
      throw new Error("No frames provided");
    }

    const metafile = options.metafile;

    if (!metafile) {
      throw new Error("No metafile provided");
    }

    if (metafile.thumbnails.length === 0) {
      throw new Error("Metafile has no thumbnails generated");
    }
    let thumbnails = frames.map((f) => {
      const t = metafile.getThumbnail(f, "id");
      if (!t) {
        throw new Error("Thumbnail not found");
      }
      return t;
    });

    const responses: string[] = [];
    let cost: number = 0;

    console.log("Sending " + thumbnails.length + " requests to " + this.url
    + " with prompt " + options.prompt
    + " and token " + this.token
    + " and model luminous-extended");

    console.log("Thumbnails: " + thumbnails.map(t => t.id).join(","));


    for (let thumbnail of thumbnails) {

      const image = Jimp.read(Buffer.from(thumbnail.data, "base64"));

      const waitForResizedImage = () : Promise<String> => {
        return new Promise((resolve) => {
          image.then((image) => {
            image.background(0x000000).resize(512, 512).getBase64(Jimp.MIME_JPEG, (err, data) => {
              resolve(data);
            });
          });
        });
      }

      const resizedImage = await waitForResizedImage();
      //remove data:image/jpeg;base64,
      const resizedImageWithoutHeader = resizedImage.substring(resizedImage.indexOf(",") + 1);

      try {
        const result = await axios.post(
          this.url + "/api/prompt/aleph-alpha",
          {
            model: "luminous-extended",
            prompt: [
              {
                type: "image",
                data: resizedImageWithoutHeader,
              },
              {
                type: "text",
                data: options.prompt,
              },
            ],
            max_tokens: options.max_tokens || 64,
            stop_sequences: ["\n"],
            temperature: options.temperature || 0.5,
          },
          {
            headers: {
              Authorization: `Bearer ${this.token}`,
            },
          }
        );
        responses.push(result.data.response.trim());
        cost += result.data.usage.cost;
      } catch (e: any) {
        throw new Error(e.response.data.message || e.message);
      }
    }
    return {
      response: responses.join(","),
      cost: cost,
    };
  }
}

let MLInterfaceInstance: MLInterfaceSingleton;

const MLInterface = function (options: MLInterfaceOptions | undefined = undefined) {
  if (MLInterfaceInstance) {
    return MLInterfaceInstance;
  }

  if (!MLInterfaceInstance && options) {
    MLInterfaceInstance = new MLInterfaceSingleton(options);
    return MLInterfaceInstance;
  }
  throw new Error("Can not create MLInterface. No options provided");
};
export { MLInterface };
