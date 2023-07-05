import { v4 as uuidv4 } from "uuid";

import { SearchLite } from "searchlite";

import { MetaCopy } from "./MetaCopy.js";

import { MetaData } from "./MetaData.js";

import { Thumbnail } from "./Thumbnail.js";

import { finder } from "../system/index.js";

import DB from "../database/DB.js";

import analyseMetaFileOptions from "./analyseMetaFileOptions.js";
import { MLInterface } from "../analyse/MLInterface.js";
import CopyTool from "../media/CopyTool.js";

class MetaFile {
  id;
  copies: MetaCopy[] = [];
  #hash;
  metaData;

  basename;
  name;
  size;
  fileType;
  extension;

  query;

  thumbnails: Thumbnail[] = [];
  private _hash: any;
  creationDate: Date;

  /**
   *
   * @param options {{hash:string, id?: string, metaData?: object, name: string, basename:string, thumbnails?: string[], size: number, fileType: string, extension: string, creationDate?: string}}
   */
  constructor(options) {
    if (!options.hash) throw new Error("No hash provided");
    this.#hash = options.hash || "NaN";

    /* init id or copy from object */
    this.id = options.id || uuidv4();

    /* Thumbnails init */
    this.thumbnails = [];
    if (options.thumbnails) {
      for (let thumb of options.thumbnails) {
        const thumbnail = new Thumbnail(thumb);
        this.thumbnails.push(thumbnail);
      }
    }

    this.metaData = new MetaData(options.metaData) || new MetaData();

    if (!options.basename) throw new Error("No basename provided");
    if (options.basename.split(".").length < 2) throw new Error("Invalid basename");

    this.basename = options.basename;
    this.name = options.name || this.basename.split(".")[0];
    this.extension = options.extension || this.basename.split(".")[1];

    if (!options.size) throw new Error("No size provided");
    if (!options.fileType) throw new Error("No fileType provided");

    this.size = options.size;
    this.fileType = options.fileType;

    this.creationDate = options.creationDate ? new Date(options.creationDate) : new Date();

    this._hash = this.#hash;
  }

  /**
   * Creates a MetaFile from a source file
   *
   * @param source {string} the path to the source file
   * @return {Promise<MetaFile>} the created MetaFile
   */
  static async fromFile(source): Promise<MetaFile> {
    try {
      if (!finder.existsSync(source)) throw new Error("File does not exist");

      const basename = finder.basename(source).toString();

      const cpt = new CopyTool({
        hash: "xxhash64",
      });
      const hash = await cpt.hashFile(source);
      const metaData = await CopyTool.analyseFile(source);
      const size = finder.lstatSync(source).size;

      const newMf = new MetaFile({
        hash,
        metaData,
        basename,
        name: basename.substring(0, basename.lastIndexOf(".")),
        size,
        fileType: finder.getFileType(basename),
        extension: finder.extname(basename),
      });

      newMf.addCopy(
        new MetaCopy({
          pathToSource: source,
          metafile: newMf,
          hash,
        })
      );

      return newMf;
    } catch (e: any) {
      throw new Error("Could not create MetaFile from file: " + e.message);
    }
  }

  public getReachableCopies(): MetaCopy[] {
    let reachableCopies: MetaCopy[] = [];
    for (let copy of this.copies) {
      if (copy.isReachable()) {
        reachableCopies.push(copy);
      }
    }
    return reachableCopies;
  }

  /**
   * Get Hash
   * @return {string} hash
   */
  get hash() {
    return this.#hash;
  }

  async update(document, save = true) {
    if (document.metaData) {
      this.metaData.update(document.metaData);
    }

    if (document.thumbnails) {
      this.thumbnails = []; //reset thumbnails

      for (let thumb of document.thumbnails) {
        if (thumb instanceof Object && thumb.id && thumb.data) {
          this.addThumbnail(thumb);
        } else {
          const thumbFromDB = DB().getOne("thumbnails", { id: thumb });
          if (thumbFromDB) {
            this.addThumbnail(thumbFromDB);
          } else {
            throw new Error("Thumbnail not found in database: " + thumb);
          }
        }
      }
    }
  }

