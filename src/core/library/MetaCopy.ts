import { v4 as uuidv4 } from "uuid";
import { finder } from "../system/index.js";

class MetaCopy {
  id;
  label = "";
  #pathToSource;
  #pathToBucket;
  #hash = "";
  metaFile;

  /**
   *
   * @param options
   */
  constructor(options) {
    this.id = options.id ? options.id : uuidv4();

    this.label = options.label || "";
    this.metaFile = options.metaFile || undefined;

    this.#pathToSource = options.pathToSource;
    this.#pathToBucket = options.pathToBucket || this.#pathToSource;
    this.#hash = options.hash ? options.hash : "";
  }

  update(options, save = true) {
    this.label = options.label || this.label;
    this.#pathToSource = options.pathToSource || this.#pathToSource;
    this.#pathToBucket = options.pathToBucket || this.#pathToBucket;
    this.#hash = options.hash || this.#hash;
  }

  get pathToSource() {
    return this.#pathToSource;
  }

  get pathToBucket() {
    return {
      folder: finder.dirname(this.#pathToBucket),
      file: this.#pathToBucket,
    };
  }

  verify(hash) {
    this.#hash = hash;
    return this.metaFile.hash === this.#hash;
  }

  get hash() {
    return this.#hash;
  }

  /**
   * Is true if both the hash of the MetaCopy and the MetaFile match
   * @return {boolean}
   */
  isVerified() {
    return this.hash === this.metaFile.hash;
  }

  isReachable() {
    return finder.existsSync(this.pathToBucket.file);
  }

  toJSON(
    options = {
      db: false,
    }
  ) {
    return {
      id: this.id,
      label: this.label,
      pathToSource: this.#pathToSource,
      pathToBucket: this.#pathToBucket,
      hash: this.#hash,
      reachable: !options.db ? this.isReachable() : undefined,
    };
  }
}

export { MetaCopy };
