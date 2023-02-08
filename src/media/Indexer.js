const { finder } = require("../system");
const { IndexItem } = require("./IndexItem");

/**
 * @typedef {{  path: string,
 *              size: number,
 *              counts : {
 *                          video: number,
 *                          audio: number,
 *                          sidecar: number},
 *              items:IndexItem[]
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
   * @return {Promise<Index>}
   */
  async index(sourcePath, toCount = ["video", "video-raw", "audio", "sidecar", "photo"]) {
    return new Promise(async (resolve, reject) => {
      let counter = {};
      for (let type of toCount) {
        counter[type] = 0;
      }

      if (finder.isDirectory(sourcePath)) {
        try {
          let files = finder.readdirSync(sourcePath);

          if (this.isLazy) {
            files = files.filter((item) => !/(^|\/)\.[^\/\.]/g.test(item));
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

                  totalTaskSize += indexItem.size;

                  for (let type of toCount) {
                    if (indexItem.is(type)) {
                      counter[type]++;
                      //console.log(pathToFile + " > " + wbType + ": " + counter[wbType]);
                    }
                  }
                }
              } else {
                let lowerPathIndexes = await this.index(pathToFile, toCount);
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
          });
        } catch (e) {
          console.log(e);
          resolve({
            path: sourcePath,
            size: 0,
            items: [],
          });
        }
      } else if (finder.existsSync(sourcePath)) {
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
      } else {
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
    });
  }
}
module.exports.Indexer = new Indexer();