  /**
   *
   * @param thumbnail
   * @returns {Thumbnail}
   */
  addThumbnail(thumbnail) {
    if (!thumbnail.data) throw new Error("Thumbnail data is missing");
    if (!thumbnail.id) throw new Error("Thumbnail id is missing");
    // if (!thumbnail.frame) throw new Error("Thumbnail frame number is missing");

    const search = SearchLite.find(this.thumbnails, "id", thumbnail.id);
    if (search.wasFailure()) {
      const newThumbnail = new Thumbnail({
        id: thumbnail.id,
        data: thumbnail.data,
        metaFile: this,
      });
      this.thumbnails.push(newThumbnail);
      return newThumbnail;
    } else {
      // search.result.frame = thumbnail.frame;
      search.result.data = thumbnail.data;
      return search.result;
    }
  }

  /**
   * Removes a Thumbnail from the metafile and deletes its disk counterpart
   *
   * Does not remove the thumbnail from the database
   *
   * @param {string} thumbnailId
   * @returns {boolean} True if it was successful, false otherwise
   */
  removeOneThumbnail(thumbnailId) {
    this.thumbnails = this.thumbnails.filter((thumbnail) => {
      if (thumbnail.id === thumbnailId) {
        finder.rmSync(finder.join(finder.getPathToUserData("wranglebot"), "thumbnails", thumbnailId + ".jpg"));
        return false;
      }
      return true;
    });
  }

  /**
   *
   * @param {String} index
   * @param {String} value
   */
  updateMetaData(index, value) {
    //update MetaData here
  }

  getMetaData(options = { table: false }) {
    if (options.table) {
      let list: any = [];
      for (let [key, value] of Object.entries(this.metaData)) {
        list.push(value);
      }
      list.push(this.creationDate);
      return list;
    }
    return this.metaData;
  }

  /**
   *
   * @param {MetaCopy} metaCopy
   */
  addCopy(metaCopy) {
    for (let copy of this.copies) {
      if (copy.id === metaCopy.id) {
        copy = metaCopy;
        return 0;
      }
    }
    //if not found, add it
    this.copies.push(metaCopy);
    return 1;
  }

  dropCopy(metaCopy) {
    const index = this.copies.indexOf(metaCopy);
    if (index > -1) {
      this.copies.splice(index, 1);
      return -1;
    }
    return 0;
  }

  addCopies(copies) {
    for (let copy of copies) {
      this.addCopy(copy);
    }
  }

  getCopiesAs(type) {
    if (type === "array") {
      let list: any = [];
      for (let copy of this.copies) {
        list.push(copy.toJSON());
      }
      return list;
    } else if (type === "ids") {
      let list: any = [];
      for (let copy of this.copies) {
        list.push(copy.id);
      }
      return list;
    }
  }

  getMetaCopy(metaCopyId) {
    if (metaCopyId) {
      const search = SearchLite.find(this.copies, "id", metaCopyId);
      if (search.wasSuccess()) {
        return search.result;
      }
      return null;
    } else if (this.copies.length > 0) {
      for (let copy of this.copies) {
        if (copy.isVerified() && copy.isReachable()) {
          return copy;
        }
      }
    } else {
      return null;
    }
  }

  getThumbnail(thumbnailId, by = "id") {
    if (thumbnailId) {
      const search = SearchLite.find(this.thumbnails, by, thumbnailId);
      if (search.wasSuccess()) {
        return search.result;
      }
      throw new Error("Thumbnail not found");
    } else {
      throw new Error("No thumbnail id provided");
    }
  }

  getThumbnails(filters: { $ids? } = {}) {
    const thumbs = this.thumbnails.map((thumbnail) => {
      thumbnail.metaFile = this;
      return thumbnail;
    });
    if (filters.$ids) {
      return thumbs.filter((thumbnail) => filters.$ids.includes(thumbnail.id));
    }
    return thumbs;
  }

  analyse(options: analyseMetaFileOptions) {
    if (options && options.frames) {
      return MLInterface().analyseFrames({
        engine: options.engine,
        prompt: options.prompt,
        frames: options.frames,
        metafile: this,
        temperature: options.temperature,
        max_tokens: options.max_tokens,
      });
    }
    throw new Error("No frames provided");
  }

  toJSON(options = {}) {
    return {
      basename: this.basename,
      id: this.id,
      hash: this.#hash,
      creationDate: this.creationDate.toString(),
      name: this.name,
      fileType: this.fileType,
      extension: this.extension,
      size: this.size,
      metaData: this.metaData.toJSON(),
      copies: this.getCopiesAs("ids"),
      thumbnails: this.thumbnails.map((thumbnail) => thumbnail.id),
    };
  }
}
export { MetaFile };
