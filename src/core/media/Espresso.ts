import StreamSpeed from "streamspeed";
import path from "path";
import { StringDecoder } from "string_decoder";
import MediaInfo from "mediainfo.js";
import { XXHash128, XXHash3, XXHash32, XXHash64 } from "xxhash-addon";
import fs from "fs";

export default class Espresso {
  static key = "12345678";
  static hashStyle = "xxhash64";

  hash;
  pathToFile: string = "";

  /**
   * Grab an Espresso Cup
   * @param hashStyle hash style to use, default is xxhash64
   * @param key key to use for the hash, default is 12345678
   * */
  constructor(hashStyle = Espresso.hashStyle, key = Espresso.key) {
    switch (hashStyle) {
      case "xxhash128":
        this.hash = new XXHash128(Buffer.from(Espresso.key));
        break;
      case "xxhash64":
        this.hash = new XXHash64(Buffer.from(Espresso.key));
        break;
      case "xxhash32":
        this.hash = new XXHash32(Buffer.from(Espresso.key));
        break;
      case "xxhash3":
        this.hash = new XXHash3(Buffer.from(Espresso.key));
        break;
      default:
        this.hash = new XXHash64(Buffer.from(Espresso.key));
    }
  }

  /**
   * Returns a MediaInfo Instance
   * @returns {Promise<MediaInfo>}
   */
  #createMediaInfoInstance() {
    return new Promise((resolve) => {
      MediaInfo({ chunkSize: Math.pow(1024, 2) * 10, coverData: false, format: "object" }, (mediaInfo) => {
        resolve(mediaInfo);
      });
    });
  }

  /**
   * Pour yourself a sweet cup of joe.
   * Set the path to the file you want to read
   *
   * @param pathToFile path to the file
   * @returns {Espresso} returns the current instance
   */
  pour(pathToFile) {
    this.pathToFile = pathToFile;
    return this;
  }

  /**
   * analyzes the file and returns the metadata and hash
   *
   * @param {{cancel:boolean}} cancelToken cancel token to cancel the operation during read
   * @param {Function} callback callback function to get the progress and speed
   * @returns {Promise<{metaData: Object, hash: string, bytesPerSecond: number, bytesRead: number, size: number}>}
   */
  analyse(cancelToken, callback): Promise<{ metaData: Object; hash: string; bytesPerSecond: number; bytesRead: number; size: number }> {
    return new Promise((resolve, reject) => {
      this.drink([], cancelToken, callback)
        .then((result) => {
          resolve(result);
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  /**
   * analyses the file and pipes the chunks to the target path and returns the metadata and hash at the end
   *
   * @param pathToTargets path to the target file location, if the does not exist it will be created
   * @param cancelToken cancel token to cancel the operation during read
   * @param callback callback function to get the progress and speed
   * @returns {Promise<{metaData: Object, hash: string, bytesPerSecond: number, bytesRead: number, size: number}>}
   */
  drink(
    pathToTargets: string[] = [],
    cancelToken,
    callback
  ): Promise<{ metaData: Object; hash: string; bytesPerSecond: number; bytesRead: number; size: number }> {
    return new Promise((resolve, reject) => {
      //set options for HighWaterMarks and chunk size for MediaInfo
      const options = { highWaterMark: Math.pow(1024, 2) * 10 };
      //init streamSpeed Instance with a second interval
      const streamSpeed = new StreamSpeed({ timeUnit: 1 });

      let speedInBytes = 0; //current speed in bytes per second
      let totalBytesRead = 0; //total bytes read so far

      this.#createMediaInfoInstance().then((mediaInfo: any) => {
        //get size of file
        const readStream = fs.createReadStream(this.pathToFile, options);
        let writeStreams: any = [];

        if (pathToTargets.length > 0) {
          for (let i = 0; i < pathToTargets.length; i++) {
            writeStreams.push(fs.createWriteStream(pathToTargets[i], options));
          }
        }

        //get size of file
        const stats = fs.statSync(this.pathToFile);
        const fileSizeInBytes = stats.size;
        let startTime = 0;
        let lastTime = 0;
        let tick = 0;

        //start parsing the file with mediainfo
        mediaInfo.openBufferInit(fileSizeInBytes, 0);

        //start streamspeed
        streamSpeed.add(readStream);

        //listen to streamspeed
        streamSpeed.on("speed", (speed) => {
          speedInBytes = speed * 1024;
        });

        //error handle
        readStream.on("error", (err) => {
          reject(new Error("Failed"));
        });

        readStream.on("open", () => {
          startTime = lastTime = Date.now();
        });

        //on each chunk
        readStream.on("data", (chunk) => {
          if (cancelToken !== null && cancelToken.cancel) {
            readStream.close();
            reject(new Error("Cancelled"));
            return;
          }

          totalBytesRead += chunk.length;

          mediaInfo.openBufferContinue(chunk, chunk.length);
          this.hash.update(chunk);

          tick++;
          if (callback && tick % 10 === 0) {
            callback({
              bytesPerSecond: speedInBytes,
              bytesRead: totalBytesRead,
              size: fileSizeInBytes,
            });
          }
        });

        //on end of stream
        readStream.on("end", () => {
          mediaInfo.openBufferFinalize();
          const metaData = mediaInfo.inform();
          mediaInfo.close();

          let digest = this.hash.digest();
          const decoder = new StringDecoder("base64");

          resolve({
            metaData: JSON.parse(metaData),
            hash: decoder.write(digest),
            bytesPerSecond: speedInBytes,
            bytesRead: totalBytesRead,
            size: fileSizeInBytes,
          });
        });

        if (pathToTargets.length > 0) {
          for (let i = 0; i < writeStreams.length; i++) {
            if (!fs.existsSync(path.dirname(pathToTargets[i]))) {
              fs.mkdirSync(path.dirname(pathToTargets[i]), { recursive: true });
            }
            readStream.pipe(writeStreams[i]);
          }
        }
      });
    });
  }
}
