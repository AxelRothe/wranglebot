import { EventEmitter } from "events";
export default class CancelToken extends EventEmitter {
    constructor(callback = () => { }) {
        super();
        this.cancel = false;
        this.callback = () => { };
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
//# sourceMappingURL=CancelToken.js.map