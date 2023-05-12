import MLInterfaceOptions from "./MLInterfaceOptions";
import analyseOneMetaFileOptions from "./analyseOneMetaFileOptions";
import axios from "axios";
import Jimp from "jimp-compact";
import LogBot from "logbotjs";

class MLInterfaceSingleton {
  private readonly token: string;
  private readonly url: string;
  constructor(options: MLInterfaceOptions) {
    this.token = options.token;
    this.url = options.url;
  }

  async checkAuth() {
    try {
      const response = await axios.get(`${this.url}/api/auth`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });

      return response.data;
    } catch (e) {
      return false;
    }
  }

  async getBalance() {
    try {
      const response = await axios.get(`${this.url}/api/balance`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });

      return response.data.balance;
    } catch (e) {
      LogBot.log(400, "Error getting balance");
      return -1;
    }
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
    const renderedFrames: string[] = [];

    for (let thumbnail of thumbnails) {
      const image = Jimp.read(Buffer.from(thumbnail.data, "base64"));

      const waitForResizedImage = (): Promise<String> => {
        return new Promise((resolve) => {
          image.then((image) => {
            image
              .background(0x000000)
              .resize(512, 512)
              .getBase64(Jimp.MIME_JPEG, (err, data) => {
                resolve(data);
              });
          });
        });
      };

      const resizedImage = await waitForResizedImage();
      //remove data:image/jpeg;base64,
      const resizedImageWithoutHeader = resizedImage.substring(resizedImage.indexOf(",") + 1);

      renderedFrames.push(resizedImageWithoutHeader);
    }

    if (options.engine === "aleph-alpha") {
      for (let imageData of renderedFrames) {
        const requestData = {
          model: "luminous-extended",
          prompt: [
            {
              type: "image",
              data: imageData,
            },
            {
              type: "text",
              data: options.prompt,
            },
          ],
          max_tokens: options.max_tokens || 64,
          stop_sequences: options.stop_sequences || ["\n"],
          temperature: options.temperature || 0.5,
        };

        try {
          const result = await axios.post(this.url + "/api/prompt/aleph-alpha", requestData, {
            headers: {
              Authorization: `Bearer ${this.token}`,
            },
          });
          responses.push(result.data.response.trim());
          cost += result.data.usage.cost;
        } catch (e: any) {
          throw new Error(e.response.data.message || e.message);
        }
      }
    } else if (options.engine === "deepva") {
      const requestData = {
        frames: renderedFrames,
      };

      try {
        const result = await axios.post(this.url + "/api/prompt/deepva", requestData, {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        });
        responses.push(...result.data.response);
        cost += result.data.usage.cost;
      } catch (e: any) {
        throw new Error(e.response.data.message || e.message);
      }
    } else {
      throw new Error("Engine not supported");
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
