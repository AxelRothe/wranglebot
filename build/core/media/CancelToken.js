import { EventEmitter } from "events";
export default class CancelToken extends EventEmitter {
    constructor() {
        super(...arguments);
        this.cancel = false;
    }
    abort() {
        this.cancel = true;
        this.emit("abort");
    }
}
//# sourceMappingURL=CancelToken.js.map