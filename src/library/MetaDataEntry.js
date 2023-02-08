const { Blockchain } = require("../blockchain");
const { config } = require("../system");

class MetaDataEntry {
  #index;
  blockchain;

  constructor(index, options) {
    this.#index = index || "NaN";
    // this.value = options.value || "";
    this.blockchain = options.blockchain
      ? new Blockchain({
          chain: options.blockchain,
        })
      : new Blockchain({
          init: {
            value: options.value,
            changed: Date.now(),
            by: config.get("deviceId"),
          },
        });
    // this.lastChanged = options.lastChanged || Date.now();
  }

  update(value) {
    if (value !== this.value) {
      this.blockchain.add({
        value: value,
        changed: Date.now(),
        by: config.get("deviceId"),
      });
    }
  }

  get value() {
    return this.blockchain.last.value.value;
  }

  get lastChanged() {
    return this.blockchain.last.value.changed;
  }

  get index() {
    return this.#index;
  }

  verify() {
    return this.blockchain.verify();
  }

  toString() {
    return {
      index: this.index,
      blockchain: this.blockchain.start,
    };
  }
}
module.exports.MetaDataEntry = MetaDataEntry;
