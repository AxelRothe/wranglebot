export = SendBack;
declare class SendBack {
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
        status: 200 | 300 | 305 | 400 | 404 | 500;
        message: string | null;
        result: any | null;
        error: Error | null;
    });
    status: 200 | 500 | 300 | 305 | 400 | 404;
    message: string;
    result: any;
    error: boolean | Error;
}
//# sourceMappingURL=SendBack.d.ts.map