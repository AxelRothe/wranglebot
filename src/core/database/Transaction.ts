import { v4 as uuidv4 } from "uuid";

class TransactionStatus {
  static PENDING: string = "pending";
  static SUCCESS: string = "success";
  static ROLLBACK: string = "rollback";
  static REJECTED: string = "failed";
  static EXISTS: string = "exists";
}

interface TransactionOptions {
  status?: string;
  $method: TransactionMethod;
  $collection;
  $query;
  $set;
  uuid?: string;
  timestamp?: number;
}

type TransactionMethod = "updateOne" | "updateMany" | "removeOne" | "removeMany" | "insertMany";

export default class Transaction {
  uuid: string;
  timestamp: number;
  $collection: string;
  $query: object;
  $set: object | Array<any>;
  $method: TransactionMethod;

  private status: string;

  constructor(options: TransactionOptions) {
    if (!options.$method) throw new Error("Transaction method is required");

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

  updateStatus(status: string) {
    this.status = status;
  }

  /**
   *
   * @param socket
   * @returns Promise<Boolean> true if transaction is committed, false if transaction is rejected
   */
  $commit(socket) {
    if (this.isCommitted()) throw new Error("Transaction is already committed");

    return new Promise((resolve, reject) => {
      socket.emit("transaction", {
        ...this.toJSON(),
      });

      socket.removeAllListeners(this.uuid); //reset

      socket.once(this.uuid, (data) => {
        if (data === TransactionStatus.SUCCESS) {
          this.updateStatus(TransactionStatus.SUCCESS);
          resolve(true);
        } else if (data === TransactionStatus.REJECTED) {
          this.updateStatus(TransactionStatus.REJECTED);
          resolve(false);
        } else if (data === TransactionStatus.ROLLBACK) {
          this.updateStatus(TransactionStatus.ROLLBACK);
          resolve(false);
        } else if (data === TransactionStatus.EXISTS) {
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
