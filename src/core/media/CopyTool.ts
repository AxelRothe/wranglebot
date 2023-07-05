import { addAbortSignal, PassThrough, pipeline, Transform } from "stream";
import StreamSpeed from "streamspeed";
import { StringDecoder } from "string_decoder";
import pkg from "xxhash-addon";
const { XXHash128, XXHash3, XXHash32, XXHash64 } = pkg;
import diskusage from "diskusage-ng";
import { finder } from "../system/index.js";
import Probe from "./Probe.js";
import fs from "fs";
import Scraper from "./Scraper.js";

export default class CopyTool {
  key = "12345678";
  readStream: fs.ReadStream | null = null;
  writeStreams: fs.WriteStream[] = [];
  abortController: AbortController | null = null;

  paranoid: boolean = false;
  overwrite: boolean = false;

  highWaterMark = 1024 * 1024;
  fileSizeInBytes = -1;

  streamSpeed: StreamSpeed | null = null;
  private _source: string = "";
  private _destinations: string[] = [];
  private hash: pkg.XXHash64;
  private chunkSize: number;

  /**
   * Creates an instance of CopyTool.
   * @param [options] - The options for the CopyTool
   * @param [options.paranoid] - If true, will check the hash of the file after copying to ensure it matches the source
   * @param [options.hash] - The hash algorithm to use. Defaults to xxhash64, but can be xxhash128, xxhash32, or xxhash3
   * @param [options.overwrite] - If true, will overwrite the destination file if it exists
   * @param [options.chunkSize] - The size of each chunk to copy in MB. Defaults to 10MB
   */
  constructor(options: {
    paranoid?: boolean;
    hash?: "xxhash128" | "xxhash64" | "xxhash32" | "xxhash3";
    overwrite?: boolean;
    chunkSize?: number;
    key?: string;
  }) {
    this.paranoid = options.paranoid || false;
    this.overwrite = options.overwrite || false;
    this.chunkSize = options.chunkSize || 10;
    this.highWaterMark = this.chunkSize * 1024 * 1024;
    this.key = options.key || "12345678";

    switch (options.hash) {
      case "xxhash128":
        this.hash = new XXHash128(Buffer.from(this.key));
        break;
      case "xxhash64":
        this.hash = new XXHash64(Buffer.from(this.key));
        break;
      case "xxhash32":
        this.hash = new XXHash32(Buffer.from(this.key));
        break;
      case "xxhash3":
        this.hash = new XXHash3(Buffer.from(this.key));
        break;
      default:
        this.hash = new XXHash64(Buffer.from(this.key));
    }
  }

  /**
   * Adds a source file to copy
   * @param path - The path to the source file
   */
  source(path): CopyTool {
    if (!finder.existsSync(path)) {
      throw new Error("Source does not exist at " + path);
    }

    //get size of file
    const stats = finder.lstatSync(path);
    this.fileSizeInBytes = stats.size;

    this._source = path;
    return this;
  }

  /**
   * Adds a destination paths to copy to
   * @param paths - The paths to copy to
   */
  destinations(paths: string[]): CopyTool {
    this._destinations = paths;

    if (!this.overwrite) {
      for (let dest of this._destinations) {
        if (finder.existsSync(dest)) {
          throw new Error("Destination already exists at " + dest);
        }
      }
    } else {
      for (let dest of this._destinations) {
        if (finder.existsSync(dest)) {
          finder.rmSync(dest);
        }
      }
    }

    return this;
  }

  /**
   * Checks if there is enough space on the disks to copy the files
   * @private
   */
  private hasEnoughSpace() {
    return new Promise((resolve, reject) => {
      if (this._destinations.length > 0) {
        //check if there is enough space on the disk to write the file
        this.calculateRequiredSpace(this._destinations, this.fileSizeInBytes)
          .then((result) => {
            if (!result) {
              reject(new Error("Not enough space on disk"));
            } else {
              resolve(true);
            }
          })
          .catch((e) => {
            reject(e);
          });
      } else {
        reject(new Error("No destinations provided"));
      }
    });
  }

  /**
   * hashes the source file and returns the hash
   */
  hashFile(
    path: string,
    callback = (progress) => {
      /* do nothing */
    }
  ) {
    return new Promise((resolve, reject) => {
      if (!finder.existsSync(path)) {
        reject(new Error("File does not exist at " + path));
      }

      //reset the hash
      this.hash.reset();

      let fileSizeInBytes = finder.lstatSync(path).size;

      const readStream = finder.createReadStream(path, { highWaterMark: this.highWaterMark });
      const decoder = new StringDecoder("base64");

      /* init abort controller */
      this.abortController = new AbortController();
      addAbortSignal(this.abortController.signal, readStream);
      /* end abort controller */

      let totalBytesRead = 0;

      readStream.on("data", (chunk) => {
        this.hash.update(<Buffer>chunk);
        totalBytesRead += chunk.length;
      });

      /* init stream speed */
      this.streamSpeed = new StreamSpeed();
      this.streamSpeed.add(readStream);
      this.streamSpeed.on("speed", (speed) => {
        callback({
          bytesPerSecond: speed,
          bytesRead: totalBytesRead,
          size: fileSizeInBytes,
        });
      });
      /* end stream speed */

      readStream.on("end", () => {
        let digest = this.hash.digest();
        const hash = decoder.write(digest);
        resolve(hash);
      });

      readStream.on("error", (err) => {
        reject(err);
      });
    });
  }

