var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Transaction from "./Transaction.js";
import LogBot from "logbotjs";
import { io } from "socket.io-client";
import { config, finder } from "../system/index.js";
import EventEmitter from "events";
import { clearTimeout } from "timers";
import md5 from "md5";
import { v4 as uuidv4 } from "uuid";
class DB extends EventEmitter {
    constructor(options) {
        super();
        this.readOnly = false;
        this.key = undefined;
        this.transactions = [];
        this.localModal = {};
        this.offline = true;
        this.commitIntervalPause = 5000;
        this.unsavedChanges = false;
        this.saving = false;
        this.keySalt = "Wr4ngle_b0t";
        if (!options.url && !options.token)
            throw new Error("No database or token provided. Aborting.");
        this.url = options.url;
        this.token = options.token;
        //this is not a good solution but it obfuscates the key a bit
        this.pathToTransactions = config.getPathToUserData() + "/transactions/" + `${md5(this.token + this.keySalt)}`;
        if (!finder.existsSync(this.pathToTransactions)) {
            finder.mkdirSync(this.pathToTransactions, { recursive: true });
        }
    }
    rebuildLocalModel() {
        return __awaiter(this, void 0, void 0, function* () {
            //check if offline mode
            if (!this.url && this.token) {
                let skip = false;
                if (!finder.existsSync(this.pathToTransactions)) {
                    finder.mkdirSync(this.pathToTransactions, { recursive: true });
                    skip = true;
                }
                if (finder.getContentOfFolder(this.pathToTransactions).length === 0) {
                    //create and save the initial transaction
                    yield this.saveTransaction(new Transaction({
                        $collection: "users",
                        $query: {
                            id: uuidv4(),
                        },
                        $set: {
                            username: "admin",
                            password: md5("admin" + this.keySalt),
                            roles: ["admin"],
                            firstName: "Admin",
                            lastName: "Admin",
                            email: "admin@wranglebot.local",
                        },
                        $method: "updateOne",
                    }));
                }
            }
            if (finder.exists("transactions")) {
                let folderContents = finder.getContentOfFolder(this.pathToTransactions);
                const transactions = [];
                for (let file of folderContents) {
                    try {
                        const parsedData = JSON.parse(finder.parseFileSync(finder.join(this.pathToTransactions, file)));
                        transactions.push(new Transaction(parsedData));
                    }
                    catch (e) {
                        LogBot.log(500, "Could not parse transaction file " + file + ". Ignoring File.");
                    }
                }
                //sort transactions by timestamp
                transactions.sort((a, b) => {
                    return a.timestamp - b.timestamp > 0 ? 1 : -1;
                });
                this.localModal = {}; //reset
                let transactionCounts = {
                    committed: 0,
                    rejected: 0,
                    pending: 0,
                };
                for (let transaction of transactions) {
                    this.transactions.push(transaction);
                    this.apply(transaction);
                    transactionCounts[transaction.getStatus()]++;
                }
                LogBot.log(200, "Loaded " + this.transactions.length + " transactions from disk");
                if (transactionCounts.rejected > 0)
                    LogBot.log(200, "Rejected: " + transactionCounts.rejected);
                if (transactionCounts.pending > 0)
                    LogBot.log(200, "Pending: " + transactionCounts.pending);
            }
        });
    }
    /**
     * Connects the database to and returns itself
     *
     * @return {Promise<DB>}
     */
    connect(token = this.token) {
        return __awaiter(this, void 0, void 0, function* () {
            clearTimeout(this.connectTimeout);
            if (!token)
                throw new Error("No token provided. Aborting.");
            this.token = token;
            try {
                if (!this.socket)
                    yield this.listen();
                if (!this.socket.connected)
                    throw new Error("Socket not connected");
            }
            catch (e) {
                LogBot.log(600, "Could not connect to database. Trying again in 5 seconds.");
                this.connectTimeout = setTimeout(() => {
                    this.connect(token);
                }, 5000);
            }
            return this;
        });
    }
    fetchTransactions() {
        return new Promise((resolve) => {
            this.socket.emit("fetchTransactions", this.transactions.map((t) => t.uuid));
            this.socket.once("sync-start", (syncInfo) => {
                LogBot.log(200, "Syncing " + syncInfo.totalTransactions + " transactions");
                this.$emit("notification", {
                    title: "Syncing",
                    message: "Syncing " + syncInfo.totalTransactions + " transactions",
                });
                let syncedTransactions = 0;
                let blockIndex = 0;
                if (syncInfo.status === "synced") {
                    LogBot.log(200, "Already synced. Skipping.");
                    this.$emit("notification", {
                        title: "Synced",
                        message: "Already synced. Skipping.",
                    });
                    resolve(true);
                    return;
                }
                this.socket.on("sync-block", (transactions) => {
                    for (let transaction of transactions) {
                        LogBot.log(200, "Received transaction " + transaction.uuid + " from server (" + syncedTransactions + "/" + syncInfo.totalTransactions + ")");
                        this.$emit("notification", {
                            title: "Syncing",
                            message: "Transaction ... " + syncedTransactions + "/" + syncInfo.totalTransactions,
                        });
                        this.addTransactionToQueue(new Transaction({
                            $collection: transaction.$collection,
                            $method: transaction.$method,
                            $query: transaction.$query,
                            $set: transaction.$set,
                            timestamp: transaction.timestamp,
                            uuid: transaction.uuid,
                            status: "success",
                        }), true);
                        syncedTransactions++; //increment synced transactions
                    }
                    this.socket.emit("sync-block-ack:" + blockIndex, { status: "success" });
                    blockIndex++; //increment block index
                });
                this.socket.once("sync-end", () => {
                    LogBot.log(200, "Finished Syncing " + syncedTransactions + " transactions");
                    this.$emit("notification", {
                        title: "Synced",
                        message: "Finished Syncing " + syncedTransactions + " transactions",
                    });
                    resolve(true);
                });
            });
        });
    }
    $emit(event, ...args) {
        this.emit(event, ...args);
    }
    apply(transaction) {
        if (!transaction.isRejected()) {
            let collection = this.localModal[transaction.$collection];
            if (!collection) {
                this.localModal[transaction.$collection] = [];
                collection = this.localModal[transaction.$collection];
            }
            const index = collection.findIndex((c) => {
                for (let key in transaction.$query) {
                    if (c[key] !== transaction.$query[key])
                        return false;
                }
                return true;
            });
            if (transaction.$method === "updateOne") {
                if (index !== -1) {
                    //collection[index] = JSON.parse(JSON.stringify({ ...collection[index], ...transaction.$set }));
                    //apply changes to collection atomically
                    //for each key in $set, replace or inject it into the collection
                    for (let key in transaction.$set) {
                        if (typeof transaction.$set[key] === "object" && !Array.isArray(transaction.$set[key]) && transaction.$set[key] !== null) {
                            let keyContent = transaction.$set[key];
                            if (!collection[index][key]) {
                                collection[index][key] = {};
                            }
                            for (let subKey in keyContent) {
                                collection[index][key][subKey] = keyContent[subKey];
                            }
                        }
                        else {
                            collection[index][key] = JSON.parse(JSON.stringify(transaction.$set[key]));
                        }
                    }
                }
                else {
                    collection.push(JSON.parse(JSON.stringify(Object.assign(Object.assign({}, transaction.$query), transaction.$set))));
                    //LogBot.log(404, "Document not found. Creating new document");
                }
            }
            else if (transaction.$method === "insertMany") {
                if (transaction.$set instanceof Array) {
                    for (let doc of transaction.$set) {
                        collection.push(JSON.parse(JSON.stringify(doc)));
                    }
                }
                else {
                    collection.push(JSON.parse(JSON.stringify(transaction.$set)));
                }
            }
            else if (transaction.$method === "removeOne") {
                if (index !== -1) {
                    collection.splice(index, 1);
                    // LogBot.log(200, "Removed " + transaction.$collection + " with query " + JSON.stringify(transaction.$query));
                }
                else {
                    // LogBot.log(404, "Could not find document to remove");
                }
            }
            else if (transaction.$method === "removeMany") {
                //remove all documents that match the query
                for (let i = 0; i < collection.length; i++) {
                    const doc = collection[i];
                    //compare each key in the query to the document
                    let match = true;
                    for (let key in transaction.$query) {
                        if (doc[key] !== transaction.$query[key]) {
                            match = false;
                            break;
                        }
                    }
                    if (match) {
                        collection.splice(i, 1);
                        i--;
                        // LogBot.log(200, "Removed " + transaction.$collection + " with query " + JSON.stringify(transaction.$query));
                    }
                }
            }
        }
        else {
            throw new Error("Transaction corrupted. Aborting. Please delete transactions file and resync from server.");
        }
    }
    getTransactions(filter) {
        let transactions = this.transactions;
        for (let key in filter) {
            transactions = transactions.filter((t) => t.$query[key] === filter[key] || t.$set[key] === filter[key]);
        }
        return transactions;
    }
    addTransaction(method, collection, query, set, save = true) {
        if (this.readOnly)
            throw new Error("Database is in read-only mode. Aborting.");
        const transaction = new Transaction({
            $method: method,
            $collection: collection,
            $query: query,
            $set: set,
        });
        this.addTransactionToQueue(transaction, save);
        return transaction;
    }
    addTransactionToQueue(transaction, save = true) {
        //check if transaction already exists with uuid
        const existingTransaction = this.transactions.find((t) => t.uuid === transaction.uuid);
        if (!existingTransaction) {
            let timestamp = transaction.timestamp;
            //find the index where the transaction should be inserted
            let index = this.transactions.findIndex((t) => t.timestamp > timestamp);
            if (index === -1) {
                index = this.transactions.length;
                //insert the transaction
                this.transactions.splice(index, 0, transaction);
                this.apply(transaction);
            }
            else {
                //insert the transaction
                this.transactions.splice(index, 0, transaction);
                //iterate over all transactions after the inserted one and apply them
                for (let i = index; i < this.transactions.length; i++) {
                    this.apply(this.transactions[i]);
                }
            }
            if (save)
                this.saveTransaction(transaction);
            return true;
        }
        else {
            LogBot.log(409, "Transaction already exists in ledger");
            return false;
        }
    }
    commit() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.readOnly)
                throw new Error("Database is in read-only mode. Aborting.");
            if (this.offline)
                return;
            const toCommit = this.transactions.filter((t) => !t.isCommitted());
            for (let transaction of toCommit) {
                try {
                    yield transaction.$commit(this.socket);
                    this.saveTransaction(transaction);
                }
                catch (e) {
                    LogBot.log(500, e.message);
                }
            }
            if (toCommit.length > 0) {
                //this.saveTransactions();
                LogBot.log(200, "Committed a total of " +
                    toCommit.length +
                    " transactions. Successful: " +
                    toCommit.filter((t) => t.isCommitted()).length +
                    " Rejected: " +
                    toCommit.filter((t) => t.isRejected()).length);
                return toCommit.length === toCommit.filter((t) => t.isCommitted()).length;
            }
            else {
                return true;
            }
        });
    }
    listen() {
        return new Promise((resolve, reject) => {
            if (!this.url)
                reject(new Error("No url provided, can not connect to a cloud node"));
            // @ts-ignore
            this.socket = io(this.url, {
                reconnectionDelayMax: 5000,
                reconnection: true,
                reconnectionAttempts: Infinity,
                auth: {
                    token: this.token,
                },
            });
            let timer = setTimeout(() => {
                if (!this.socket.connected) {
                    this.offline = true;
                    reject(new Error("Could not connect to database"));
                }
            }, 5000);
            const commitIntervalFunc = () => {
                this.commit().then(() => {
                    setTimeout(commitIntervalFunc, this.commitIntervalPause);
                });
            };
            /**
             * receive transactions from server and apply them to local database
             */
            this.socket.on("transaction", (data) => {
                const t = new Transaction(Object.assign(Object.assign({}, data), { status: "success" }));
                LogBot.log(100, `Received transaction ${t.uuid} from peer`);
                if (this.addTransactionToQueue(t, true)) {
                    this.emit("transaction", t);
                }
            });
            this.socket.on("disconnect", () => {
                this.offline = true; //going offline
                clearTimeout(this.commitInterval);
                LogBot.log(100, "Disconnected from peer");
            });
            this.socket.on("connect", () => {
                clearTimeout(timer);
                this.offline = false;
                LogBot.log(100, "Connected to peer");
                this.offline = false; //back online
                this.fetchTransactions().then(() => {
                    this.commit().then(() => {
                        this.commitInterval = setTimeout(commitIntervalFunc, this.commitIntervalPause);
                        resolve(true);
                    });
                });
            });
        });
    }
    getOne(collection, query) {
        if (!this.localModal[collection])
            return null;
        const collectionData = this.localModal[collection].find((c) => {
            for (let key in query) {
                if (c[key] !== query[key])
                    return false;
            }
            return true;
        });
        //deep copying
        return JSON.parse(JSON.stringify(collectionData));
    }
    getMany(collection, query) {
        if (!this.localModal[collection])
            return [];
        const collectionData = this.localModal[collection].filter((c) => {
            for (let key in query) {
                if (c[key] !== query[key])
                    return false;
            }
            return true;
        });
        return JSON.parse(JSON.stringify(collectionData));
    }
    updateOne(collection, query, set, save = true) {
        return this.addTransaction("updateOne", collection, JSON.parse(JSON.stringify(query)), JSON.parse(JSON.stringify(set)), save);
    }
    removeOne(collection, query, save = true) {
        return this.addTransaction("removeOne", collection, JSON.parse(JSON.stringify(query)), {}, save);
    }
    removeMany(collection, query, save = true) {
        return this.addTransaction("removeMany", collection, JSON.parse(JSON.stringify(query)), {}, save);
    }
    insertMany(collection, query, data, save = true) {
        return this.addTransaction("insertMany", collection, query, JSON.parse(JSON.stringify(data)), save);
    }
    saveTransaction(transaction) {
        return new Promise((resolve, reject) => {
            finder
                .saveAsync(`/transactions/${md5(this.token + this.keySalt)}/${transaction.uuid}`, JSON.stringify(transaction))
                .then(() => {
                LogBot.log(200, "Saved transaction " + transaction.uuid + " to disk");
                resolve(true);
            })
                .catch((e) => {
                reject(e);
            });
        });
    }
}
let db;
const getDB = (options = undefined) => {
    if (db instanceof DB)
        return db;
    else if (options) {
        db = new DB({
            url: options.url,
            token: options.token,
        });
        return db;
    }
    throw new Error("No database instance found");
};
export default getDB;
//# sourceMappingURL=DB.js.map