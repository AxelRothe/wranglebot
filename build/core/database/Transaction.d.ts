interface TransactionOptions {
    status?: string;
    $method: TransactionMethod;
    $collection: any;
    $query: any;
    $set: any;
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
    private status;
    constructor(options: TransactionOptions);
    getStatus(): string;
    isPending(): boolean;
    isCommitted(): boolean;
    isRollback(): boolean;
    isRejected(): boolean;
    updateStatus(status: string): void;
    /**
     *
     * @param socket
     * @returns Promise<Boolean> true if transaction is committed, false if transaction is rejected
     */
    $commit(socket: any): Promise<unknown>;
    toJSON(): {
        uuid: string;
        timestamp: number;
        status: string;
        $method: TransactionMethod;
        $collection: string;
        $query: object;
        $set: object | any[];
    };
}
export {};
//# sourceMappingURL=Transaction.d.ts.map