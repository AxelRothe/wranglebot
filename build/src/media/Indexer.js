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
const { finder } = require("../system");
const { IndexItem } = require("./IndexItem");
/**
 * @typedef {{  path: string,
 *              size: number,
 *              counts : {
 *                          video: number,
 *                          audio: number,
 *                          sidecar: number},
 *              items:IndexItem[],
 *              duplicates?: boolean,
 *              }} Index
 */
/**
 * media
 */
class Indexer {
    constructor(isLazy = true) {
        this.isLazy = isLazy;
    }
    /**
     * Indexes the folders recursively
     *
     * @param sourcePath {String} the folders to archive
     * @param toCount {String["video"|"video-raw"|"audio"|"sidecar"|"photo"]} the type of files to count
     * @param matchExpression {RegExp|null} the expression to match
     * @return {Promise<Index>}
     */
    index(sourcePath, toCount = ["video", "video-raw", "audio", "sidecar", "photo"], matchExpression = null) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let counter = {};
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
                        //filter files that do not match the matchExpression
                        if (matchExpression !== null && matchExpression instanceof RegExp) {
                            files = files.filter((item) => matchExpression.test(item));
                        }
                        let totalTaskSize = 0;
                        let ListOfPathsToReturn = [];
                        for (let file of files) {
                            //let pathToBucketLocation = this.bucketPath + "/" + file;
                            let pathToFile = sourcePath + "/" + file;
                            if (finder.existsSync(pathToFile)) {
                                let indexItem = new IndexItem(pathToFile);
                                if (!indexItem.isDirectory()) {
                                    //await indexItem.resolveHash();
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
                                                //console.log(pathToFile + " > " + wbType + ": " + counter[wbType]);
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
                        });
                    }
                }
                else if (finder.existsSync(sourcePath)) {
                    const item = new IndexItem(sourcePath);
                    //await item.resolveHash();
                    let returnObject = {
                        path: sourcePath,
                        items: [item],
                        size: item.size,
                        counts: {
                            video: 0,
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
module.exports.Indexer = new Indexer();
//# sourceMappingURL=Indexer.js.map