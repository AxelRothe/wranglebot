export default class Betweeny {
    constructor(status, data) {
        this.status = status;
        this.data = data;
        return this;
    }
    toJSON() {
        return {
            status: this.status,
            data: this.data,
        };
    }
}
//# sourceMappingURL=Betweeny.js.map