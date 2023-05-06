"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.WrangleBot = void 0;
const transcode_1 = require("./transcode");
const logbotjs_1 = __importDefault(require("logbotjs"));
const CopyDrive_1 = require("./library/CopyDrive");
const MetaLibrary_1 = __importDefault(require("./library/MetaLibrary"));
const MetaFile_1 = require("./library/MetaFile");
const Indexer_1 = require("./media/Indexer");
const Task_1 = __importDefault(require("./media/Task"));
const MetaCopy_1 = require("./library/MetaCopy");
const TranscodeTask_1 = require("./transcode/TranscodeTask");
const utility_1 = __importDefault(require("./system/utility"));
const api_1 = __importDefault(require("../api"));
const AccountManager_1 = __importDefault(require("./accounts/AccountManager"));
const MLInterface_1 = require("./analyse/MLInterface");
const extensions_1 = __importDefault(require("../extensions"));
const EventEmitter = require("events");
const { finder } = require("./system");
const { SearchLite } = require("searchlite");
const DB = require("./database/DB");
const { v4: uuidv4 } = require("uuid");
const { config } = require("./system"); //load here, otherwise the config will be preloaded and the config will be overwritten
const { DriveBot } = require("./drives");
/**
 * WrangleBot Interface
 * @class WrangleBot
 */
