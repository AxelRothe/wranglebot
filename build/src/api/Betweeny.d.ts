export default class Betweeny {
    /**
     * @type {number}
     */
    status: any;
    /**
     * @type {Object}
     */
    data: any;
    /**
     * Creates a new Betweeny
     *
     * @param {200|500|400|300} status
     * @param {Object} data
     */
    constructor(status: any, data: any);
    /**
     * Flatten the Betweeny into a JSON object   * @return {Object}
     */
    toJSON(): {
        status: any;
        data: any;
    };
}
//# sourceMappingURL=Betweeny.d.ts.map