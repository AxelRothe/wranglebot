import Transaction from "./Transaction.js";
import EventEmitter from "events";
interface DBOptions {
    url?: string;
    token: string;
}
declare class DB extends EventEmitter {
    private readOnly;
    private readonly url;
    private key;
    private token;
    transactions: Transaction[];
    private socket;
    private localModal;
    private offline;
    private commitInterval;
    private commitIntervalPause;
    private connectTimeout;
    private unsavedChanges;
    private saving;
    private pathToTransactions;
    private keySalt;
    constructor(options: DBOptions);
    private rebuildLocalModel;
    connect(token?: string): Promise<this>;
    private fetchTransactions;
    private $emit;
    private apply;
    getTransactions(filter: {
        [key: string]: any;
    }): Transaction[];
    addTransaction(method: any, collection: any, query: any, set: any, save?: boolean): Transaction;
    private addTransactionToQueue;
    commit(): Promise<boolean | undefined>;
    listen(): Promise<unknown>;
    getOne(collection: string, query: any): any | null;
    getMany(collection: string, query: any): any[];
    updateOne(collection: string, query: object, set: object, save?: boolean): Transaction;
    removeOne(collection: string, query: object, save?: boolean): Transaction;
    removeMany(collection: string, query: object, save?: boolean): Transaction;
    insertMany(collection: string, query: any, data: any[], save?: boolean): Transaction;
    saveTransaction(transaction: Transaction): Promise<unknown>;
}
declare const getDB: (options?: DBOptions | undefined) => any;
export default getDB;
export { DB };
//# sourceMappingURL=DB.d.ts.map