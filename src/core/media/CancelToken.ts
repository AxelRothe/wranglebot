import { EventEmitter } from "events";

export default class CancelToken extends EventEmitter {
  private cancel = false;
  private callback: Function = () => {};

  constructor(callback = () => {}) {
    super();
    this.callback = callback;
  }

  addCallback(callback) {
    this.callback = callback;
  }

  abort() {
    this.cancel = true;
    this.callback();
    this.emit("abort");
  }
}
