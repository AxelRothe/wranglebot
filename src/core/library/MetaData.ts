class MetaData {
  entries = {};

  /**
   * @typedef {Object<string, string>} MetaDataTemplate
   */

  /**
   * Constructs a new MetaData object.
   *
   * @example
   * const metaData = new MetaData(MetaDataTemplate);
   *
   * @param {MetaDataTemplate} template
   */
  constructor(template = {}) {
    for (let [key, value] of Object.entries(template)) {
      this.updateEntry(key, value);
    }
  }

  /**
   * Returns the value of the given key
   *
   * @example
   * metaData.get("key")
   *
   * @param {String} index
   * @return {any}
   */
  getEntry(index) {
    if (this.entries[index]) return this.entries[index];
    return new Error("No such MetaData Entry: " + index);
  }

  get(key) {
    return this.getEntry(key);
  }

  /**
   * Updates an Entry in the MetaData
   *
   * @example
   * metaData.updateEntry("foo", { value: "bar" }, false);
   *
   * @param {string} index
   * @param {string} value
   * @param {boolean} upsert
   */
  updateEntry(index, value, upsert = true) {
    if (!this.entries[index] || upsert) {
      this.entries[index] = value;
    } else if (this.entries[index]) {
      this.entries[index] = value;
    }
  }

  set(key, value) {
    this.updateEntry(key, value);
  }

  update(metaDataEntries) {
    for (let [key, value] of Object.entries(metaDataEntries)) {
      this.updateEntry(key, value);
    }
  }

  /**
   * Removes an entry from the MetaData
   *
   * @example
   * metaData.removeEntry("production-company");
   *
   * @param {string} index
   */
  removeEntry(index) {
    delete this.entries[index];
  }

  /**
   * Returns the MetaData as a JSON object
   *
   * @example
   * metaData.toJSON();
   *
   * @param {Object} options
   * @returns {Object<string,string>}
   */
  toJSON(options = {}) {
    let obj = {};
    Object.entries(this.entries).forEach(([key, value]) => {
      obj[key] = value;
    });
    return obj;
  }
}

export { MetaData };
