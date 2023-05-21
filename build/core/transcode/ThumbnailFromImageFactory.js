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
const system_1 = require("../system");
const jimp_compact_1 = __importDefault(require("jimp-compact"));
const uuid_1 = require("uuid");
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
    generate(type = "jpg") {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const thumbId = (0, uuid_1.v4)();
                const thumbnailFolder = system_1.finder.join(system_1.config.getPathToUserData(), "thumbnails");
                //create thumbnail dir if it does not exist
                system_1.finder.mkdirSync(thumbnailFolder, { recursive: true });
                const outputPath = system_1.finder.join(thumbnailFolder, thumbId + ".jpg");
                const image = yield jimp_compact_1.default.read(this.pathToFile);
                yield image.contain(640, 360);
                yield image.quality(70);
                yield image.write(outputPath);
                const imageData = yield image.getBase64Async(jimp_compact_1.default.AUTO);
                //strip base64 header
                const data = String(imageData.split(",")[1]);
                return [
                    {
                        id: thumbId,
                        frame: 1,
                        data: data,
                    },
                ];
            }
            catch (e) {
                console.log(e);
            }
        });
    }
}
exports.default = ThumbnailFromImageFactory;
//# sourceMappingURL=ThumbnailFromImageFactory.js.map