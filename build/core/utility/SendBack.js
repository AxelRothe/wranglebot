class SendBack {
    constructor(options) {
        this.status = options.status ? options.status : 500;
        this.message = options.message ? options.message : "";
        this.result = options.result ? options.result : {};
        this.error = options.error ? options.error : false;
    }
}
export default SendBack;
//# sourceMappingURL=SendBack.js.map