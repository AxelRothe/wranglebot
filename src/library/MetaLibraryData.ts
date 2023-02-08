export default class MetaLibraryData {
  constructor(rebuild: object | null = null) {
    if (rebuild !== null) {
      for (let [key, value] of Object.entries(rebuild)) {
        this.updateCol(key, value);
      }
    }
  }

  getCols() {
    return this;
  }

  /**
   *
   * @param {String} colID
   * @param {Number, String, Date} value
   */
  updateCol(colID, value) {
    this[colID] = value;
    return true;
  }

  removeCol(colID) {
    delete this[colID];
    return true;
  }
}
