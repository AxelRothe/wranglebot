import MLInterfaceOptions from "./MLInterfaceOptions";
import analyseOneMetaFileOptions from "./analyseOneMetaFileOptions";
import axios from "axios";

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

    for (let thumbnail of thumbnails) {
      const result = await axios.post(
        this.url + "/api/prompt/aleph-alpha",
        {
          model: "luminous-base",
          prompt: [
            {
              type: "image",
              data: thumbnail.data,
            },
            {
              type: "text",
              data: options.prompt,
            },
          ],
          max_tokens: 100,
          stop_sequences: ["\n", "."],
        },
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        }
      );
      responses.push(result.data.response.trim());
      cost += result.data.usage.cost;
    }
    return {
      response: responses.join(","),
      cost: cost,
    };
  }
}

let MLInterfaceInstance: MLInterfaceSingleton;

const MLInterface = function (options: MLInterfaceOptions | undefined = undefined) {
  if (!MLInterfaceInstance && options) {
    MLInterfaceInstance = new MLInterfaceSingleton(options);
    return MLInterfaceInstance;
  } else if (MLInterfaceInstance) {
    return MLInterfaceInstance;
  }
  throw new Error("No options provided");
};
export { MLInterface };
