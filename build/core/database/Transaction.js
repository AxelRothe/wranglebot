import { v4 as uuidv4 } from "uuid";
class TransactionStatus {
}
TransactionStatus.PENDING = "pending";
TransactionStatus.SUCCESS = "success";
TransactionStatus.ROLLBACK = "rollback";
TransactionStatus.REJECTED = "failed";
TransactionStatus.EXISTS = "exists";
export default class Transaction {
    constructor(options) {
        if (!options.$method)
            throw new Error("Transaction method is required");
        this.uuid = options.uuid || uuidv4();
        this.$collection = options.$collection;
        this.$query = options.$query;
        this.$set = options.$set;
        this.status = options.status || TransactionStatus.PENDING;
        this.$method = options.$method;
        this.timestamp = options.timestamp || Date.now();
    }
    getStatus() {
        return this.status;
    }
    isPending() {
        return this.status === TransactionStatus.PENDING;
    }
    isCommitted() {
        return this.status === TransactionStatus.SUCCESS;
    }
    isRollback() {
        return this.status === TransactionStatus.ROLLBACK;
    }
    isRejected() {
        return this.status === TransactionStatus.REJECTED;
    }
    updateStatus(status) {
        this.status = status;
    }
    $commit(socket) {
        if (this.isCommitted())
            throw new Error("Transaction is already committed");
        return new Promise((resolve, reject) => {
            socket.emit("transaction", Object.assign({}, this.toJSON()));
            socket.removeAllListeners(this.uuid);
            socket.once(this.uuid, (data) => {
                if (data === TransactionStatus.SUCCESS) {
                    this.updateStatus(TransactionStatus.SUCCESS);
                    resolve(true);
                }
                else if (data === TransactionStatus.REJECTED) {
                    this.updateStatus(TransactionStatus.REJECTED);
                    resolve(false);
                }
                else if (data === TransactionStatus.ROLLBACK) {
                    this.updateStatus(TransactionStatus.ROLLBACK);
                    resolve(false);
                }
                else if (data === TransactionStatus.EXISTS) {
                    this.updateStatus(TransactionStatus.SUCCESS);
                    resolve(true);
                }
            });
        });
    }
    toJSON() {
        return {
            uuid: this.uuid,
            timestamp: this.timestamp,
            status: this.status,
            $method: this.$method,
            $collection: this.$collection,
            $query: this.$query,
            $set: this.$set,
        };
    }
}
//# sourceMappingURL=Transaction.js.map