const { finder, config } = require("../system");
const DB = require("../database/DB");
import LogBot from "logbotjs";
import { MetaFile } from "./MetaFile";

class Thumbnail {
  id: string;
  data: any = undefined;

  metaFile: MetaFile | undefined = undefined;

  constructor(thumb) {
    this.id = thumb.id;
    this.data = thumb.data;
    this.metaFile = thumb.metaFile;
  }

  toJSON(): { data: string; id: string; metaFile?: string } {
    return {
      data: this.data,
      id: this.id,
      metaFile: this.metaFile ? this.metaFile.id : undefined,
    };
  }
}
module.exports.Thumbnail = Thumbnail;
export { Thumbnail };
