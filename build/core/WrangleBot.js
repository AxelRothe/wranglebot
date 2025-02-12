var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import TranscodeBot from "./transcode/index.js";
import LogBot from "logbotjs";
import MetaLibrary from "./library/MetaLibrary.js";
import { MetaFile } from "./library/MetaFile.js";
import { indexer } from "./media/Indexer.js";
import Task from "./media/Task.js";
import { MetaCopy } from "./library/MetaCopy.js";
import { TranscodeTask } from "./transcode/TranscodeTask.js";
import utility from "./system/utility.js";
import api from "../api/index.js";
import AccountManager from "./accounts/AccountManager.js";
import { MLInterface } from "./analyse/MLInterface.js";
import extensions from "../extensions/index.js";
import EventEmitter from "events";
import { config, finder } from "./system/index.js";
import { SearchLite } from "searchlite";
import { driveBot } from "./drives/DriveBot.js";
import { v4 as uuidv4 } from "uuid";
import DB from "./database/DB.js";
class WrangleBot extends EventEmitter {
    constructor() {
        super();
        this.driveBot = driveBot;
        this.accountManager = AccountManager;
        this.finder = finder;
        this.config = config;
        this.status = WrangleBot.CLOSED;
        this.index = {
            libraries: [],
            metaFiles: {},
            metaCopies: {},
            copyTasks: {},
            transcodes: {},
        };
        this.thirdPartyExtensions = [];
    }
    open(options) {
        return __awaiter(this, void 0, void 0, function* () {
            config.build(options.app_data_location);
            LogBot.log(100, "Opening WrangleBot instance ... ");
            this.$emit("notification", {
                title: "Opening WrangleBot",
                message: "WrangleBot is starting up",
            });
            if (!config)
                throw new Error("Config failed to load. Aborting. Delete the config file and restart the bot.");
            if (options.port)
                config.set("port", options.port);
            else
                throw new Error("No port provided");
            this.pingInterval = this.config.get("pingInterval") || 5000;
            try {
                yield this.loadExtensions();
                let db;
                if (options.vault.sync_url && options.vault.token) {
                    LogBot.log(100, "User supplied cloud database credentials. Attempting to connect to cloud database.");
                    if (!options.vault.sync_url)
                        throw new Error("No databaseURL provided");
                    if (!options.vault.token)
                        throw new Error("No token provided");
                    this.db = DB({
                        url: options.vault.sync_url,
                        token: options.vault.token,
                    });
                    yield DB().rebuildLocalModel();
                    yield this.db.connect(options.vault.token);
                    if (options.vault.ai_url) {
                        this.ML = MLInterface({
                            url: options.vault.ai_url,
                            token: options.vault.token,
                        });
                    }
                }
                else if (options.vault.token) {
                    LogBot.log(100, "User supplied local database credentials. Attempting to connect to local database.");
                    this.db = DB({
                        token: options.vault.token,
                    });
                    yield DB().rebuildLocalModel();
                }
                if (this.db) {
                    this.db.on("transaction", (transaction) => {
                        this.applyTransaction(transaction);
                    });
                    this.db.on("notification", (notification) => {
                        this.$emit("notification", notification);
                    });
                    yield AccountManager.init();
                    yield this.startServer({
                        port: options.port,
                        secret: options.secret || this.config.get("jwt-secret"),
                        mailConfig: options.mail || this.config.get("mail"),
                    });
                    yield this.driveBot.updateDrives();
                    this.driveBot.watch();
                    const libraries = this.getAvailableLibraries().map((l) => l.name);
                    let i = 1;
                    let total = libraries.length;
                    for (let libraryName of libraries) {
                        try {
                            const str = " (" + i + "/" + total + ") Attempting to load MetaLibrary " + libraryName;
                            this.$emit("notification", {
                                title: str,
                                message: `Loading library ${libraryName}`,
                            });
                            LogBot.log(100, str);
                            const r = yield this.loadOneLibrary(libraryName);
                            if (r.status !== 200) {
                                this.error(new Error("Could not load library: " + r.message));
                                this.$emit("notification", {
                                    title: "Library failed to load",
                                    message: "Library " + libraryName + " was not loaded.",
                                });
                            }
                            else {
                                const str = " (" + i + "/" + total + ") Successfully loaded MetaLibrary " + libraryName;
                                this.$emit("notification", {
                                    title: str,
                                    message: "Library " + libraryName + " loaded",
                                });
                                LogBot.log(200, str);
                            }
                        }
                        catch (e) {
                            this.error(new Error("Could not load library: " + e.message));
                        }
                        i++;
                    }
                    this.driveBot.on("removed", this.handleVolumeUnmount.bind(this));
                    this.driveBot.on("added", this.handleVolumeMount.bind(this));
                    this.status = WrangleBot.OPEN;
                    LogBot.log(200, "WrangleBot instance opened successfully: http://localhost:" + options.port);
                    this.$emit("notification", {
                        title: "Howdy!",
                        message: "WrangleBot is ready to wrangle",
                    });
                    this.$emit("ready", this);
                    return this;
                }
                else {
                    this.status = WrangleBot.CLOSED;
                    this.$emit("notification", {
                        title: "Could not connect to database",
                        message: "WrangleBot could not connect to the database.",
                    });
                    this.$emit("error", new Error("Could not connect to database"));
                    return null;
                }
            }
            catch (e) {
                LogBot.log(500, e.message);
                this.status = WrangleBot.CLOSED;
                this.$emit("error", e);
                this.$emit("notification", {
                    title: "Could not connect to database",
                    message: "WrangleBot could not connect to the database.",
                });
                return null;
            }
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            this.status = WrangleBot.CLOSED;
            clearInterval(this.ping);
            this.driveBot.stopWatching();
            this.servers.httpServer.close();
            this.servers.socketServer.close();
            return WrangleBot.CLOSED;
        });
    }
    startServer(options) {
        return __awaiter(this, void 0, void 0, function* () {
            this.servers = yield api.init(this, options);
        });
    }
    $emit(event, ...args) {
        return new Promise((resolve, reject) => {
            this.runCustomScript(event, ...args)
                .then(() => {
                super.emit(event, ...args);
                resolve(true);
            })
                .catch((err) => {
                LogBot.log(500, err);
                resolve(false);
            });
        });
    }
    runCustomScript(event, ...args) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let extension of extensions) {
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
            try {
                LogBot.log(100, "Loading extensions ... ");
                const pathToPlugins = finder.getPathToUserData("custom/");
                const thirdPartyPluginsRAW = finder.getContentOfFolder(pathToPlugins);
                LogBot.log(100, "Found " + thirdPartyPluginsRAW.length + " third party plugins.");
                if (thirdPartyPluginsRAW.length > 0) {
                    for (let folderName of thirdPartyPluginsRAW) {
                        LogBot.log(100, "Loading plugin " + folderName + " ... ");
                        const pathToPlugin = finder.getPathToUserData("custom/" + folderName);
                        const folderContents = finder.getContentOfFolder(pathToPlugin);
                        for (let pluginFolder of folderContents) {
                            if (pluginFolder === "hooks") {
                                const pathToPluginHooks = finder.getPathToUserData("custom/" + folderName + "/" + pluginFolder);
                                const hookFolderContent = finder.getContentOfFolder(pathToPluginHooks);
                                for (let scriptFileName of hookFolderContent) {
                                    LogBot.log(100, "Loading hook " + scriptFileName + " ... ");
                                    const script = (yield import(pathToPluginHooks + "/" + scriptFileName)).default;
                                    if (!script.name || script.name === "") {
                                        LogBot.log(404, "Plugin " + folderName + " does not have a valid name. Skipping ... ");
                                        continue;
                                    }
                                    if (!script.description || script.description === "") {
                                        LogBot.log(404, "Plugin " + folderName + " does not have a valid description. Skipping ... ");
                                        continue;
                                    }
                                    if (!script.version || script.version.match(/^[0-9]+\.[0-9]+\.[0-9]+$/) === null) {
                                        LogBot.log(404, "Plugin " + folderName + " does not have a valid version (/^[0-9]+\\.[0-9]+\\.[0-9]+$/). Skipping ... ");
                                        continue;
                                    }
                                    if (!script.handler || !(script.handler instanceof Function)) {
                                        LogBot.log(404, "Plugin " + folderName + " does not have a valid handler. Skipping ... ");
                                        continue;
                                    }
                                    if (!script.events || script.events.length === 0) {
                                        LogBot.log(404, "Plugin " + folderName + " does not have any events. Skipping ... ");
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
                LogBot.log(500, e.message);
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
            if (options.pathToLibrary) {
                if (!finder.isReachable(options.pathToLibrary)) {
                    throw new Error(options.pathToLibrary + " is not a valid path.");
                }
            }
            const allowedPaths = [
                "/volumes/",
                "/users/",
                "/media/",
                "/home/",
            ];
            const path = options.pathToLibrary.toLowerCase();
            if (!finder.existsSync(path)) {
                finder.mkdirSync(path, { recursive: true });
            }
            const allowed = allowedPaths.some((p) => path.startsWith(p));
            if (!allowed)
                throw new Error("Path is not allowed");
            if (this.index.libraries.find((l) => l.name.toLowerCase() === options.name.toLowerCase())) {
                throw new Error("Library with that name already exists");
            }
            if (this.index.libraries.find((l) => path.startsWith(l.pathToLibrary.toLowerCase()))) {
                throw new Error("Library in path already exists");
            }
            const metaLibrary = new MetaLibrary(this, options);
            this.index.libraries.unshift(metaLibrary);
            yield DB().updateOne("libraries", { name: metaLibrary.name }, metaLibrary.toJSON({ db: true }));
            metaLibrary.createFoldersOnDiskFromTemplate();
            this.$emit("metalibrary-new", metaLibrary);
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
        this.$emit("metalibrary-remove", name);
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
                    const newMetaLibrary = new MetaLibrary(this, null);
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
    generateThumbnails(library_1, metaFiles_1) {
        return __awaiter(this, arguments, void 0, function* (library, metaFiles, callback = (progress) => { }, finishCallback = (success) => { }) {
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
                        LogBot.log(500, "Error while generating thumbnail for file " + file.id + ": " + e.message);
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
    generateThumbnail(library, metaFile, metaCopy, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            if (metaFile.fileType === "photo" || metaFile.fileType === "video") {
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
                    const thumbnails = yield TranscodeBot.generateThumbnails(reachableMetaCopy.pathToBucket.file, {
                        callback,
                        metaFile,
                    });
                    if (thumbnails) {
                        LogBot.log(200, "Generated Thumbnails for <" + metaFile.name + ">");
                        if (metaFile.thumbnails.length > 0) {
                            LogBot.log(200, "Deleting old Thumbnails <" + metaFile.thumbnails.length + "> for <" + metaFile.name + ">");
                            let thumbs = Object.values(metaFile.thumbnails);
                            for (let thumb of thumbs) {
                                metaFile.removeOneThumbnail(thumb.id);
                            }
                            yield DB().removeMany("thumbnails", { metafile: metaFile.id, library });
                            yield utility.twiddleThumbs(5);
                            LogBot.log(200, "Deleted old Thumbnails now <" + metaFile.thumbnails.length + "> for <" + metaFile.name + ">");
                        }
                        LogBot.log(200, "Saving Thumbnails <" + thumbnails.length + "> for <" + metaFile.name + ">");
                        for (let thumbnail of thumbnails) {
                            metaFile.addThumbnail(thumbnail);
                        }
                        const thumbData = [];
                        for (let thumb of metaFile.getThumbnails()) {
                            thumbData.push(thumb.toJSON());
                        }
                        yield DB().insertMany("thumbnails", { metaFile: metaFile.id, library }, thumbData);
                        yield utility.twiddleThumbs(5);
                        yield DB().updateOne("metafiles", { id: metaFile.id, library }, {
                            thumbnails: metaFile.getThumbnails().map((t) => t.id),
                        });
                        this.$emit("thumbnail-new", metaFile.getThumbnails());
                        this.$emit("metafile-edit", metaFile);
                        LogBot.log(200, "Saved Thumbnails <" + thumbnails.length + "> for <" + metaFile.name + "> in DB");
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
    error(message) {
        return LogBot.log(500, message, true);
    }
    notify(title, message) {
        this.$emit("notification", { title, message });
    }
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
                                        const t = this.getManyTransactions({
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
                                        post: (options) => __awaiter(this, void 0, void 0, function* () {
                                            return yield lib.addOneMetaCopy(options, metafile);
                                        }),
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
                            post: (metafile) => __awaiter(this, void 0, void 0, function* () {
                                return yield lib.addOneMetaFile(metafile);
                            }),
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
                    const user = AccountManager.getOneUser(options.id);
                    if (!user)
                        throw new Error("No user found with that " + options.id);
                    return {
                        fetch() {
                            user.query = this;
                            return user;
                        },
                        put: (options) => {
                            return AccountManager.updateUser(user, options);
                        },
                        allow: (libraryName) => {
                            return AccountManager.allowAccess(user, libraryName);
                        },
                        revoke: (libraryName) => {
                            return AccountManager.revokeAccess(user, libraryName);
                        },
                        reset: () => {
                            return AccountManager.resetPassword(user);
                        },
                    };
                },
                many: (filters = {}) => {
                    return {
                        fetch() {
                            return AccountManager.getAllUsers(filters);
                        },
                    };
                },
                post: (options) => __awaiter(this, void 0, void 0, function* () {
                    return AccountManager.addOneUser(Object.assign(Object.assign({}, options), { create: true }));
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
                return yield indexer.index(pathToFolder, types);
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
                LogBot.log(500, "Error applying transaction", e);
            }
        });
    }
    applyTransactionUpdateOne(transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            LogBot.log(100, "applying transaction: " + transaction.id);
            if (transaction.$collection === "libraries") {
                let lib = this.index.libraries.find((l) => l.name === transaction.$query.name);
                if (lib) {
                    yield lib.update(transaction.$set, false);
                    LogBot.log(200, `Library ${lib.name} updated.`);
                }
                else {
                    const newMetaLibrary = new MetaLibrary(this, Object.assign(Object.assign({}, transaction.$set), transaction.$query));
                    this.addToRuntime("libraries", newMetaLibrary);
                    LogBot.log(200, `Library ${newMetaLibrary.name} added.`);
                }
                this.servers.socketServer.inform("database", "libraries", "change");
            }
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
                            LogBot.log(200, "MetaFile updated");
                            this.servers.socketServer.inform("database", "metafiles", "change");
                        })
                            .catch((e) => {
                            console.error(e);
                            LogBot.log(500, "Error updating metaFile", e);
                        });
                    }
                    else {
                        const newMetaFile = new MetaFile(Object.assign(Object.assign({}, transaction.$set), transaction.$query));
                        lib.metaFiles.push(newMetaFile);
                        this.addToRuntime("metaFiles", newMetaFile);
                        this.servers.socketServer.inform("database", "metafiles", "change");
                        LogBot.log(200, "MetaFile created");
                    }
                }
                else {
                    throw new Error("Library not found.");
                }
            }
            if (transaction.$collection === "metacopies") {
                if (!transaction.$query.library)
                    throw new Error("No library provided to update MetaCopy.");
                let lib = this.index.libraries.find((l) => l.name === transaction.$query.library);
                if (lib) {
                    let copy = this.index.metaCopies[transaction.$query.id];
                    if (copy) {
                        copy.update(transaction.$set, false);
                        LogBot.log(200, "MetaCopy updated", copy);
                        this.servers.socketServer.inform("database", "metafiles", "change");
                    }
                    else {
                        let file = lib.metaFiles.find((f) => f.id === transaction.$query.metaFile);
                        if (!file) {
                            LogBot.log(404, "MetaFile for MetaCopy not found");
                            return;
                        }
                        const newMetaCopy = new MetaCopy(Object.assign(Object.assign({}, transaction.$set), transaction.$query));
                        file.addCopy(newMetaCopy);
                        this.addToRuntime("metaCopies", newMetaCopy);
                        this.servers.socketServer.inform("database", "metafiles", "change");
                        LogBot.log(200, "MetaCopy created", newMetaCopy);
                    }
                }
                else {
                    throw new Error("Library not found.");
                }
            }
            if (transaction.$collection === "tasks") {
                if (!transaction.$query.library)
                    throw new Error("No library provided to update Task.");
                let lib = this.index.libraries.find((l) => l.name === transaction.$query.library);
                if (lib) {
                    let task = this.index.copyTasks[transaction.$query.id];
                    if (task) {
                        task.update(transaction.$set, false);
                        this.servers.socketServer.inform("database", "tasks", "change");
                        LogBot.log(200, "Task updated", task);
                    }
                    else {
                        const newTask = new Task(Object.assign(Object.assign({}, transaction.$set), transaction.$query));
                        lib.tasks.push(newTask);
                        this.addToRuntime("copyTasks", newTask);
                        this.servers.socketServer.inform("database", "tasks", "change");
                        LogBot.log(200, "Task created", newTask);
                    }
                }
                else {
                    throw new Error("Library not found.");
                }
            }
            if (transaction.$collection === "transcodes") {
                if (!transaction.$query.library)
                    throw new Error("No library provided to update Transcodes.");
                let lib = this.index.libraries.find((l) => l.name === transaction.$query.library);
                if (lib) {
                    let transcode = this.index.transcodes[transaction.$query.id];
                    if (transcode) {
                        transcode.update(transaction.$set);
                        this.servers.socketServer.inform("database", "transcodes", "change");
                        LogBot.log(200, "Transcode updated", transcode);
                    }
                    else {
                        const newTranscode = new TranscodeTask(null, Object.assign(Object.assign({}, transaction.$set), transaction.$query));
                        lib.transcodes.push(newTranscode);
                        this.addToRuntime("transcodes", newTranscode);
                        this.servers.socketServer.inform("database", "transcodes", "change");
                        LogBot.log(200, "Transcode created", newTranscode);
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
                    LogBot.log(200, `Library ${lib.name} removed.`);
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
                        LogBot.log(200, "MetaFile removed", file);
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
                        LogBot.log(200, "MetaCopy removed", copy);
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
                        LogBot.log(200, "Task removed", task);
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
                        LogBot.log(200, "Transcode removed", transcode);
                    }
                }
                else {
                    throw new Error("Library not found.");
                }
            }
        });
    }
}
WrangleBot.OPEN = "open";
WrangleBot.CLOSED = "closed";
const wb = new WrangleBot();
export default wb;
export { WrangleBot, config };
//# sourceMappingURL=WrangleBot.js.map