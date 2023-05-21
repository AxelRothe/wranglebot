export default class Betweeny {
    /**
     * Creates a new Betweeny
     *
     * @param {200|500|400|300} status
     * @param {Object} data
     */
    constructor(status, data) {
        this.status = status;
        this.data = data;
        return this;
    }
    /**
     * Flatten the Betweeny into a JSON object   * @return {Object}
     */
    toJSON() {
        return {
            status: this.status,
            data: this.data,
        };
    }
}
//# sourceMappingURL=Betweeny.js.map