const { finder } = require("../system");
const { v4: uuidv4 } = require("uuid");

class IndexItem {
  static hashStyle = "xxhash3";
  pathToFile;
  basename;
  name;
  size;
  fileType;
  extension;

  constructor(pathToFile) {
    this.stat = finder.lstatSync(pathToFile);

    this.id = uuidv4();
    this.pathToFile = pathToFile;
    this.basename = finder.basename(pathToFile).toString();
    this.dirname = this.pathToFile.replace(this.basename, "");
    this.name = this.basename.substring(0, this.basename.lastIndexOf("."));
    this.size = this.stat.size;
    this.fileType = finder.getFileType(this.basename);
    this.extension = finder.extname(this.basename);
  }

  isDirectory() {
    return this.stat.isDirectory(this.pathToFile);
  }

  is(type) {
    return this.fileType === type;
  }

  toJSON() {
    return {
      id: this.id,
      path: this.pathToFile,
      name: this.basename,
      size: this.size,
      fileType: this.fileType,
      extension: this.extension,
    };
  }
}
module.exports.IndexItem = IndexItem;