  /**
   * Copies the file to the destinations
   *
   * @example
   *  const callback = (progress) => {
   *  //do something with progress
   *  }
   *
   *
   *  copyTool.source("path/to/source").destinations(["path/to/dest1", "path/to/dest2"]).copy(progress, abort).then(() => {
   *    //do something
   *  }).catch((e) => {
   *    //handle error
   *  });
   *
   * @param options
   * @param callback
   */
  copy(
    callback = (progress) => {
      /* do nothing */
    }
  ) {
    return new Promise((resolve, reject) => {
      //reset the hash
      this.hash.reset();

      //check if there is enough space on the disk to write the file
      this.hasEnoughSpace().then((r) => {
        if (!r) {
          reject(new Error("Not enough space on disk"));
        }

        let totalBytesRead = 0;

        /* init readStream */
        this.readStream = finder.createReadStream(this._source, { highWaterMark: this.highWaterMark });
        this.readStream.on("error", (err) => {
          reject(new Error("Read Process Failed or was Aborted"));
        });
        /* end readStream */

        /* init abort controller */
        this.abortController = new AbortController();
        addAbortSignal(this.abortController.signal, this.readStream);
        /* end abort controller */

        /* init stream speed */
        this.streamSpeed = new StreamSpeed();
        this.streamSpeed.add(this.readStream);
        this.streamSpeed.on("speed", (speed) => {
          callback({
            bytesPerSecond: speed,
            bytesRead: totalBytesRead,
            size: this.fileSizeInBytes,
          });
        });
        /* end stream speed */

        /* init writeStreams */
        for (let i = 0; i < this._destinations.length; i++) {
          let writeStream = finder.createWriteStream(this._destinations[i], { highWaterMark: this.highWaterMark });
          //mk dir if it doesn't exist
          finder.mkdirSync(finder.dirname(this._destinations[i]), { recursive: true });

          this.writeStreams.push(writeStream);
        }
        /* end writeStreams */

        /* init pass through */
        const passThroughStream = new PassThrough();
        this.writeStreams.forEach((writeStream) => {
          passThroughStream.pipe(writeStream);
        });
        passThroughStream.on("error", (err) => {
          reject(err);
        });
        /* end pass through */

        const transform = new Transform({
          transform: (chunk, encoding, callback) => {
            totalBytesRead += chunk.length;
            this.hash.update(chunk);
            callback(null, chunk);
          },
        });

        /* start piping */
        pipeline(this.readStream, transform, passThroughStream, (err) => {
          if (err) {
            reject(err);
          }

          //get hash of file
          let digest = this.hash.digest();
          const decoder = new StringDecoder("base64");
          const hash = decoder.write(digest);

          CopyTool.analyseFile(this._source).then((metaData) => {
            if (!this.paranoid) {
              resolve({
                hash,
                metaData,
                size: this.fileSizeInBytes,
              });
            } else {
              //get destination hashes
              this.verify(hash).then((result) => {
                resolve({
                  hash,
                  metaData,
                  size: this.fileSizeInBytes,
                });
              });
            }
          });
        });
      });
    });
  }

  static async analyseFile(path: string) {
    try {
      let metaData = await Probe.analyse(path);
      return Scraper.parse(metaData);
    } catch (e) {
      return {};
    }
  }

  abort() {
    if (this.abortController) this.abortController.abort();
    return true;
    throw new Error("No copy process to abort");
  }

  async verify(hash: string): Promise<boolean> {
    for (let i = 0; i < this._destinations.length; i++) {
      const result = await this.hashFile(this._destinations[i]);
      if (result !== hash) {
        throw new Error(`Hash of ${this._destinations[i]} is not the same as the original file: ${hash} !== ${result}`);
      }
    }
    return true;
  }

  getDiskUsage(volumePath) {
    return new Promise((resolve, reject) => {
      diskusage(volumePath, function (err, usage) {
        if (err) reject(err);
        resolve({ path: volumePath, freeSpace: usage.available });
      });
    });
  }

  /**
   * Checks if the size of the file is the same as the size of the file that was read
   * @param paths
   * @param fileSize
   * @return {boolean}
   */
  compareSizes() {
    for (let i = 0; i < this._destinations.length; i++) {
      const stats = finder.lstatSync(this._destinations[i]);
      if (stats.size !== this.fileSizeInBytes) {
        throw new Error(`File Size of ${this._destinations[i]} is not the same as the original file: ${this.fileSizeInBytes} !== ${stats.size}`);
      }
    }
    return true;
  }

  async calculateRequiredSpace(paths, totalJobSizeInBytes) {
    const volumes: any[] = [];

    // get list of unique volumes
    for (const filePath of paths) {
      const volumePath = finder.getVolumePath(filePath);
      if (!volumes.some((volume) => volume.path === volumePath)) {
        volumes.push(await this.getDiskUsage(volumePath));
      }
    }

    // check if each volume has enough free space
    for (const volume of volumes) {
      const requiredSpace = paths.reduce((totalSize, filePath) => {
        const volumeName = finder.getMountPoint(filePath);

        if (volumeName === volume.path) {
          return totalSize + totalJobSizeInBytes;
        }
        return totalSize;
      }, 0);

      if (volume.freeSpace < requiredSpace) {
        return false;
      }
    }

    return true;
  }
}
