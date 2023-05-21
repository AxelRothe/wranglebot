"use strict";
/**
 * @typedef {"waiting"|"doing"|"done"|"failed"} StatusStrings
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Status = void 0;
class Status {
    constructor(value = "waiting") {
        this.status2 = value;
    }
    /**
     *
     * @param {StatusStrings} value
     */
    set status(value) {
        this.status2 = value;
    }
    /**
     * @return {StatusStrings}
     */
    get status() {
        return this.status2;
    }
}
exports.Status = Status;
//# sourceMappingURL=Status.js.map