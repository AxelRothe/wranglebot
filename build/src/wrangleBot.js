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
exports.WrangleBot = void 0;
const transcode_1 = require("./transcode");
const logbotjs_1 = __importDefault(require("logbotjs"));
const Volume_1 = require("./drives/Volume");
const CopyDrive_1 = require("./library/CopyDrive");
const MetaLibrary_1 = __importDefault(require("./library/MetaLibrary"));
const MetaFile_1 = require("./library/MetaFile");
const Indexer_1 = require("./media/Indexer");
const Task_1 = __importDefault(require("./media/Task"));
const MetaCopy_1 = require("./library/MetaCopy");
const TranscodeTask_1 = require("./transcode/TranscodeTask");
const utility_1 = __importDefault(require("./system/utility"));
const api_1 = __importDefault(require("./api"));
const AccountManager_1 = __importDefault(require("./accounts/AccountManager"));
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
    }
    open(options) {
        return __awaiter(this, void 0, void 0, function* () {
            logbotjs_1.default.log(100, "Opening WrangleBot");
            this.emit("notification", {
                title: "Opening WrangleBot",
                message: "WrangleBot is starting up",
            });
            if (!config)
                throw new Error("Config failed to load. Aborting. Delete the config file and restart the bot.");
            if (!options.port)
                options.port = config.get("port");
            this.pingInterval = this.config.get("pingInterval") || 5000;
            try {
                let db;
                if (options.database) {
                    db = DB({
                        url: options.database,
                        token: options.token,
                    });
                    yield DB().rebuildLocalModel();
                    yield db.connect(options.key);
                }
                else {
                    db = DB({
                        key: options.key,
                    });
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
                        port: options.port || this.config.get("port"),
                        key: options.key,
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
                    this.emit("connectedToCloud", this);
                    return this;
                }
                else {
                    this.status = WrangleBot.CLOSED;
                    this.emit("notification", {
                        title: "Could not connect to database",
                        message: "WrangleBot could not connect to the database. Please check your internet connection and try again.",
                    });
                    this.emit("failedToConnectToCloud", new Error("Could not connect to database"));
                    return null;
                }
            }
            catch (e) {
                logbotjs_1.default.log(500, e.message);
                this.status = WrangleBot.CLOSED;
                this.emit("failedToConnectToCloud", e);
                this.emit("notification", {
                    title: "Could not connect to database",
                    message: "WrangleBot could not connect to the database. Please check your internet connection and try again.",
                });
                return null;
            }
        });
    }
    startServer(options) {
        return __awaiter(this, void 0, void 0, function* () {
            this.servers = yield api_1.default.init(this, options.port, options.key);
        });
    }
    /**
     * Shuts down the WrangleBot.
     *
     * @return {Promise<string>}
     */
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
    /**
     * Returns all available libraries from the database
     * @return {Promise<MetaLibrary[]>}
     */
    getAvailableLibraries() {
        return DB().getMany("libraries", {});
    }
    /**
     * Creates a library repository
     * @param options {{name:string, pathToLibrary?:string, drops?:string[], folders?:{name:string, watch: boolean, folders:Object[]}[]}}
     * @return {Promise<MetaLibrary>}
     */
    addOneLibrary(options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!options.name)
                throw new Error("No name provided");
            //check if lib exists in database
            if (this.index.libraries.find((l) => l.name === options.name)) {
                throw new Error("Library with that name already exists");
            }
            if (this.index.libraries.find((l) => options.pathToLibrary.startsWith(l.pathToLibrary))) {
                throw new Error("Library in path already exists");
            }
            const metaLibrary = new MetaLibrary_1.default(this, options);
            //add library to runtime
            this.index.libraries.unshift(metaLibrary);
            //write to config file for startup
            this.config.set("libraries", this.index.libraries.map((lib) => lib.name));
            //add metaLibrary in database
            yield DB().updateOne("libraries", { name: metaLibrary.name }, metaLibrary.toJSON({ db: true }));
            metaLibrary.createFoldersOnDiskFromTemplate();
            return metaLibrary;
        });
    }
    /**
     * Removes a library from the database
     * @param name
     * @param save
     * @returns {Promise<boolean|undefined|{error: string, status: number}>}
     */
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
        return true;
    }
    /**
     * Retrieves a library from the local database or from the cloud
     * @param name
     * @returns {Promise<MetaLibrary|Object>}
     */
    getOneLibrary(name) {
        const lib = this.index.libraries.find((l) => l.name === name);
        if (lib)
            return lib;
        return DB().getOne("libraries", { name });
    }
    /**
     * Loads a Library from a file and returns a library
     * @param {String} name
     * @return {Promise<ReturnObject>}
     */
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
    /**
     * Unloads a library from the runtime
     * @param name
     * @private
     */
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
    /* Mount Library on Mount Change */
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
    /* DRIVES */
    /**
     * @example
     * getOneLinkedDrive("id", "1234567890")
     *
     * @param by {string} - the property to search by
     * @param value {string} - the value to search for
     * @returns {CopyDrive>}
     * @throws {Error} if no drive was found
     */
    getOneLinkedDrive(by, value) {
        const devices = this.getManyLinkedDrives("all", false);
        for (let d of devices) {
            if (d[by] === value) {
                return d;
            }
        }
        throw new Error("Could not find drive with " + by + " : " + value);
    }
    /**
     *
     * @param asType
     * @param onlyMounted
     * @return {CopyDrive[]}
     */
    getManyLinkedDrives(asType = "all", onlyMounted = false) {
        let list = [];
        let listOfDrives = Object.values(this.index.drives);
        for (let d of listOfDrives) {
            if (d.wbType === asType || asType === "all") {
                if (d.isMounted() && onlyMounted) {
                    list.push(d);
                }
                else if (!onlyMounted) {
                    list.push(d);
                }
            }
        }
        return list;
    }
    /**
     * Registers a drive to the library
     *
     * @param {Volume} volume
     * @param {'source'|'endpoint'|'generic'} wbType
     * @returns {Promise<Error|CopyDrive|*>}
     */
    linkOneDrive(volume, wbType) {
        return __awaiter(this, void 0, void 0, function* () {
            const drives = yield this.getManyLinkedDrives();
            const search = drives.find((d) => {
                return (d.volume instanceof Volume_1.Volume && d.volume.label === volume.label) || d.volume === volume;
            });
            if (!search) {
                const newCopyDrive = new CopyDrive_1.CopyDrive(volume, { wbType: wbType });
                const result = yield DB().updateOne("drives", { id: newCopyDrive.id, library: this.name }, newCopyDrive.toJSON({ db: true })); //post to database
                if (result.acknowledged && result.upsertedCount > 0) {
                    //if success
                    this.addToRuntime("drives", newCopyDrive); //add it to the runtime
                    return newCopyDrive;
                }
                else {
                    return new Error("Could not add CopyDrive with mountpoint " + volume.mountpoint);
                }
            }
            else {
                return new Error("Drive with mountpoint " + volume.mountpoint + " already registered");
            }
        });
    }
    /**
     * Unlink a drive from the library
     *
     * @param {CopyDrive | string} driveOrId copydrive or the id
     * @returns {Promise<Error|true>}
     */
    unlinkOneDrive(driveOrId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (driveOrId instanceof CopyDrive_1.CopyDrive) {
                const res = yield DB().removeOne("drives", { id: driveOrId.id, library: this.name });
                this.removeFromRuntime("drives", driveOrId);
                return true;
            }
            else {
                const drive = this.index.drives[driveOrId];
                const res = yield DB().removeOne("drives", { id: driveOrId, library: this.name });
                this.removeFromRuntime("drives", drive);
                return true;
            }
        });
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
                        console.error(e);
                    }
                }
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
                        // for (let thumb of metaFile.getThumbnails()) {
                        //   await DB().updateOne("thumbnails", { id: thumb.id, metafile: metaFile.id }, await thumb.toJSON({ db: true }), false);
                        // }
                        const thumbData = [];
                        for (let thumb of metaFile.getThumbnails()) {
                            thumbData.push(yield thumb.toJSON({ db: true }));
                        }
                        yield DB().insertMany("thumbnails", { metaFile: metaFile.id, library }, thumbData);
                        yield utility_1.default.twiddleThumbs(5); //wait 5 seconds to make sure the timestamp is incremented
                        yield DB().updateOne("metafiles", { id: metaFile.id, library }, {
                            thumbnails: metaFile.getThumbnails().map((t) => t.id),
                        });
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
    success(message) {
        return logbotjs_1.default.log(200, message, true);
    }
    error(message) {
        return logbotjs_1.default.log(500, message, true);
    }
    /*watch() {
      //listen on volume mount and dismounts
      this.driveWatcher.watch();
  
      DB().on("taskUpdated", (task) => {
        const taskToUpdate = this.index.copyTasks[task.id];
        if (taskToUpdate) {
          taskToUpdate.update(task);
          LogBot.log(200, "[DB] Task " + task.label + " Update");
        }
      });
      DB().on("taskRemoved", (task) => {      const taskToRemove = this.index.copyTasks[task.id];
        if (taskToRemove) {
          this.removeFromRuntime("copyTasks", taskToRemove);
          LogBot.log(200, "[DB] Task Deleted: " + task);
        } else {
          LogBot.log(500, "[DB] Task not found: " + task);
        }
      });
  
      DB().on("metaFileUpdated", (metaFile) => {
        const metaFileToUpdate = this.index.metaFiles[metaFile.id];
        if (metaFileToUpdate) {
          metaFileToUpdate.update(metaFile);
          LogBot.log(200, "[DB] MetaFile " + metaFile.name + " Update");
        }
      });
      DB().on("metaFileRemoved", (metaFile) => {
        const metaFileToRemove = this.index.metaFiles[metaFile.id];
        if (metaFileToRemove) {
          this.removeFromRuntime("metaFiles", metaFileToRemove);
          LogBot.log(200, "[DB] MetaFile Deleted: " + metaFile);
        } else {
          LogBot.log(500, "[DB] MetaFile not found: " + metaFile);
        }
      });
  
      DB().on("metaCopyUpdated", (metaCopy) => {
        const metaCopyToUpdate = this.index.metaCopies[metaCopy.id];
        if (metaCopyToUpdate) {
          metaCopyToUpdate.update(metaCopy);
          LogBot.log(200, "[DB] MetaFile " + metaCopy.id + " Update");
        }
      });
      DB().on("metaCopyRemoved", (metaCopy) => {
        const metaCopyToRemove = Object.values(this.index.metaCopies).find((m: any) => m._id === metaCopy);
        if (metaCopyToRemove) {
          this.removeFromRuntime("metaCopies", metaCopyToRemove);
          LogBot.log(200, "[DB] MetaCopy Deleted: " + metaCopy);
        } else {
          LogBot.log(500, "[DB] MetaCopy not found: " + metaCopy);
        }
      });
  
      DB().on("driveUpdated", (drive) => {
        const driveToUpdate = this.index.drives[drive.id];
        if (driveToUpdate) {
          driveToUpdate.update(drive);
          LogBot.log(200, "[DB] MetaFile " + drive.label + " Update");
        }
      });
  
      DB().on("driveRemoved", (drive) => {
        const driveToRemove = this.index.drives[drive.id];
        if (driveToRemove) {
          this.removeFromRuntime("drives", driveToRemove);
          LogBot.log(200, "[DB] Drive Deleted: " + drive);
        } else {
          LogBot.log(500, "[DB] Drive not found: " + drive);
        }
      });
  
      DB().on("libraryUpdated", async (library) => {
        LogBot.log(200, "[DB] Library " + library.name + " Update");
        const lib = this.index.libraries.find((l: any) => l.name === library.name);
        if (lib) {
          if (library.pathToLibrary) lib.pathToLibrary = library.pathToLibrary;
          if (library.folders) lib.folders = library.folders;
          if (library.drops) lib.drops = new MetaLibraryData(library.drops);
        } else {
          await this.loadOneLibrary(library.name);
        }
      });
      DB().on("libraryRemoved", async (library) => {
        const libraryToRemove = this.index.libraries.find((l: any) => l._id === library);
        if (libraryToRemove) {
          await this.unloadOneLibrary(libraryToRemove.name);
  
          LogBot.log(200, "[DB] Library Deleted: " + library);
        } else {
          LogBot.log(500, "[DB] Library not found: " + library);
        }
      });
    }*/
    /*
    API v2
     */
    notify(title, message) {
        this.emit("notification", { title, message });
    }
    get query() {
        return {
            /**
             * sets cursor to users
             */
            users: {
                /**
                 * selects one user
                 */
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
                            //return await AccountManager.updateUser(user, options);
                        },
                    };
                },
                /**
                 * selects multiple users
                 */
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
                        /**
                         * Returns the grabbed libraries
                         * @returns {Promise<MetaLibrary[]>}
                         */
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
                        /**
                         * Returns the grabbed library
                         * @returns {MetaLibrary}
                         */
                        fetch() {
                            lib.query = this;
                            return lib;
                        },
                        put: (options) => __awaiter(this, void 0, void 0, function* () {
                            return yield lib.update(options);
                        }),
                        delete: () => __awaiter(this, void 0, void 0, function* () {
                            return yield this.removeOneLibrary(libraryId);
                        }),
                        scan: () => __awaiter(this, void 0, void 0, function* () {
                            return yield lib.createCopyTaskForNewFiles();
                        }),
                        transactions: {
                            one: (id) => { },
                            many: (filter) => {
                                return {
                                    fetch: () => __awaiter(this, void 0, void 0, function* () {
                                        return this.getManyTransactions(Object.assign(Object.assign({}, filter), { library: lib.name }));
                                    }),
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
                                    delete: () => __awaiter(this, void 0, void 0, function* () {
                                        return lib.removeOneMetaFile(metafile);
                                    }),
                                    thumbnails: {
                                        one: (id) => {
                                            return {
                                                fetch: () => __awaiter(this, void 0, void 0, function* () {
                                                    return metafile.getThumbnail(id);
                                                }),
                                            };
                                        },
                                        all: {
                                            fetch: () => __awaiter(this, void 0, void 0, function* () {
                                                return metafile.getThumbnails();
                                            }),
                                        },
                                        first: {
                                            fetch: () => __awaiter(this, void 0, void 0, function* () {
                                                return metafile.getThumbnails()[0];
                                            }),
                                        },
                                        center: {
                                            fetch: () => __awaiter(this, void 0, void 0, function* () {
                                                const thumbs = metafile.getThumbnails();
                                                if (!(thumbs instanceof Array))
                                                    return thumbs;
                                                return thumbs[Math.floor(thumbs.length / 2)];
                                            }),
                                        },
                                        last: {
                                            fetch: () => __awaiter(this, void 0, void 0, function* () {
                                                const thumbs = metafile.getThumbnails();
                                                if (!(thumbs instanceof Array))
                                                    return thumbs;
                                                return thumbs[thumbs.length - 1];
                                            }),
                                        },
                                        post: {},
                                        put: {},
                                        delete: {},
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
                                                delete: (options = { deleteFile: false }) => __awaiter(this, void 0, void 0, function* () {
                                                    return lib.removeOneMetaCopy(metacopy, options);
                                                }),
                                            };
                                        },
                                        many: (filters = {}) => {
                                            return {
                                                fetch: () => __awaiter(this, void 0, void 0, function* () {
                                                    return lib.getManyMetaCopies(metaFileId);
                                                }),
                                            };
                                        },
                                    },
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
                                        transcode: {
                                            post: (options) => __awaiter(this, void 0, void 0, function* () {
                                                return yield lib.addOneTranscodeTask(files, options);
                                            }),
                                            run: (jobId, callback, cancelToken) => __awaiter(this, void 0, void 0, function* () {
                                                return yield lib.runOneTranscodeTask(jobId, callback, cancelToken);
                                            }),
                                            delete: (jobId) => __awaiter(this, void 0, void 0, function* () {
                                                return lib.removeOneTranscodeTask(jobId);
                                            }),
                                        },
                                    },
                                };
                            },
                        },
                        /*
                        sets cursor to tasks
                         */
                        tasks: {
                            one: (id) => {
                                let task = lib.getOneTask(id);
                                return {
                                    fetch() {
                                        task.query = this;
                                        return task;
                                    },
                                    run: (cb, cancelToken) => __awaiter(this, void 0, void 0, function* () {
                                        return yield lib.runOneTask(id, cb, cancelToken);
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
                                    put: () => __awaiter(this, void 0, void 0, function* () { }),
                                    delete: () => __awaiter(this, void 0, void 0, function* () {
                                        return yield lib.removeManyTasks(filters);
                                    }),
                                };
                            },
                            post: {
                                one: (options) => __awaiter(this, void 0, void 0, function* () {
                                    if (!options.label)
                                        throw new Error("No data provided to create task.");
                                    return yield lib.addOneTask(options);
                                }),
                            },
                        },
                        transcodes: {
                            one: (id) => {
                                let transcode = lib.getOneTranscodeTask(id);
                                return {
                                    fetch() {
                                        transcode.query = this;
                                        return transcode;
                                    },
                                    run: (cb, cancelToken) => __awaiter(this, void 0, void 0, function* () {
                                        return yield lib.runOneTranscodeTask(id, cb, cancelToken);
                                    }),
                                    put: (options) => __awaiter(this, void 0, void 0, function* () {
                                        // return await lib.updateOneTranscodeJob({ id, ...options });
                                    }),
                                    delete: () => __awaiter(this, void 0, void 0, function* () {
                                        return lib.removeOneTranscodeTask(id);
                                    }),
                                };
                            },
                            many: (filters = {}) => {
                                return {
                                    fetch() {
                                        return lib.getManyTranscodeTasks();
                                    },
                                };
                            },
                        },
                        folders: {
                            put: (folderPath, overwriteOptions) => __awaiter(this, void 0, void 0, function* () {
                                return yield lib.updateFolder(folderPath, overwriteOptions);
                            }),
                        },
                    };
                },
                post: {
                    /**
                     * Adds a new library
                     * @param options
                     * @returns {Promise<MetaLibrary>}
                     */
                    one: (options) => __awaiter(this, void 0, void 0, function* () {
                        return yield this.addOneLibrary(options);
                    }),
                },
                /*
                Loads a library into runtime
                 */
                load: (name) => __awaiter(this, void 0, void 0, function* () {
                    return yield this.loadOneLibrary(name);
                }),
                /*
                Unloads a library from runtime
                 */
                unload: (name) => __awaiter(this, void 0, void 0, function* () {
                    return yield this.unloadOneLibrary(name);
                }),
            },
            volumes: {
                one: (id) => {
                    const vol = this.driveBot.drives.find((d) => d.volumeId === id);
                    if (!vol)
                        throw new Error("Volume not found.");
                    return {
                        fetch() {
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
            drives: {
                one: (id) => {
                    let linkedDrive = this.getOneLinkedDrive("id", id);
                    return {
                        fetch() {
                            linkedDrive.query = this;
                            return linkedDrive;
                        },
                        put: (options) => __awaiter(this, void 0, void 0, function* () {
                            return yield this.updateOneDrive(Object.assign(Object.assign({}, options), { id }));
                        }),
                        delete: () => __awaiter(this, void 0, void 0, function* () {
                            return yield this.unlinkOneDrive(linkedDrive);
                        }),
                    };
                },
                many: (filters = { wbType: "all" }) => {
                    return {
                        fetch: () => __awaiter(this, void 0, void 0, function* () {
                            return yield this.getManyLinkedDrives(filters.wbType, false);
                        }),
                    };
                },
                post: {
                    one: (options) => __awaiter(this, void 0, void 0, function* () {
                        return yield this.linkOneDrive(options.volume, options.type);
                    }),
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
                        recursive: false,
                        includeFolders: true,
                        lazy: true,
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
    get drops() {
        //get drops of each metalibrary and return them in one map
        let drops = new Map();
        for (let lib of this.index.libraries) {
            for (let key in lib.drops) {
                drops.set(key, lib.drops[key]);
            }
        }
        return Object.fromEntries(drops);
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
            console.log("applying transaction", transaction.$collection);
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