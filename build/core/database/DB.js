"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Transaction_1 = __importDefault(require("./Transaction"));
const logbotjs_1 = __importDefault(require("logbotjs"));
const socket_io_client_1 = require("socket.io-client");
const system_1 = require("../system");
const events_1 = __importDefault(require("events"));
const timers_1 = require("timers");
const md5_1 = __importDefault(require("md5"));
const uuid_1 = require("uuid");
class DB extends events_1.default {
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
        this.pathToTransactions = system_1.config.getPathToUserData() + "/transactions/" + `${(0, md5_1.default)(this.token + this.keySalt)}`;
        if (!system_1.finder.existsSync(this.pathToTransactions)) {
            system_1.finder.mkdirSync(this.pathToTransactions, { recursive: true });
        }
    }
    rebuildLocalModel() {
        return __awaiter(this, void 0, void 0, function* () {
            //check if offline mode
            if (!this.url && this.token) {
                let skip = false;
                if (!system_1.finder.existsSync(this.pathToTransactions)) {
                    system_1.finder.mkdirSync(this.pathToTransactions, { recursive: true });
                    skip = true;
                }
                if (system_1.finder.getContentOfFolder(this.pathToTransactions).length === 0) {
                    //create and save the initial transaction
                    yield this.saveTransaction(new Transaction_1.default({
                        $collection: "users",
                        $query: {
                            id: (0, uuid_1.v4)(),
                        },
                        $set: {
                            username: "admin",
                            password: (0, md5_1.default)("admin" + this.keySalt),
                            roles: ["admin"],
                            firstName: "Admin",
                            lastName: "Admin",
                            email: "admin@wranglebot.local",
                        },
                        $method: "updateOne",
                    }));
                }
            }
            if (system_1.finder.exists("transactions")) {
                let folderContents = system_1.finder.getContentOfFolder(this.pathToTransactions);
                const transactions = [];
                for (let file of folderContents) {
                    try {
                        const parsedData = JSON.parse(system_1.finder.parseFileSync(system_1.finder.join(this.pathToTransactions, file)));
                        transactions.push(new Transaction_1.default(parsedData));
                    }
                    catch (e) {
                        logbotjs_1.default.log(500, "Could not parse transaction file " + file + " Deleting File.");
                        system_1.finder.rmSync(system_1.finder.join(this.pathToTransactions, file));
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
                logbotjs_1.default.log(200, "Loaded " + this.transactions.length + " transactions from disk");
                if (transactionCounts.rejected > 0)
                    logbotjs_1.default.log(200, "Rejected: " + transactionCounts.rejected);
                if (transactionCounts.pending > 0)
                    logbotjs_1.default.log(200, "Pending: " + transactionCounts.pending);
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
            (0, timers_1.clearTimeout)(this.connectTimeout);
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
                logbotjs_1.default.log(600, "Could not connect to database. Trying again in 5 seconds.");
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
                logbotjs_1.default.log(200, "Syncing " + syncInfo.totalTransactions + " transactions");
                this.$emit("notification", {
                    title: "Syncing",
                    message: "Syncing " + syncInfo.totalTransactions + " transactions",
                });
                let syncedTransactions = 0;
                let blockIndex = 0;
                if (syncInfo.status === "synced") {
                    logbotjs_1.default.log(200, "Already synced. Skipping.");
                    this.$emit("notification", {
                        title: "Synced",
                        message: "Already synced. Skipping.",
                    });
                    resolve(true);
                    return;
                }
                this.socket.on("sync-block", (transactions) => {
                    for (let transaction of transactions) {
                        logbotjs_1.default.log(200, "Received transaction " + transaction.uuid + " from server (" + syncedTransactions + "/" + syncInfo.totalTransactions + ")");
                        this.$emit("notification", {
                            title: "Syncing",
                            message: "Transaction ... " + syncedTransactions + "/" + syncInfo.totalTransactions,
                        });
                        this.addTransactionToQueue(new Transaction_1.default({
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
                    logbotjs_1.default.log(200, "Finished Syncing " + syncedTransactions + " transactions");
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
        const transaction = new Transaction_1.default({
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
            logbotjs_1.default.log(409, "Transaction already exists in ledger");
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
                    logbotjs_1.default.log(500, e.message);
                }
            }
            if (toCommit.length > 0) {
                //this.saveTransactions();
                logbotjs_1.default.log(200, "Committed a total of " +
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
            this.socket = (0, socket_io_client_1.io)(this.url, {
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
                const t = new Transaction_1.default(Object.assign(Object.assign({}, data), { status: "success" }));
                logbotjs_1.default.log(100, `Received transaction ${t.uuid} from peer`);
                if (this.addTransactionToQueue(t, true)) {
                    this.emit("transaction", t);
                }
            });
            this.socket.on("disconnect", () => {
                this.offline = true; //going offline
                (0, timers_1.clearTimeout)(this.commitInterval);
                logbotjs_1.default.log(100, "Disconnected from peer");
            });
            this.socket.on("connect", () => {
                (0, timers_1.clearTimeout)(timer);
                this.offline = false;
                logbotjs_1.default.log(100, "Connected to peer");
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
            system_1.finder
                .saveAsync(`/transactions/${(0, md5_1.default)(this.token + this.keySalt)}/${transaction.uuid}`, JSON.stringify(transaction))
                .then(() => {
                logbotjs_1.default.log(200, "Saved transaction " + transaction.uuid + " to disk");
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
exports.default = getDB;
//# sourceMappingURL=DB.js.map