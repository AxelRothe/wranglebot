var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { config, finder } from "../system/index.js";
import Jimp from "jimp-compact";
import { v4 as uuidv4 } from "uuid";
export default class ThumbnailFromImageFactory {
    constructor(pathToFile, options) {
        this.pathToFile = pathToFile;
        this.options = options;
    }
    generate() {
        return __awaiter(this, arguments, void 0, function* (type = "jpg") {
            try {
                const thumbId = uuidv4();
                const thumbnailFolder = finder.join(config.getPathToUserData(), "thumbnails");
                finder.mkdirSync(thumbnailFolder, { recursive: true });
                const outputPath = finder.join(thumbnailFolder, thumbId + ".jpg");
                const image = yield Jimp.read(this.pathToFile);
                yield image.contain(640, 360);
                yield image.quality(70);
                yield image.write(outputPath);
                const imageData = yield image.getBase64Async(Jimp.AUTO);
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
//# sourceMappingURL=ThumbnailFromImageFactory.js.map