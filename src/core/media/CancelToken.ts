import { EventEmitter } from "events";

export default class CancelToken extends EventEmitter {
  cancel = false;

  abort() {
    this.cancel = true;
    this.emit("abort");
  }
}
