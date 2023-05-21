class SendBack {
    /**
     * @typedef {Object} SendBackOptions
     * @property {200|300|305|400|404|500} status
     * @property {string?} message
     * @property {any?} result
     * @property {Error?} error
     */
    /**
     * Creates a SendBack Object
     * @param {SendBackOptions} options
     */
    constructor(options) {
        this.status = options.status ? options.status : 500;
        this.message = options.message ? options.message : "";
        this.result = options.result ? options.result : {};
        this.error = options.error ? options.error : false;
    }
}
export default SendBack;
//# sourceMappingURL=SendBack.js.map