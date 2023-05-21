declare class SendBack {
    status: any;
    message: any;
    result: any;
    error: any;
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
    constructor(options: {
        status: number;
        message: string;
        result?: any;
        error?: Error;
    });
}
export default SendBack;
//# sourceMappingURL=SendBack.d.ts.map