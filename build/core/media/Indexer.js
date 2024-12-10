var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { IndexItem } from "./IndexItem.js";
import { finder } from "../system/index.js";
class Indexer {
    constructor(isLazy = true) {
        this.isLazy = isLazy;
    }
    index(sourcePath_1) {
        return __awaiter(this, arguments, void 0, function* (sourcePath, toCount = ["video", "video-raw", "audio", "sidecar", "photo"], matchExpression = null) {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let counter = {
                    video: 0,
                    "video-raw": 0,
                    audio: 0,
                    sidecar: 0,
                    photo: 0,
                };
                let filenames = new Map();
                let duplicates = false;
                for (let type of toCount) {
                    counter[type] = 0;
                }
                sourcePath = sourcePath.replace(/\/$/, "");
                if (finder.isDirectory(sourcePath)) {
                    try {
                        let files = finder.readdirSync(sourcePath);
                        if (this.isLazy) {
                            files = files.filter((item) => !/(^|\/)\.[^\/\.]/g.test(item));
                        }
                        if (matchExpression !== null) {
                            files = files.filter((item) => matchExpression.test(item));
                        }
                        let totalTaskSize = 0;
                        let ListOfPathsToReturn = [];
                        for (let file of files) {
                            let pathToFile = sourcePath + "/" + file;
                            if (finder.existsSync(pathToFile)) {
                                let indexItem = new IndexItem(pathToFile);
                                if (!indexItem.isDirectory()) {
                                    let isTypeToCount = false;
                                    for (let type of toCount) {
                                        if (indexItem.is(type)) {
                                            isTypeToCount = true;
                                        }
                                    }
                                    if (isTypeToCount) {
                                        ListOfPathsToReturn.push(indexItem);
                                        if (filenames.has(indexItem.basename)) {
                                            duplicates = true;
                                        }
                                        else {
                                            filenames.set(indexItem.basename, indexItem);
                                        }
                                        totalTaskSize += indexItem.size;
                                        for (let type of toCount) {
                                            if (indexItem.is(type)) {
                                                counter[type]++;
                                            }
                                        }
                                    }
                                }
                                else {
                                    let lowerPathIndexes = yield this.index(pathToFile, toCount);
                                    ListOfPathsToReturn = [...ListOfPathsToReturn, ...lowerPathIndexes.items];
                                    for (let type of toCount) {
                                        counter[type] += lowerPathIndexes.counts[type];
                                    }
                                    totalTaskSize += lowerPathIndexes.size;
                                }
                            }
                        }
                        resolve({
                            path: sourcePath,
                            items: ListOfPathsToReturn,
                            size: totalTaskSize,
                            counts: counter,
                            duplicates,
                        });
                    }
                    catch (e) {
                        console.log(e);
                        resolve({
                            path: sourcePath,
                            size: 0,
                            items: [],
                            counts: counter,
                        });
                    }
                }
                else if (finder.existsSync(sourcePath)) {
                    const item = new IndexItem(sourcePath);
                    let returnObject = {
                        path: sourcePath,
                        items: [item],
                        size: item.size,
                        counts: {
                            video: 0,
                            "video-raw": 0,
                            audio: 0,
                            sidecar: 0,
                            photo: 0,
                        },
                    };
                    returnObject.counts[item.fileType] = 1;
                    resolve(returnObject);
                }
                else {
                    resolve({
                        path: sourcePath,
                        items: [],
                        size: 0,
                        counts: {
                            video: 0,
                            "video-raw": 0,
                            audio: 0,
                            sidecar: 0,
                            photo: 0,
                        },
                    });
                }
            }));
        });
    }
}
const indexer = new Indexer();
export { indexer };
//# sourceMappingURL=Indexer.js.map