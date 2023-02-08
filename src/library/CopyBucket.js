const { PathElement } = require("./PathElements");
const Handlebars = require("handlebars");
const { finder } = require("../system");
const { v4: uuidv4 } = require("uuid");

class CopyBucket {
  pathElements = [];
  active = true;
  label = "";
  _id = "";
  id = uuidv4();

  query;

  drive = null;

  constructor(options) {
    this._id = options._id ? options._id.toString() : "";

    this.label = options.label ? options.label : "";

    this.id = options.id ? options.id : this.id;

    if (!options.drive) return new Error("drive is required to create a bucket");
    this.drive = options.drive;

    if (!options.pathElements) return new Error("pathElements is required to create a bucket");
    if (options.pathElements) {
      options.pathElements.forEach((path) => {
        const regex = /(?<=\{\{)(.*?)(?=\}\})/gi;
        this.pathElements.push(
          path.replace(regex, (match) => {
            return match.replaceAll(" ", "");
          })
        );
      });
    }

    this.active = options.hasOwnProperty("active") ? options.active : true;
  }

  setDatabaseRefID(value) {
    this._id = value;
  }

  /**
   * Assembles a string with handlebars of the buckets path elements
   * Always adds a preceding "/"
   * @return {string}
   */
  buildPath() {
    let str = "/";
    this.pathElements.forEach((element) => {
      str = finder.join(str, element);
    });
    return str;
  }

  /**
   * @deprecated
   * use buildPath() instead
   * @return {string}
   */
  getRawPath() {
    return this.buildPath();
  }

  /**
   * Returns a compiled path of the Bucket
   *
   * @param {{
   *    [key: string]: string
   *  }} fillIns Pass key:value pair
   * @return {string} the compiled string
   */
  locate(fillIns) {
    return this.compile(this.buildPath(), fillIns);
  }

  /**
   * compiles a string with handlebars
   * @param {string} str
   * @param {{
   *    [key: string]: string
   *  }} fillIns Pass key:value pair
   * @return {string}
   */
  compile(str, fillIns) {
    const template = Handlebars.compile(str);
    return template(fillIns);
  }

  /**
   * Returns a version of the Bucket that can be passed to database
   *
   * @return {{pathElements: string[], active: boolean, id: String, label: string}}
   */
  prepareForDB() {
    return {
      id: this.id,
      label: this.label,
      active: this.active,
      pathElements: this.pathElements,
      drive: this.drive.id,
    };
  }

  async toJSON(drops = {}) {
    const resolvedPath = this.locate(drops);
    return {
      ...this.prepareForDB(),
      path: resolvedPath,
      raw: this.buildPath(),
      mounted: finder.isReachable(resolvedPath),
      disk: await finder.checkDiskSpace(resolvedPath),
    };
  }
}
module.exports.CopyBucket = CopyBucket;