class WrangleBot extends EventEmitter {
    constructor() {
        super();
        // libraries: Array<MetaLibrary> = [];
        /**
         * @type {DriveBot}
         */
        this.driveBot = DriveBot;
        this.accountManager = AccountManager_1.default;
        this.finder = finder;
        /**
         @type {Config} config
         */
        this.config = config;
        this.status = WrangleBot.CLOSED;
        /**
         * index
         */
        this.index = {
            libraries: [],
            metaFiles: {},
            metaCopies: {},
            copyTasks: {},
            drives: {},
            transcodes: {},
        };
        this.thirdPartyExtensions = [];
    }
    open(options) {
        return __awaiter(this, void 0, void 0, function* () {
            logbotjs_1.default.log(100, "Opening WrangleBot instance ... ");
            this.emit("notification", {
                title: "Opening WrangleBot",
                message: "WrangleBot is starting up",
            });
            if (!config)
                throw new Error("Config failed to load. Aborting. Delete the config file and restart the bot.");
            if (!options.client.port)
                options.client.port = config.get("port");
            this.pingInterval = this.config.get("pingInterval") || 5000;
            try {
                yield this.loadExtensions();
                let db;
                if (options.client.database.cloud) {
                    //CLOUD SYNC DB
                    logbotjs_1.default.log(100, "User supplied cloud database credentials. Attempting to connect to cloud database.");
                    if (!options.client.database.cloud.databaseURL)
                        throw new Error("No databaseURL provided");
                    if (!options.client.database.cloud.token)
                        throw new Error("No token provided");
                    //init db interface
                    db = DB({
                        url: options.client.database.cloud.databaseURL,
                        token: options.client.database.cloud.token,
                    });
                    //rebuild local model
                    yield DB().rebuildLocalModel();
                    //connect to db websocket
                    yield db.connect(options.client.database.cloud.token);
                    if (options.client.database.cloud.machineLearningURL) {
                        //init machine learning interface
                        (0, MLInterface_1.MLInterface)({
                            url: options.client.database.cloud.machineLearningURL,
                            token: options.client.database.cloud.token,
                        });
                    }
                }
                else if (options.client.database.local) {
                    //LOCAL DB
                    logbotjs_1.default.log(100, "User supplied local database credentials. Attempting to connect to local database.");
                    //init db interface for local use
                    db = DB({
                        token: options.client.database.local.key,
                    });
                    //rebuild local model
                    yield DB().rebuildLocalModel();
                }
                if (db) {
                    DB().on("transaction", (transaction) => {
                        this.applyTransaction(transaction);
                    });
                    db.on("notification", (notification) => {
                        this.emit("notification", notification);
                    });
                    //start Account Manager
                    yield AccountManager_1.default.init();
                    //start Socket and REST API
                    yield this.startServer({
                        port: options.client.port || this.config.get("port"),
                        secret: options.client.secret || this.config.get("jwt-secret"),
                        mailConfig: options.mailConfig || this.config.get("mail"),
                    });
                    yield this.driveBot.updateDrives();
                    this.driveBot.watch(); //start drive watching
                    const libraries = this.getAvailableLibraries().map((l) => l.name);
                    let i = 1;
                    let total = libraries.length;
                    for (let libraryName of libraries) {
                        try {
                            const str = " (" + i + "/" + total + ") Attempting to load MetaLibrary " + libraryName;
                            this.emit("notification", {
                                title: str,
                                message: `Loading library ${libraryName}`,
                            });
                            logbotjs_1.default.log(100, str);
                            const r = yield this.loadOneLibrary(libraryName);
                            if (r.status !== 200) {
                                this.error(new Error("Could not load library: " + r.message));
                                this.emit("notification", {
                                    title: "Library failed to load",
                                    message: "Library " + libraryName + " was not loaded.",
                                });
                            }
                            else {
                                const str = " (" + i + "/" + total + ") Successfully loaded MetaLibrary " + libraryName;
                                this.emit("notification", {
                                    title: str,
                                    message: "Library " + libraryName + " loaded",
                                });
                                logbotjs_1.default.log(200, str);
                            }
                        }
                        catch (e) {
                            this.error(new Error("Could not load library: " + e.message));
                        }
                        i++;
                    }
                    for (let drive of DB().getMany("drives", {})) {
                        this.addToRuntime("drives", new CopyDrive_1.CopyDrive(drive));
                    }
                    this.driveBot.on("removed", this.handleVolumeUnmount.bind(this));
                    this.driveBot.on("added", this.handleVolumeMount.bind(this));
                    this.status = WrangleBot.OPEN;
                    this.emit("notification", {
                        title: "WrangleBot is ready",
                        message: "WrangleBot is ready to rumble.",
                    });
                    this.emit("ready", this);
                    return this;
                }
                else {
                    this.status = WrangleBot.CLOSED;
                    this.emit("notification", {
                        title: "Could not connect to database",
                        message: "WrangleBot could not connect to the database. Please check your internet connection and try again.",
                    });
                    this.emit("error", new Error("Could not connect to database"));
                    return null;
                }
            }
            catch (e) {
                logbotjs_1.default.log(500, e.message);
                this.status = WrangleBot.CLOSED;
                this.emit("error", e);
                this.emit("notification", {
                    title: "Could not connect to database",
                    message: "WrangleBot could not connect to the database. Please check your internet connection and try again.",
                });
                return null;
            }
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            this.status = WrangleBot.CLOSED;
            clearInterval(this.ping);
            this.driveBot.watcher.close();
            this.servers.httpServer.close();
            this.servers.socketServer.close();
            return WrangleBot.CLOSED;
        });
    }
    startServer(options) {
        return __awaiter(this, void 0, void 0, function* () {
            this.servers = yield api_1.default.init(this, options);
        });
    }
    /**
     * UTILITY FUNCTIONS
     */
    emit(event, ...args) {
        this.runCustomScript(event, ...args)
            .then(() => {
            return super.emit(event, ...args);
        })
            .catch((err) => {
            logbotjs_1.default.log(500, err);
        });
    }
    runCustomScript(event, ...args) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let extension of extensions_1.default) {
                if (extension.events.includes(event)) {
                    yield extension.handler(event, args, this);
                }
            }
            for (let extension of this.thirdPartyExtensions) {
                if (extension.events.includes(event)) {
                    yield extension.handler(event, args, this);
                }
            }
        });
    }
    loadExtensions() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                logbotjs_1.default.log(100, "Loading extensions ... ");
                //scan the plugins folder in the wranglebot directory
                //and load the routes from the plugins
                const pathToPlugins = finder.getPathToUserData("wranglebot/custom/");
                const thirdPartyPluginsRAW = finder.getContentOfFolder(pathToPlugins);
                logbotjs_1.default.log(100, "Found " + thirdPartyPluginsRAW.length + " third party plugins.");
                if (thirdPartyPluginsRAW.length > 0) {
                    for (let folderName of thirdPartyPluginsRAW) {
                        logbotjs_1.default.log(100, "Loading plugin " + folderName + " ... ");
                        const pathToPlugin = finder.getPathToUserData("wranglebot/custom/" + folderName);
                        const folderContents = finder.getContentOfFolder(pathToPlugin);
                        for (let pluginFolder of folderContents) {
                            if (pluginFolder === "hooks") {
                                const pathToPluginHooks = finder.getPathToUserData("wranglebot/custom/" + folderName + "/" + pluginFolder);
                                const hookFolderContent = finder.getContentOfFolder(pathToPluginHooks);
                                for (let scriptFileName of hookFolderContent) {
                                    logbotjs_1.default.log(100, "Loading hook " + scriptFileName + " ... ");
                                    const script = yield (_a = pathToPluginHooks + "/" + scriptFileName, Promise.resolve().then(() => __importStar(require(_a))));
                                    if (!script.name || script.name === "") {
                                        logbotjs_1.default.log(404, "Plugin " + folderName + " does not have a valid name. Skipping ... ");
                                        continue;
                                    }
                                    if (!script.description || script.description === "") {
                                        logbotjs_1.default.log(404, "Plugin " + folderName + " does not have a valid description. Skipping ... ");
                                        continue;
                                    }
                                    if (!script.version || script.version.match(/^[0-9]+\.[0-9]+\.[0-9]+$/) === null) {
                                        logbotjs_1.default.log(404, "Plugin " + folderName + " does not have a valid version (/^[0-9]+\\.[0-9]+\\.[0-9]+$/). Skipping ... ");
                                        continue;
                                    }
                                    if (!script.handler || !(script.handler instanceof Function)) {
                                        logbotjs_1.default.log(404, "Plugin " + folderName + " does not have a valid handler. Skipping ... ");
                                        continue;
                                    }
                                    if (!script.events || script.events.length === 0) {
                                        logbotjs_1.default.log(404, "Plugin " + folderName + " does not have any events. Skipping ... ");
                                        continue;
                                    }
                                    this.thirdPartyExtensions.push(script);
                                }
                            }
                        }
                    }
                }
            }
            catch (e) {
                logbotjs_1.default.log(500, e.message);
            }
        });
    }
    getAvailableLibraries() {
        return DB().getMany("libraries", {});
    }
    addOneLibrary(options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!options.name)
                throw new Error("No name provided");
            const allowedPaths = [
                //macos
                "/volumes/",
                "/users/",
                //linux
                "/media/",
                "/home/",
                //ubuntu
                "/mnt/",
                //archlinux
                "/run/media/",
            ];
            const path = options.pathToLibrary.toLowerCase();
            const allowed = allowedPaths.some((p) => path.startsWith(p));
            if (!allowed)
                throw new Error("Path is not allowed");
            //check if lib exists in database
            if (this.index.libraries.find((l) => l.name.toLowerCase() === options.name.toLowerCase())) {
                throw new Error("Library with that name already exists");
            }
            if (this.index.libraries.find((l) => path.startsWith(l.pathToLibrary.toLowerCase()))) {
                throw new Error("Library in path already exists");
            }
            const metaLibrary = new MetaLibrary_1.default(this, options);
            //add library to runtime
            this.index.libraries.unshift(metaLibrary);
            //add metaLibrary in database
            yield DB().updateOne("libraries", { name: metaLibrary.name }, metaLibrary.toJSON({ db: true }));
            metaLibrary.createFoldersOnDiskFromTemplate();
            this.emit("metalibrary-new", metaLibrary);
            return metaLibrary;
        });
    }
    removeOneLibrary(name, save = true) {
        if (!this.index.libraries.find((l) => l.name === name)) {
            return {
                status: 404,
                error: "database with that name does not exist or has not been loaded",
            };
        }
        this.unloadOneLibrary(name);
        if (save) {
            return DB().removeOne("libraries", { name });
        }
        this.emit("metalibrary-remove", name);
        return true;
    }
    getOneLibrary(name) {
        const lib = this.index.libraries.find((l) => l.name === name);
        if (lib)
            return lib;
        return DB().getOne("libraries", { name });
    }
    loadOneLibrary(name) {
        return new Promise((resolve, reject) => {
            if (this.index.libraries.find((l) => l.name === name)) {
                resolve({
                    status: 500,
                    message: "I can not load a library, that has been loaded already.",
                });
            }
            else {
                const lib = this.getOneLibrary(name);
                if (lib) {
                    const newMetaLibrary = new MetaLibrary_1.default(this, null);
                    let readOnly = false;
                    if (!finder.isReachable(lib.pathToLibrary)) {
                        readOnly = true;
                    }
                    newMetaLibrary
                        .rebuild(lib, readOnly)
                        .then(() => {
                        this.index.libraries.unshift(newMetaLibrary);
                        resolve({
                            status: 200,
                            result: newMetaLibrary,
                        });
                    })
                        .catch((e) => {
                        resolve({
                            status: 404,
                            result: null,
                            message: e.message,
                        });
                    });
                }
                else {
                    const libraries = this.getAvailableLibraries();
                    reject(new Error("No library named '" + name + "' found. Available libraries: ['" + libraries.map((lib) => lib.name).join(", '") + "']"));
                }
            }
        }).catch((e) => {
            this.error(e.message);
            return { status: 404, message: e.message };
        });
    }
    unloadOneLibrary(name) {
        const search = SearchLite.find(this.index.libraries, "name", name);
        if (search.wasSuccess()) {
            this.index.libraries.splice(search.count, 1);
            this.config.set("libraries", this.index.libraries.map((lib) => lib.name));
            return {
                status: 200,
                message: "Library unloaded",
            };
        }
        else {
            return {
                status: 404,
                message: "No library with that name found",
            };
        }
    }
    handleVolumeMount(volume) {
        for (let lib of this.index.libraries) {
            if (lib.pathToLibrary.startsWith(volume.mountpoint)) {
                lib.readOnly = false;
            }
        }
    }
    handleVolumeUnmount(volume) {
        for (let lib of this.index.libraries) {
            if (lib.pathToLibrary.startsWith(volume.mountpoint)) {
                lib.readOnly = true;
            }
        }
    }
    /* THUMBNAILS */
    /**
     * Generates Thumbnails from a list of MetaFiles
     *
     * @param library
     * @param {MetaFile[]} metaFiles
     * @param {Function|false} callback
     * @param finishCallback?
     * @returns {Promise<boolean>} resolve to false if there is no need to generate thumbnails or if there are no copies reachable
     */
    generateThumbnails(library, metaFiles, callback = (progress) => { }, finishCallback = (success) => { }) {
        return __awaiter(this, void 0, void 0, function* () {
            const callbackWrapper = function (p) {
                callback(Object.assign(Object.assign({}, p), { metaFile: currentFile }));
            };
            let currentFile = metaFiles[0];
            if (metaFiles.length > 0) {
                for (let file of metaFiles) {
                    currentFile = file;
                    try {
                        yield this.generateThumbnail(library, file, null, callbackWrapper);
                        finishCallback(file.id);
                    }
                    catch (e) {
                        logbotjs_1.default.log(500, "Error while generating thumbnail for file " + file.id + ": " + e.message);
                        throw e;
                    }
                }
                return true;
            }
            else {
                return false;
            }
        });
    }
    /**
     * Generates a Thumbnail from a MetaFile if it is a video or photo
     *
     * @param {string} library      - the library name
     * @param {MetaFile} metaFile   - the metaFile to generate a thumbnail for
     * @param {MetaCopy} metaCopy   - if not provided or unreachable, the first reachable copy will be used
     * @param {Function} callback   - callback function to update the progress
     * @returns {Promise<boolean>}  rejects if there is no way to generate thumbnails or if there are no copies reachable
     */
    generateThumbnail(library, metaFile, metaCopy, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            if (metaFile.fileType === "photo" || metaFile.fileType === "video") {
                //find the first copy that is has a reachable path
                let reachableMetaCopy;
                if (metaCopy && finder.existsSync(metaCopy.pathToBucket.file)) {
                    reachableMetaCopy = metaCopy;
                }
                else {
                    reachableMetaCopy = metaFile.copies.find((copy) => {
                        return finder.existsSync(copy.pathToBucket.file);
                    });
                }
                if (reachableMetaCopy) {
                    const thumbnails = yield transcode_1.TranscodeBot.generateThumbnails(reachableMetaCopy.pathToBucket.file, {
                        callback,
                        metaFile,
                    });
                    if (thumbnails) {
                        logbotjs_1.default.log(200, "Generated Thumbnails for <" + metaFile.name + ">");
                        if (metaFile.thumbnails.length > 0) {
                            logbotjs_1.default.log(200, "Deleting old Thumbnails <" + metaFile.thumbnails.length + "> for <" + metaFile.name + ">");
                            let thumbs = Object.values(metaFile.thumbnails);
                            for (let thumb of thumbs) {
                                metaFile.removeOneThumbnail(thumb.id);
                            }
                            yield DB().removeMany("thumbnails", { metafile: metaFile.id, library });
                            yield utility_1.default.twiddleThumbs(5); //wait 5 seconds to make sure the timestamp is incremented
                            logbotjs_1.default.log(200, "Deleted old Thumbnails now <" + metaFile.thumbnails.length + "> for <" + metaFile.name + ">");
                        }
                        logbotjs_1.default.log(200, "Saving Thumbnails <" + thumbnails.length + "> for <" + metaFile.name + ">");
                        for (let thumbnail of thumbnails) {
                            metaFile.addThumbnail(thumbnail);
                        }
                        const thumbData = [];
                        for (let thumb of metaFile.getThumbnails()) {
                            thumbData.push(thumb.toJSON());
                        }
                        yield DB().insertMany("thumbnails", { metaFile: metaFile.id, library }, thumbData);
                        yield utility_1.default.twiddleThumbs(5); //wait 5 seconds to make sure the timestamp is incremented
                        yield DB().updateOne("metafiles", { id: metaFile.id, library }, {
                            thumbnails: metaFile.getThumbnails().map((t) => t.id),
                        });
                        this.emit("thumbnail-new", metaFile.getThumbnails());
                        this.emit("metafile-edit", metaFile);
                        logbotjs_1.default.log(200, "Saved Thumbnails <" + thumbnails.length + "> for <" + metaFile.name + "> in DB");
                        return true;
                    }
                }
                else {
                    throw new Error("No reachable copy found. make sure a copy is reachable before generating thumbnails");
                }
            }
            throw new Error("Can't generate thumbnails for this file type");
        });
    }
    getManyTransactions(filter) {
        return DB().getTransactions(filter);
    }
    /**
     * Removes an Object from the runtime
     * if it already exists it will be overwritten
     *
     * @param {string} list i.e. copyTasks
     * @param {Object} item the object to remove
     * @return {0|1|-1} 0 if the item was not found, 1 if it was removed, -1 if the list does not exist
     */
    removeFromRuntime(list, item) {
        try {
            if (this.index[list]) {
                const foundItem = this.index[list][item.id];
                if (foundItem) {
                    delete this.index[list][item.id];
                    return 1;
                }
            }
            return -1;
        }
        catch (e) {
            console.error(e);
        }
    }
    /**
     * Adds an Object to the runtime
     * if it already exists it will be overwritten
     *
     * @param {string} list i.e. copyTasks
     * @param {{id:string}} item the object to add
     * @return {0|1|-1} 0 if the item was overwritten, 1 if it was added, -1 if the list does not exist
     */
    addToRuntime(list, item) {
        if (this.index[list]) {
            const alreadyExists = this.index[list][item.id];
            if (!alreadyExists) {
                this.index[list][item.id] = item;
                return 0;
            }
            else {
                this.index[list][item.id] = item;
                return 1;
            }
        }
        return -1;
    }
    /* LOGGING & DEBUGGING */
    error(message) {
        return logbotjs_1.default.log(500, message, true);
    }
    notify(title, message) {
        this.emit("notification", { title, message });
    }
    //**********************************
    //* API v2                         *
    //**********************************
    get query() {
        return {
            library: {
                many: (filters = {}) => {
                    const libs = this.index.libraries.filter((lib) => {
                        for (let key in filters) {
                            if (lib[key] !== filters[key])
                                return false;
                        }
                        return true;
                    });
                    return {
                        fetch: () => __awaiter(this, void 0, void 0, function* () {
                            return libs;
                        }),
                    };
                },
                one: (libraryId) => {
                    const lib = this.index.libraries.find((l) => l.name === libraryId);
                    if (!lib)
                        throw new Error("Library is not loaded or does not exist.");
                    return {
                        fetch() {
                            lib.query = this;
                            return lib;
                        },
                        put: (options) => {
                            return lib.update(options);
                        },
                        delete: () => {
                            return this.removeOneLibrary(libraryId);
                        },
                        scan: () => __awaiter(this, void 0, void 0, function* () {
                            return yield lib.createCopyTaskForNewFiles();
                        }),
                        transactions: {
                            one: (id) => {
                                return {
                                    fetch: () => {
                                        const t = this.getManyTransaction({
                                            id: id,
                                        });
                                        if (t.length > 0) {
                                            return t[0];
                                        }
                                        throw new Error("Transaction not found.");
                                    },
                                };
                            },
                            many: (filter = {}) => {
                                return {
                                    fetch: () => {
                                        return this.getManyTransactions(Object.assign(Object.assign({}, filter), { library: lib.name }));
                                    },
                                };
                            },
                        },
                        metafiles: {
                            one: (metaFileId) => {
                                const metafile = lib.getOneMetaFile(metaFileId);
                                if (!metafile)
                                    throw new Error("Metafile not found.");
                                return {
                                    fetch() {
                                        metafile.query = this;
                                        return metafile;
                                    },
                                    delete: () => {
                                        return lib.removeOneMetaFile(metafile);
                                    },
                                    thumbnails: {
                                        one: (id) => {
                                            return {
                                                fetch: () => {
                                                    return metafile.getThumbnail(id);
                                                },
                                            };
                                        },
                                        many: (filters) => {
                                            const thumbnails = metafile.getThumbnails(filters);
                                            return {
                                                fetch: () => {
                                                    return thumbnails;
                                                },
                                                analyse: (options) => __awaiter(this, void 0, void 0, function* () {
                                                    return yield metafile.analyse(Object.assign(Object.assign({}, options), { frames: thumbnails.map((t) => t.id) }));
                                                }),
                                            };
                                        },
                                        first: {
                                            fetch: () => {
                                                return metafile.getThumbnails()[0];
                                            },
                                        },
                                        center: {
                                            fetch: () => {
                                                const thumbs = metafile.getThumbnails();
                                                return thumbs[Math.floor(thumbs.length / 2)];
                                            },
                                        },
                                        last: {
                                            fetch: () => {
                                                const thumbs = metafile.getThumbnails();
                                                return thumbs[thumbs.length - 1];
                                            },
                                        },
                                        generate: () => __awaiter(this, void 0, void 0, function* () {
                                            return yield this.generateThumbnails(lib, metafile);
                                        }),
                                    },
                                    metacopies: {
                                        one: (metaCopyId) => {
                                            const metacopy = lib.getOneMetaCopy(metaFileId, metaCopyId);
                                            if (!metacopy)
                                                throw new Error("Metacopy not found.");
                                            return {
                                                fetch() {
                                                    metacopy.query = this;
                                                    return metacopy;
                                                },
                                                delete: (options = { deleteFile: false }) => {
                                                    return lib.removeOneMetaCopy(metacopy, options);
                                                },
                                            };
                                        },
                                        many: (filters = {}) => {
                                            return {
                                                fetch: () => {
                                                    return lib.getManyMetaCopies(metaFileId);
                                                },
                                            };
                                        },
                                    },
                                    metadata: {
                                        put: (options) => {
                                            return lib.updateMetaDataOfFile(metafile, options.key, options.value);
                                        },
                                    },
                                    analyse: (options) => __awaiter(this, void 0, void 0, function* () {
                                        return yield metafile.analyse(options);
                                    }),
                                };
                            },
                            many: (filters) => {
                                const files = lib.getManyMetaFiles(filters);
                                return {
                                    fetch: () => {
                                        return files;
                                    },
                                    export: {
                                        report: (options) => __awaiter(this, void 0, void 0, function* () {
                                            return yield lib.generateOneReport(files, {
                                                pathToExport: options.pathToExport ? options.pathToExport : lib.pathToLibrary + "/_Reports",
                                                reportName: options.reportName || "Report",
                                                logoPath: options.logoPath,
                                                uniqueNames: options.uniqueNames,
                                                format: options.format,
                                                template: options.template,
                                                credits: options.credits,
                                            });
                                        }),
                                    },
                                };
                            },
                        },
                        tasks: {
                            one: (id) => {
                                let task = lib.getOneTask(id);
                                return {
                                    fetch() {
                                        task.query = this;
                                        return task;
                                    },
                                    run: (callback, cancelToken) => __awaiter(this, void 0, void 0, function* () {
                                        return yield lib.runOneTask(id, callback, cancelToken);
                                    }),
                                    put: (options) => __awaiter(this, void 0, void 0, function* () {
                                        return yield lib.updateOneTask(Object.assign({ id }, options));
                                    }),
                                    delete: () => __awaiter(this, void 0, void 0, function* () {
                                        return lib.removeOneTask(id);
                                    }),
                                };
                            },
                            many: (filters = {}) => {
                                return {
                                    fetch() {
                                        return lib.getManyTasks();
                                    },
                                    delete: () => __awaiter(this, void 0, void 0, function* () {
                                        return yield lib.removeManyTasks(filters);
                                    }),
                                };
                            },
                            post: (options) => __awaiter(this, void 0, void 0, function* () {
                                return yield lib.addOneTask(options);
                            }),
                            generate: (options) => __awaiter(this, void 0, void 0, function* () {
                                return yield lib.generateOneTask(options);
                            }),
                        },
                        transcodes: {
                            one: (id) => {
                                let transcode = lib.getOneTranscodeTask(id);
                                return {
                                    fetch() {
                                        transcode.query = this;
                                        return transcode;
                                    },
                                    run: (callback, cancelToken) => __awaiter(this, void 0, void 0, function* () {
                                        yield lib.runOneTranscodeTask(id, callback, cancelToken);
                                    }),
                                    delete: () => {
                                        return lib.removeOneTranscodeTask(id);
                                    },
                                };
                            },
                            many: () => {
                                return {
                                    fetch() {
                                        return lib.getManyTranscodeTasks();
                                    },
                                    // delete: async () => {
                                    //   return lib.removeManyTranscodeTask({$ids : filters.$ids});
                                    // },
                                };
                            },
                            post: (files, options) => __awaiter(this, void 0, void 0, function* () {
                                return yield lib.addOneTranscodeTask(files, options);
                            }),
                        },
                        folders: {
                            put: (options) => __awaiter(this, void 0, void 0, function* () {
                                return yield lib.updateFolder(options.path, options.options);
                            }),
                        },
                    };
                },
                post: (options) => __awaiter(this, void 0, void 0, function* () {
                    return yield this.addOneLibrary(options);
                }),
                load: (name) => __awaiter(this, void 0, void 0, function* () {
                    return yield this.loadOneLibrary(name);
                }),
                unload: (name) => {
                    return this.unloadOneLibrary(name);
                },
            },
            users: {
                one: (options) => {
                    if (!options.id)
                        throw new Error("No id provided");
                    const user = AccountManager_1.default.getOneUser(options.id);
                    if (!user)
                        throw new Error("No user found with that " + options.id);
                    return {
                        fetch() {
                            user.query = this;
                            return user;
                        },
                        put: (options) => {
                            return AccountManager_1.default.updateUser(user, options);
                        },
                        allow: (libraryName) => {
                            return AccountManager_1.default.allowAccess(user, libraryName);
                        },
                        revoke: (libraryName) => {
                            return AccountManager_1.default.revokeAccess(user, libraryName);
                        },
                        reset: () => {
                            return AccountManager_1.default.resetPassword(user);
                        },
                    };
                },
                many: (filters = {}) => {
                    return {
                        fetch() {
                            return AccountManager_1.default.getAllUsers(filters);
                        },
                    };
                },
                post: (options) => __awaiter(this, void 0, void 0, function* () {
                    return AccountManager_1.default.addOneUser(Object.assign(Object.assign({}, options), { create: true }));
                }),
            },
            volumes: {
                one: (id) => {
                    const vol = this.driveBot.drives.find((d) => d.volumeId === id);
                    if (!vol)
                        throw new Error("Volume not found.");
                    return {
                        fetch() {
                            vol.query = this;
                            return vol;
                        },
                        eject: () => __awaiter(this, void 0, void 0, function* () {
                            return yield this.driveBot.eject(id);
                        }),
                    };
                },
                many: () => {
                    let driveWatcher = this.driveBot;
                    return {
                        fetch() {
                            return __awaiter(this, void 0, void 0, function* () {
                                return yield driveWatcher.getDrives();
                            });
                        },
                    };
                },
            },
            transactions: {
                one: (id) => { },
                many: (filter) => {
                    return {
                        fetch: () => __awaiter(this, void 0, void 0, function* () {
                            return this.getManyTransactions(filter);
                        }),
                    };
                },
            },
        };
    }
    get utility() {
        return {
            index: (pathToFolder, types) => __awaiter(this, void 0, void 0, function* () {
                return yield Indexer_1.Indexer.index(pathToFolder, types);
            }),
            list: (pathToFolder, options) => {
                if (!pathToFolder)
                    throw new Error("No path provided.");
                if (pathToFolder === "/")
                    throw new Error("Cannot list root directory.");
                if (!options) {
                    options = {
                        showHidden: false,
                        filters: "folders",
                        recursive: false,
                        depth: 0,
                    };
                }
                return finder.getContentOfFolder(pathToFolder, options);
            },
            uuid() {
                return uuidv4();
            },
            luts() {
                const pathToLuts = config.getPathToUserData() + "/LUTs";
                if (finder.existsSync(pathToLuts)) {
                    const files = finder.getContentOfFolder(pathToLuts).filter((f) => !f.startsWith("."));
                    return files;
                }
                else {
                    return [];
                }
            },
        };
    }
    applyTransaction(transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (transaction.$method === "updateOne")
                    yield this.applyTransactionUpdateOne(transaction);
                if (transaction.$method === "insertMany")
                    yield this.applyTransactionInsertMany(transaction);
                if (transaction.$method === "removeOne")
                    yield this.applyTransactionRemoveOne(transaction);
            }
            catch (e) {
                console.error(e);
                logbotjs_1.default.log(500, "Error applying transaction", e);
            }
        });
    }
    applyTransactionUpdateOne(transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            logbotjs_1.default.log(100, "applying transaction: " + transaction.id);
            //LIBRARY ADDED/UPDATED
            if (transaction.$collection === "libraries") {
                let lib = this.index.libraries.find((l) => l.name === transaction.$query.name);
                if (lib) {
                    yield lib.update(transaction.$set, false);
                    logbotjs_1.default.log(200, `Library ${lib.name} updated.`);
                }
                else {
                    const newMetaLibrary = new MetaLibrary_1.default(this, Object.assign(Object.assign({}, transaction.$set), transaction.$query));
                    this.addToRuntime("libraries", newMetaLibrary);
                    logbotjs_1.default.log(200, `Library ${newMetaLibrary.name} added.`);
                }
                this.servers.socketServer.inform("database", "libraries", "change");
            }
            //METAFILE ADDED/UPDATED
            if (transaction.$collection === "metafiles") {
                if (!transaction.$query.library)
                    throw new Error("No library provided to update metaFile.");
                let lib = this.index.libraries.find((l) => l.name === transaction.$query.library);
                if (lib) {
                    let file = lib.metaFiles.find((f) => f.id === transaction.$query.id);
                    if (file) {
                        file
                            .update(transaction.$set, false)
                            .then(() => {
                            logbotjs_1.default.log(200, "MetaFile updated");
                            this.servers.socketServer.inform("database", "metafiles", "change");
                        })
                            .catch((e) => {
                            console.error(e);
                            logbotjs_1.default.log(500, "Error updating metaFile", e);
                        });
                    }
                    else {
                        const newMetaFile = new MetaFile_1.MetaFile(Object.assign(Object.assign({}, transaction.$set), transaction.$query));
                        lib.metaFiles.push(newMetaFile);
                        this.addToRuntime("metaFiles", newMetaFile);
                        this.servers.socketServer.inform("database", "metafiles", "change");
                        logbotjs_1.default.log(200, "MetaFile created");
                    }
                }
                else {
                    throw new Error("Library not found.");
                }
            }
            //METACOPY ADDED/UPDATED
            if (transaction.$collection === "metacopies") {
                if (!transaction.$query.library)
                    throw new Error("No library provided to update MetaCopy.");
                let lib = this.index.libraries.find((l) => l.name === transaction.$query.library);
                if (lib) {
                    let copy = this.index.metaCopies[transaction.$query.id];
                    if (copy) {
                        copy.update(transaction.$set, false);
                        logbotjs_1.default.log(200, "MetaCopy updated", copy);
                        this.servers.socketServer.inform("database", "metafiles", "change");
                    }
                    else {
                        //find the file that this copy belongs to
                        let file = lib.metaFiles.find((f) => f.id === transaction.$query.metaFile);
                        if (!file) {
                            logbotjs_1.default.log(404, "MetaFile for MetaCopy not found");
                            return;
                        }
                        const newMetaCopy = new MetaCopy_1.MetaCopy(Object.assign(Object.assign({}, transaction.$set), transaction.$query));
                        file.addCopy(newMetaCopy);
                        this.addToRuntime("metaCopies", newMetaCopy);
                        this.servers.socketServer.inform("database", "metafiles", "change");
                        logbotjs_1.default.log(200, "MetaCopy created", newMetaCopy);
                    }
                }
                else {
                    throw new Error("Library not found.");
                }
            }
            //TASKS ADDED/UPDATED
            if (transaction.$collection === "tasks") {
                if (!transaction.$query.library)
                    throw new Error("No library provided to update Task.");
                let lib = this.index.libraries.find((l) => l.name === transaction.$query.library);
                if (lib) {
                    let task = this.index.copyTasks[transaction.$query.id];
                    if (task) {
                        task.update(transaction.$set, false);
                        this.servers.socketServer.inform("database", "tasks", "change");
                        logbotjs_1.default.log(200, "Task updated", task);
                    }
                    else {
                        const newTask = new Task_1.default(Object.assign(Object.assign({}, transaction.$set), transaction.$query));
                        lib.tasks.push(newTask);
                        this.addToRuntime("copyTasks", newTask);
                        this.servers.socketServer.inform("database", "tasks", "change");
                        logbotjs_1.default.log(200, "Task created", newTask);
                    }
                }
                else {
                    throw new Error("Library not found.");
                }
            }
            //TRANSCODES ADDED/UPDATED
            if (transaction.$collection === "transcodes") {
                if (!transaction.$query.library)
                    throw new Error("No library provided to update Transcodes.");
                let lib = this.index.libraries.find((l) => l.name === transaction.$query.library);
                if (lib) {
                    let transcode = this.index.transcodes[transaction.$query.id];
                    if (transcode) {
                        transcode.update(transaction.$set);
                        this.servers.socketServer.inform("database", "transcodes", "change");
                        logbotjs_1.default.log(200, "Transcode updated", transcode);
                    }
                    else {
                        const newTranscode = new TranscodeTask_1.TranscodeTask(null, Object.assign(Object.assign({}, transaction.$set), transaction.$query));
                        lib.transcodes.push(newTranscode);
                        this.addToRuntime("transcodes", newTranscode);
                        this.servers.socketServer.inform("database", "transcodes", "change");
                        logbotjs_1.default.log(200, "Transcode created", newTranscode);
                    }
                }
                else {
                    throw new Error("Library not found.");
                }
            }
        });
    }
    applyTransactionInsertMany(transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            if (transaction.$collection === "thumbnails") {
                const metaFile = this.index.metaFiles[transaction.$query.metaFile];
                if (!metaFile)
                    throw new Error("MetaFile not found.");
                for (let thumb of transaction.$set) {
                    metaFile.addThumbnail(thumb);
                }
            }
        });
    }
    applyTransactionRemoveOne(transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            if (transaction.$collection === "libraries") {
                let lib = this.index.libraries.find((l) => l.name === transaction.$query.name);
                if (lib) {
                    this.removeOneLibrary(lib, false);
                    this.servers.socketServer.inform("database", "libraries", "change");
                    logbotjs_1.default.log(200, `Library ${lib.name} removed.`);
                }
            }
            else if (transaction.$collection === "metafiles") {
                if (!transaction.$query.library)
                    throw new Error("No library provided to remove metaFile.");
                let lib = this.index.libraries.find((l) => l.name === transaction.$query.library);
                if (lib) {
                    let file = lib.metaFiles.find((f) => f.id === transaction.$query.id);
                    if (file) {
                        lib.removeOneMetaFile(file, false);
                        this.servers.socketServer.inform("database", "metafiles", "change");
                        logbotjs_1.default.log(200, "MetaFile removed", file);
                    }
                }
                else {
                    throw new Error("Library not found.");
                }
            }
            else if (transaction.$collection === "metacopies") {
                if (!transaction.$query.library)
                    throw new Error("No library provided to remove MetaCopy.");
                let lib = this.index.libraries.find((l) => l.name === transaction.$query.library);
                if (lib) {
                    let copy = this.index.metaCopies[transaction.$query.id];
                    if (copy) {
                        lib.removeOneMetaCopy(copy, { deleteFile: false }, false);
                        this.servers.socketServer.inform("database", "metafiles", "change");
                        logbotjs_1.default.log(200, "MetaCopy removed", copy);
                    }
                }
                else {
                    throw new Error("Library not found.");
                }
            }
            else if (transaction.$collection === "tasks") {
                if (!transaction.$query.library)
                    throw new Error("No library provided to remove Task.");
                let lib = this.index.libraries.find((l) => l.name === transaction.$query.library);
                if (lib) {
                    let task = this.index.copyTasks[transaction.$query.id];
                    if (task) {
                        lib.removeOneTask(task.id, "id", false);
                        this.servers.socketServer.inform("database", "tasks", "change");
                        logbotjs_1.default.log(200, "Task removed", task);
                    }
                }
                else {
                    throw new Error("Library not found.");
                }
            }
            else if (transaction.$collection === "transcodes") {
                if (!transaction.$query.library)
                    throw new Error("No library provided to remove Transcode.");
                let lib = this.index.libraries.find((l) => l.name === transaction.$query.library);
                if (lib) {
                    let transcode = this.index.transcodes[transaction.$query.id];
                    if (transcode) {
                        lib.removeOneTranscodeTask(transcode.id, false);
                        this.servers.socketServer.inform("database", "transcodes", "change");
                        logbotjs_1.default.log(200, "Transcode removed", transcode);
                    }
                }
                else {
                    throw new Error("Library not found.");
                }
            }
        });
    }
}
exports.WrangleBot = WrangleBot;
WrangleBot.OPEN = "open";
WrangleBot.CLOSED = "closed";
const wb = new WrangleBot();
exports.default = wb;
//# sourceMappingURL=WrangleBot.js.map