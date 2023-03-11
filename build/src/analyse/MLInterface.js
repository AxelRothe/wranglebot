"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MLInterface = void 0;
const axios_1 = __importDefault(require("axios"));
const jimp_compact_1 = __importDefault(require("jimp-compact"));
class MLInterfaceSingleton {
    constructor(options) {
        this.token = options.token;
        this.url = options.url;
    }
    analyseFrames(options) {
        return __awaiter(this, void 0, void 0, function* () {
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
            const responses = [];
            let cost = 0;
            console.log("Sending " + thumbnails.length + " requests to " + this.url
                + " with prompt " + options.prompt
                + " and token " + this.token
                + " and model luminous-extended");
            console.log("Thumbnails: " + thumbnails.map(t => t.id).join(","));
            for (let thumbnail of thumbnails) {
                const image = jimp_compact_1.default.read(Buffer.from(thumbnail.data, "base64"));
                const waitForResizedImage = () => {
                    return new Promise((resolve) => {
                        image.then((image) => {
                            image.background(0x000000).resize(512, 512).getBase64(jimp_compact_1.default.MIME_JPEG, (err, data) => {
                                resolve(data);
                            });
                        });
                    });
                };
                const resizedImage = yield waitForResizedImage();
                //remove data:image/jpeg;base64,
                const resizedImageWithoutHeader = resizedImage.substring(resizedImage.indexOf(",") + 1);
                const result = yield axios_1.default.post(this.url + "/api/prompt/aleph-alpha", {
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
                }, {
                    headers: {
                        Authorization: `Bearer ${this.token}`,
                    },
                });
                responses.push(result.data.response.trim());
                cost += result.data.usage.cost;
            }
            return {
                response: responses.join(","),
                cost: cost,
            };
        });
    }
}
let MLInterfaceInstance;
const MLInterface = function (options = undefined) {
    if (MLInterfaceInstance) {
        return MLInterfaceInstance;
    }
    if (!MLInterfaceInstance && options) {
        MLInterfaceInstance = new MLInterfaceSingleton(options);
        return MLInterfaceInstance;
    }
    throw new Error("Can not create MLInterface. No options provided");
};
exports.MLInterface = MLInterface;
//# sourceMappingURL=MLInterface.js.map