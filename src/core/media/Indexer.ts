import { IndexItem } from "./IndexItem";
import { finder } from "../system";
import Index from "./Index";

/**
 * media
 */
class Indexer {
  private readonly isLazy: boolean;
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
  async index(sourcePath, toCount = ["video", "video-raw", "audio", "sidecar", "photo"], matchExpression: RegExp | null = null): Promise<Index> {
    return new Promise(async (resolve, reject) => {
      let counter: {
        video: number;
        "video-raw": number;
        audio: number;
        sidecar: number;
        photo: number;
      } = {
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

          //filter files that do not match the matchExpression
          if (matchExpression !== null) {
            files = files.filter((item) => matchExpression.test(item));
          }

          let totalTaskSize = 0;

          let ListOfPathsToReturn: any = [];

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
                  } else {
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
            duplicates,
          });
        } catch (e) {
          console.log(e);
          resolve({
            path: sourcePath,
            size: 0,
            items: [],
            counts: counter,
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
            "video-raw": 0,
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
            "video-raw": 0,
            audio: 0,
            sidecar: 0,
            photo: 0,
          },
        });
      }
    });
  }
}
const indexer = new Indexer();

export { indexer };
