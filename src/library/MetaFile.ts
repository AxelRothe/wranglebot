import { v4 as uuidv4 } from "uuid";

import { SearchLite } from "searchlite";

import { MetaCopy } from "./MetaCopy";

import { MetaData } from "./MetaData";

import { Thumbnail } from "./Thumbnail";

import { finder } from "../system";

import DB from "../database/DB";

import analyseMetaFileOptions from "./analyseMetaFileOptions";
import { MLInterface } from "../analyse/MLInterface";

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
    this.#hash = options.hash || "NaN";
    this.id = options.id || uuidv4();
    this.thumbnails = [];

    if (options.thumbnails) {
      for (let thumb of options.thumbnails) {
        const thumbnail = new Thumbnail(thumb);
        this.thumbnails.push(thumbnail);
      }
    }

    this.metaData = new MetaData(options.metaData) || new MetaData();
    this.basename = options.basename || "NaN";
    this.name = options.name || this.basename.split(".")[0];
    this.size = options.size || 0;
    this.fileType = options.fileType || "NaN";
    this.extension = options.extension || "";
    this.creationDate = options.creationDate ? new Date(options.creationDate) : new Date();

    this._hash = this.#hash;
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

  getThumbnails() {
    return this.thumbnails.map((thumbnail) => {
      thumbnail.metaFile = this;
      return thumbnail;
    });
  }

  analyse(options: analyseMetaFileOptions) {
    if (options && options.frames) {
      return MLInterface().analyseFrames({
        prompt: options.prompt,
        frames: options.frames,
        metafile: this,
      });
    }
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
