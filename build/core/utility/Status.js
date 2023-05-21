/**
 * @typedef {"waiting"|"doing"|"done"|"failed"} StatusStrings
 */
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
export { Status };
//# sourceMappingURL=Status.js.map