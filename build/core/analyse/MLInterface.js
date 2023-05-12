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
const logbotjs_1 = __importDefault(require("logbotjs"));
class MLInterfaceSingleton {
    constructor(options) {
        this.token = options.token;
        this.url = options.url;
    }
    checkAuth() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield axios_1.default.get(`${this.url}/api/auth`, {
                    headers: {
                        Authorization: `Bearer ${this.token}`,
                    },
                });
                return response.data;
            }
            catch (e) {
                return false;
            }
        });
    }
    getBalance() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield axios_1.default.get(`${this.url}/api/balance`, {
                    headers: {
                        Authorization: `Bearer ${this.token}`,
                    },
                });
                return response.data.balance;
            }
            catch (e) {
                logbotjs_1.default.log(400, "Error getting balance");
                return -1;
            }
        });
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
            const renderedFrames = [];
            for (let thumbnail of thumbnails) {
                const image = jimp_compact_1.default.read(Buffer.from(thumbnail.data, "base64"));
                const waitForResizedImage = () => {
                    return new Promise((resolve) => {
                        image.then((image) => {
                            image
                                .background(0x000000)
                                .resize(512, 512)
                                .getBase64(jimp_compact_1.default.MIME_JPEG, (err, data) => {
                                resolve(data);
                            });
                        });
                    });
                };
                const resizedImage = yield waitForResizedImage();
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
                        const result = yield axios_1.default.post(this.url + "/api/prompt/aleph-alpha", requestData, {
                            headers: {
                                Authorization: `Bearer ${this.token}`,
                            },
                        });
                        responses.push(result.data.response.trim());
                        cost += result.data.usage.cost;
                    }
                    catch (e) {
                        throw new Error(e.response.data.message || e.message);
                    }
                }
            }
            else if (options.engine === "deepva") {
                const requestData = {
                    frames: renderedFrames,
                };
                try {
                    const result = yield axios_1.default.post(this.url + "/api/prompt/deepva", requestData, {
                        headers: {
                            Authorization: `Bearer ${this.token}`,
                        },
                    });
                    responses.push(...result.data.response);
                    cost += result.data.usage.cost;
                }
                catch (e) {
                    throw new Error(e.response.data.message || e.message);
                }
            }
            else {
                throw new Error("Engine not supported");
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