"use strict";
/**
 * @typedef {"waiting"|"doing"|"done"|"failed"} StatusStrings
 */
class Status {
    constructor(value = "waiting") {
        this.status = value;
    }
    /**
     *
     * @param {StatusStrings} value
     */
    set status(value) {
        this.status = value;
    }
    /**
     * @return {StatusStrings}
     */
    get status() {
        return this.status;
    }
}
module.exports.Status = Status;
//# sourceMappingURL=Status.js.map