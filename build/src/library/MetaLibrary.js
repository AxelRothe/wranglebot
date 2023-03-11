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
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _MetaLibrary_instances, _MetaLibrary_removeFromRunTime, _MetaLibrary_addToRuntime;
Object.defineProperty(exports, "__esModule", { value: true });
const MetaLibraryData_1 = __importDefault(require("./MetaLibraryData"));
const searchlite_1 = require("searchlite");
const MetaFile_1 = require("./MetaFile");
const Task_1 = __importDefault(require("../media/Task"));
const export_1 = __importDefault(require("../export"));
const DB_1 = __importDefault(require("../database/DB"));
const logbotjs_1 = __importDefault(require("logbotjs"));
const MetaCopy_1 = require("./MetaCopy");
const system_1 = require("../system");
const utility_1 = __importDefault(require("../system/utility"));
const config_1 = __importDefault(require("../system/config"));
const Scraper_1 = __importDefault(require("./Scraper"));
const Espresso_1 = __importDefault(require("../media/Espresso"));
const TranscodeTask_1 = require("../transcode/TranscodeTask");
const Indexer_1 = require("../media/Indexer");
const Status_1 = __importDefault(require("../media/Status"));
class MetaLibrary {
    constructor(wb, options) {
        _MetaLibrary_instances.add(this);
        this.name = "UNNAMED";
        this.folders = [];
        /**
         * The metadata of the library, this is info that can be saved and used in the handlebars
         * @type {MetaLibraryData}
         */
        this.drops = new MetaLibraryData_1.default();
        this.metaFiles = [];
        this.tasks = [];
        this.transcodes = [];
        this.readOnly = false;
        /**
         * The creation date of the library
         * @type {Date}
         */
        this.creationDate = new Date();
        if (!wb)
            throw new Error("Failed to create library! Reason: Missing WrangleBot Instance");
        this.wb = wb;
        if (options) {
            if (!options.name)
                throw new Error("new MetaLibrary must have a option .name");
            if (!options.pathToLibrary)
                throw new Error("new MetaLibrary must have a option .pathToLibrary");
            this.name = options.name;
            this.pathToLibrary = options.pathToLibrary;
            this.drops = new MetaLibraryData_1.default(options.drops || null);
            this.folders = options.folders || [];
        }
        return this;
    }
    /**
     * Updates and saves the library
     * @param options {{pathToLibrary?:string, drops?:Map<name,value>, folders?:Folders}}
     * @param save
     * @returns {Promise<boolean>|boolean}
     */
    update(options, save = true) {
        return __awaiter(this, void 0, void 0, function* () {
            if (options.pathToLibrary) {
                if (!system_1.finder.isReachable(options.pathToLibrary) && save && !this.readOnly) {
                    throw new Error(options.pathToLibrary + " is not reachable and can not be updated.");
                }
                this.pathToLibrary = options.pathToLibrary;
            }
            if (options.folders)
                this.folders = options.folders;
            if (options.drops)
                this.drops = new MetaLibraryData_1.default(options.drops);
            if (system_1.finder.existsSync(this.pathToLibrary)) {
                this.readOnly = false;
                this.createFoldersOnDiskFromTemplate();
            }
            if (save)
                return this.save(options);
            return true;
        });
    }
    updateFolder(folderPath, overwriteOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            let folder = this.getFolderByPath(folderPath);
            try {
                if (!folder) {
                    throw new Error(`Folder ${folderPath} not found`);
                }
                if (Object.keys(overwriteOptions).length === 0) {
                    throw new Error(`No options to update folder ${folderPath}`);
                }
                if (overwriteOptions.name && overwriteOptions.name !== folder.name) {
                    //check if folder is empty
                    if (system_1.finder.readdirSync(system_1.finder.join(this.pathToLibrary, folderPath)).length > 0) {
                        throw new Error(`Folder ${folderPath} is not empty, can not rename`);
                    }
                    system_1.finder.rename(system_1.finder.join(this.pathToLibrary, folderPath), overwriteOptions.name);
                    folder.name = overwriteOptions.name;
                }
                if (overwriteOptions.watch !== undefined) {
                    folder.watch = overwriteOptions.watch;
                }
                if (overwriteOptions.folders) {
                    folder.folders = overwriteOptions.folders;
                    this.createFoldersOnDiskFromTemplate();
                }
                this.save({
                    folders: this.folders,
                });
                return true;
            }
            catch (e) {
                logbotjs_1.default.log(400, e);
                return false;
            }
        });
    }
    getFolderByPath(folderPath) {
        if (!this.folders)
            return null;
        //remove leading slash and trailing slash
        folderPath = folderPath.replace(/^\/|\/$/g, "");
        let folderPathArray = folderPath.split("/");
        let folder = this.folders;
        for (let i = 0; i < folderPathArray.length; i++) {
            let folderName = folderPathArray[i];
            let found = false;
            for (let j = 0; j < folder.length; j++) {
                if (folder[j].name === folderName) {
                    found = true;
                    if (i === folderPathArray.length - 1) {
                        return folder[j];
                    }
                    folder = folder[j].folders;
                    break;
                }
            }
            if (!found)
                return null;
        }
        return null;
    }
    save(options = {}) {
        return (0, DB_1.default)().updateOne("libraries", { name: this.name }, options);
    }
    /**
     * REBUILD
     * Takes a library database Structure and assembles all attached elements
     *
     * @param {Object} metaLibraryProto
     * @param readOnly
     * @return {Promise<boolean>}
     */
    rebuild(metaLibraryProto, readOnly = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!metaLibraryProto)
                throw new Error("Failed to Rebuild library! Reason: Missing Proto");
            if (!metaLibraryProto.name)
                throw new Error("Failed to Rebuild library! Reason: Missing Name");
            if (!metaLibraryProto.creationDate)
                throw new Error("Failed to Rebuild library! Reason: Missing Creation Date");
            if (!metaLibraryProto.folders)
                throw new Error("Failed to Rebuild library! Reason: Missing Folders");
            if (!metaLibraryProto.pathToLibrary)
                throw new Error("Failed to Rebuild library! Reason: Missing Path To Library");
            this.readOnly = readOnly;
            try {
                /* GENERAL */
                this.name = metaLibraryProto.name;
                this.folders = metaLibraryProto.folders;
                this.pathToLibrary = metaLibraryProto.pathToLibrary;
                this.drops = new MetaLibraryData_1.default(metaLibraryProto.drops);
                this.creationDate = new Date(metaLibraryProto.creationDate);
                /* METAFILES */
                const metaFilesRaw = (0, DB_1.default)().getMany("metafiles", { library: this.name });
                const allMetaCopiesRaw = (0, DB_1.default)().getMany("metacopies", { library: this.name });
                for (let metaFileRaw of metaFilesRaw) {
                    const thumbnailsRaw = (0, DB_1.default)().getMany("thumbnails", { metaFile: metaFileRaw.id });
                    const newMetaFile = new MetaFile_1.MetaFile(Object.assign(Object.assign({}, metaFileRaw), { thumbnails: thumbnailsRaw }));
                    if (metaFileRaw.copies) {
                        const metaCopiesRaw = metaFileRaw.copies.map((copy) => {
                            const copyRaw = allMetaCopiesRaw.find((c) => c.id === copy);
                            if (!copyRaw)
                                throw new Error(`Failed to find copy ${copy.id} for ${newMetaFile.name}`);
                            return copyRaw;
                        });
                        if (metaCopiesRaw.length > 0) {
                            for (let metaCopyRaw of metaCopiesRaw) {
                                metaCopyRaw.metaFile = newMetaFile;
                                const metaCopy = new MetaCopy_1.MetaCopy(metaCopyRaw);
                                this.wb.addToRuntime("metaCopies", metaCopy);
                                newMetaFile.addCopy(metaCopy);
                            }
                        }
                    }
                    this.metaFiles.push(newMetaFile);
                    this.wb.addToRuntime("metaFiles", newMetaFile);
                }
                /* REBUILD TASKS */
                const tasks = (0, DB_1.default)().getMany("tasks", { library: this.name });
                for (let task of tasks) {
                    for (let job of task.jobs) {
                        if (this.wb.index.metaCopies[job.metaCopy]) {
                            job.metaCopy = this.wb.index.metaCopies[job.metaCopy];
                        }
                        else {
                            task.status = -1;
                        }
                    }
                    const newTask = new Task_1.default(task);
                    this.tasks.push(newTask);
                    this.wb.addToRuntime("copyTasks", newTask);
                }
                /* REBUILD TRANSCODES */
                const transcodes = (0, DB_1.default)().getMany("transcodes", { library: this.name });
                for (let transcode of transcodes) {
                    try {
                        for (let job of transcode.jobs) {
                            if (job.metaFile) {
                                job.metaFile = this.wb.index.metaFiles[job.metaFile];
                                if (job.metaCopy) {
                                    job.metaCopy = this.wb.index.metaCopies[job.metaCopy];
                                }
                            }
                            else {
                                transcode.status = -1;
                            }
                        }
                        const t = new TranscodeTask_1.TranscodeTask(null, transcode);
                        this.transcodes.push(t);
                        __classPrivateFieldGet(this, _MetaLibrary_instances, "m", _MetaLibrary_addToRuntime).call(this, "transcodes", t);
                    }
                    catch (e) {
                        logbotjs_1.default.log(500, "Failed to rebuild transcode. Reason: " + e.message);
                    }
                }
                if (!this.readOnly) {
                    this.createFoldersOnDiskFromTemplate(this.folders);
                }
                return true;
            }
            catch (e) {
                console.error(e);
                return false;
            }
        });
    }
    /**
     * Iterates over the given folders and creates them on the disk relative to pathToLibrary
     */
    createFoldersOnDiskFromTemplate(folders = this.folders, basePath = this.pathToLibrary, jobs = []) {
        if (!system_1.finder.existsSync(this.pathToLibrary)) {
            system_1.finder.mkdirSync(this.pathToLibrary, { recursive: true });
        }
        for (let folder of folders) {
            let folderPath = system_1.finder.join(basePath, folder.name);
            if (folder.folders) {
                this.createFoldersOnDiskFromTemplate(folder.folders, folderPath, jobs);
            }
            if (!system_1.finder.existsSync(folderPath)) {
                system_1.finder.mkdirSync(folderPath, { recursive: true });
            }
            /*if (folder.watch) {
              watch(folderPath, { recursive: false }, (eventType, path) => {
                if (path.includes(".DS_Store")) return;
                this.handleFileChange(eventType, path);
              });
            }*/
        }
    }
    createCopyTaskForNewFiles() {
        return __awaiter(this, void 0, void 0, function* () {
            const jobs = yield this.scanLibraryForNewFiles();
            if (jobs.length > 0) {
                logbotjs_1.default.log(100, `Found ${jobs.length} new files to add to the library`);
                const r = yield this.addOneTask({
                    label: "Delta Detection " + new Date().toLocaleString(),
                    jobs,
                });
                if (r) {
                    return r;
                }
            }
            return false;
        });
    }
    scanLibraryForNewFiles(folders = this.folders, basePath = this.pathToLibrary, jobs = []) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let folder of folders.filter((f) => f.watch)) {
                let folderPath = system_1.finder.join(basePath, folder.name);
                const r = yield Indexer_1.Indexer.index(folderPath);
                for (let indexItem of r.items) {
                    let metaCopy = this.getMetaCopyByPath(indexItem.pathToFile);
                    let f = jobs.find((j) => j.source === indexItem.pathToFile);
                    let t = Object.values(this.wb.index.copyTasks).find((t) => t.jobs.find((j) => {
                        const inDestinations = j.destinations.find((d) => d === indexItem.pathToFile);
                        return j.source === indexItem.pathToFile || inDestinations;
                    }));
                    if (!metaCopy && !f && !t) {
                        jobs.push({
                            source: indexItem.pathToFile,
                        });
                    }
                }
                if (folder.folders && folder.folders.length > 0) {
                    yield this.scanLibraryForNewFiles(folder.folders, folderPath, jobs);
                }
            }
            return jobs;
        });
    }
    getMetaCopyByPath(path) {
        for (let file of this.metaFiles) {
            for (let copy of file.copies) {
                if (copy.pathToBucket.file.toLowerCase() === path.toLowerCase() || copy.pathToSource.toLowerCase() === path.toLowerCase()) {
                    return copy;
                }
            }
        }
        return false;
    }
    handleFileChange(event, path) {
        return __awaiter(this, void 0, void 0, function* () {
            let basename = system_1.finder.basename(path);
            if (event === "update") {
                //check if this a file of an existing job
                for (const task of Object.values(this.wb.index.copyTasks)) {
                    for (let job of task.jobs) {
                        for (let destination of job.destinations) {
                            if (destination === path || job.source === path)
                                return;
                        }
                    }
                }
                //check if this is a file of an existing metaCopy
                for (const metaCopy of Object.values(this.wb.index.metaCopies)) {
                    if (metaCopy.pathToBucket.file === path) {
                        return; //ignore this file change
                    }
                }
                //check if new or moved file
                const cup = new Espresso_1.default();
                const result = yield cup.pour(path).analyse({ cancel: false }, (progress) => {
                });
                const mf = this.findMetaFileByHash(result.hash);
                if (mf) {
                    //found new copy of existing metafile
                    const mc = new MetaCopy_1.MetaCopy({
                        metaFile: mf,
                        hash: result.hash,
                        pathToSource: path,
                        label: "watched",
                    });
                    yield this.addOneMetaCopy(mc, mf);
                }
                else {
                    //create new metafile
                    const newMF = new MetaFile_1.MetaFile({
                        hash: result.hash,
                        metaData: Scraper_1.default.parse(result.metaData),
                        basename: basename,
                        name: basename.substring(0, basename.lastIndexOf(".")),
                        size: result.size,
                        fileType: system_1.finder.getFileType(basename),
                        extension: system_1.finder.extname(basename),
                    });
                    yield this.addOneMetaFile(newMF);
                    const newMC = new MetaCopy_1.MetaCopy({
                        metaFile: newMF,
                        hash: result.hash,
                        pathToSource: path,
                        label: "watched",
                    });
                    yield utility_1.default.twiddleThumbs(5); //wait 5 milliseconds to make sure the timestamp is incremented, yes lazy I know; sue me, it works; worthy of a test though if we can reduce to 1ms
                    yield this.addOneMetaCopy(newMC, newMF);
                    logbotjs_1.default.log(200, `Added new MetaFile ${newMF.name} with hash ${newMF.hash}`);
                }
            }
            else if (event === "remove") {
                console.log("remove", path);
            }
        });
    }
    log(message, type) {
        logbotjs_1.default.log(`${this.name}:${type}`, message);
    }
    /**
     *
     * @param {string} list
     * @param {string} value
     * @param {"_id"|"id"|"label"|string} property
     * @return {CopyBucket|CopyDrive|MetaFile|MetaCopy}
     */
    get(list, value = "", property = "id") {
        if (this[list]) {
            return searchlite_1.SearchLite.find(this[list], property, value).result;
        }
        else {
            return undefined;
        }
    }
    /* META DATA (LIBRARY) */
    updateMetaData(col, value) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.drops.updateCol(col, value)) {
                const result = yield (0, DB_1.default)().updateOne("libraries", { name: this.name }, {
                    drops: this.drops,
                });
                return true;
            }
            return new Error("Could not update metaData for <" + col + "> to <" + value + "> in library <" + this.name + ">");
        });
    }
    removeMetaData(col) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.drops.removeCol(col)) {
                const result = yield (0, DB_1.default)().updateOne("libraries", { name: this.name }, {
                    drops: this.drops,
                });
                return true;
            }
            return Error("Could not remove key: <" + col + "> from metaData of library <" + this.name + ">");
        });
    }
    /* METAFILES */
    /**
     * Adds a MetaFile to the database(), as well as the runtime
     *
     * @param metaFile
     * @return {Promise<void>}
     */
    addOneMetaFile(metaFile) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.readOnly)
                throw new Error("Library is read only");
            yield (0, DB_1.default)().updateOne("metafiles", { id: metaFile.id, library: this.name }, metaFile.toJSON({ db: true }));
            this.metaFiles.push(metaFile);
            this.wb.addToRuntime("metaFiles", metaFile);
        });
    }
    /**
     * Retrieves a MetaFile from its library by hash, can lead to collisions
     *
     * @param hash
     * @return {MetaFile}
     */
    findMetaFileByHash(hash) {
        const search = searchlite_1.SearchLite.find(this.metaFiles, "_hash", hash);
        if (search.wasSuccess()) {
            return search.result;
        }
        return null;
    }
    /**
     * Retrieves a MetaFile from its library from its id
     *
     * @param {string} metaFileId
     * @return {MetaFile}
     */
    getOneMetaFile(metaFileId) {
        return this.metaFiles.find((e) => e.id === metaFileId);
    }
    getManyMetaFiles(filters = {}) {
        const files = this.metaFiles;
        if (filters.$ids) {
            const filteredFiles = [];
            filters.$ids.forEach((id) => {
                const f = files.find((e) => e.id === id);
                if (f)
                    filteredFiles.push(f);
            });
            return filteredFiles;
        }
        if (Object.entries(filters).length > 0) {
            return this.metaFiles.filter((mf) => {
                for (let key in filters) {
                    if (mf[key] === filters[key])
                        return true;
                }
            });
        }
        else {
            return this.metaFiles;
        }
    }
    removeOneMetaFile(metaFile, save = true) {
        if (this.readOnly && save)
            throw new Error("Library is read only");
        return this.removeManyMetaFiles([metaFile], save);
    }
    removeManyMetaFiles(metaFiles, save = true) {
        if (this.readOnly && save)
            throw new Error("Library is read only");
        let listOfIdsToRemove = [];
        try {
            for (let file of metaFiles) {
                for (let copy of file.copies) {
                    this.wb.removeFromRuntime("metaCopies", copy);
                }
                for (let thumbnail of file.thumbnails) {
                    system_1.finder.rmSync(system_1.finder.join(config_1.default.getPathToUserData(), "thumbnails", thumbnail.id + ".jpg"));
                }
                listOfIdsToRemove.push(file.id);
                this.wb.removeFromRuntime("metaFiles", file);
            }
            //remove the files from the library
            for (let f of this.metaFiles) {
                if (listOfIdsToRemove.includes(f.id)) {
                    if (save) {
                        (0, DB_1.default)().removeOne("metafiles", { id: f.id, library: this.name });
                        (0, DB_1.default)().removeMany("metacopies", { metafile: f.id, library: this.name });
                        (0, DB_1.default)().removeMany("thumbnails", { metafile: f.id, library: this.name });
                    }
                    this.metaFiles.splice(this.metaFiles.indexOf(f), 1);
                }
            }
            return true;
        }
        catch (e) {
            console.error(e);
            return false;
        }
    }
    /* METACOPIES */
    addOneMetaCopy(metaCopy, metaFile) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.readOnly)
                throw new Error("Library is read only");
            metaFile.addCopy(metaCopy);
            this.wb.addToRuntime("metaCopies", metaCopy);
            yield (0, DB_1.default)().updateOne("metafiles", { id: metaFile.id, library: this.name }, {
                copies: metaFile.copies.map((c) => c.id),
            });
            yield utility_1.default.twiddleThumbs(5); //wait 5 seconds to make sure the timestamp is incremented
            return (0, DB_1.default)().updateOne("metacopies", { id: metaCopy.id, library: this.name, metaFile: metaFile.id }, metaCopy.toJSON({ db: true }));
        });
    }
    getOneMetaCopy(metaFileId, metaCopyId) {
        const metaFile = this.getOneMetaFile(metaFileId);
        if (metaFile) {
            return metaFile.getMetaCopy(metaCopyId);
        }
        return null;
    }
    getManyMetaCopies(metaFileID) {
        const metaFile = this.getOneMetaFile(metaFileID);
        if (metaFile) {
            return metaFile.copies;
        }
        return [];
    }
    removeOneMetaCopy(metaCopy, options = { deleteFile: false }, save = true) {
        if (this.readOnly && save)
            throw new Error("Library is read only");
        if (save) {
            const result = (0, DB_1.default)().removeOne("metacopies", { id: metaCopy.id, library: this.name });
        }
        if (options.deleteFile) {
            try {
                system_1.finder.rmSync(metaCopy.pathToBucket.file);
            }
            catch (e) {
                logbotjs_1.default.log(404, "Could not delete file <" + metaCopy.pathToBucket.file + ">");
            }
        }
        metaCopy.metaFile.dropCopy(metaCopy);
        if (save) {
            const updateResult = (0, DB_1.default)().updateOne("metafiles", { id: metaCopy.metaFile.id, library: this.name }, {
                copies: metaCopy.metaFile.copies.map((c) => c.id),
            });
        }
        __classPrivateFieldGet(this, _MetaLibrary_instances, "m", _MetaLibrary_removeFromRunTime).call(this, "metaCopies", metaCopy);
        return true;
    }
    updateMetaDataOfFile(fileId, key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            const file = this.getOneMetaFile(fileId);
            if (file) {
                file.metaData.updateEntry(key, value);
                const set = { metaData: {} };
                set.metaData[key] = value;
                const result = yield (0, DB_1.default)().updateOne("metafiles", { id: file.id, library: this.name }, set);
                return true;
            }
            return new Error("File not found");
        });
    }
    /* THUMBNAILS */
    downloadOneThumbnail(thumb) {
        return __awaiter(this, void 0, void 0, function* () {
            //if the thumbnail doesn't exist, try to get it from the database and save it to the thumbnail folder
            const thumbnailInDB = yield (0, DB_1.default)().getOne("thumbnails", { id: thumb.id });
            if (thumbnailInDB) {
                system_1.finder.mkdirSync(system_1.finder.join(config_1.default.getPathToUserData(), "thumbnails"));
                const newPath = system_1.finder.join(config_1.default.getPathToUserData(), "thumbnails", thumb.id + ".jpg");
                let buff = Buffer.from(thumbnailInDB.data, "base64");
                system_1.finder.writeFileSync(newPath, buff);
            }
        });
    }
    /* TASKS */
    generateOneTask(options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.readOnly)
                throw new Error("Library is read only");
            if (!options.settings)
                throw new Error("No options provided");
            //remove trailing slashes from source and destinations
            options.source = options.source.replace(/\/+$/, "");
            options.destinations = options.destinations.map((d) => d.replace(/\/+$/, ""));
            const index = yield Indexer_1.Indexer.index(options.source, options.types, options.matchExpression ? new RegExp(options.matchExpression) : null);
            const jobs = [];
            if (index) {
                for (let item of index.items) {
                    let destinations = [];
                    //if this index items path is a duplicate of metacopy, skip it if the user doesn't want duplicates
                    if (options.settings.ignoreDuplicates) {
                        let metacopy = this.getMetaCopyByPath(item.pathToFile);
                        if (metacopy) {
                            continue;
                        }
                    }
                    for (let folder of options.destinations) {
                        if (options.settings) {
                            if (!options.settings.preserveFolderStructure && index.duplicates) {
                                throw new Error("Must preserve folder structure when there are duplicates");
                            }
                            if (options.settings.preserveFolderStructure) {
                                let prefixToStrip = options.source;
                                let prefix = item.pathToFile.replace(prefixToStrip, "");
                                destinations.push(folder + (options.settings.createSubFolder ? "/" + options.label : "") + prefix);
                            }
                            else {
                                destinations.push(folder + (options.settings.createSubFolder ? "/" + options.label : "") + "/" + item.basename);
                            }
                        }
                        else {
                            destinations.push(folder + "/" + item.basename);
                        }
                    }
                    jobs.push({
                        source: item.pathToFile,
                        destinations: destinations,
                    });
                }
                if (jobs.length > 0) {
                    return yield this.addOneTask({
                        label: options.label,
                        jobs: jobs,
                    });
                }
                else {
                    throw new Error("No files that matched the criteria were found");
                }
            }
            throw new Error("Indexing failed");
        });
    }
    /**
     * Creates CopyTask and adds it to the library
     *
     * @param {{label: string; jobs: {source: string; destinations?: string[]}[]}} options
     * @return {Promise<Task>}
     */
    addOneTask(options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.readOnly)
                throw new Error("Library is read only");
            if (!options.label) {
                throw new Error("No label provided");
            }
            if (!options.jobs) {
                throw new Error("No jobs provided");
            }
            //check if destination is within the pathToLibrary
            for (let job of options.jobs) {
                if ((!job.destinations || job.destinations.length === 0) && !job.source.startsWith(this.pathToLibrary)) {
                    throw new Error("Ingest in Place ERROR '" +
                        job.source +
                        "' is outside of the library! Move the file and try again or add a destination starting with '" +
                        this.pathToLibrary +
                        "' to copy the file to the library.");
                }
            }
            //check if task with label already exists
            const search = searchlite_1.SearchLite.find(Object.values(this.tasks), "label", options.label);
            if (search.wasFailure()) {
                for (let job of options.jobs) {
                    if (!system_1.finder.existsSync(job.source)) {
                        throw new Error("Source file does not exist: " + job.source);
                    }
                    let stats = system_1.finder.statSync(job.source);
                    if (!stats.isFile()) {
                        throw new Error("Source is not a file: " + job.source);
                    }
                    job.stats = {
                        size: stats.size,
                    };
                }
                const task = new Task_1.default(options);
                this.tasks.push(task);
                yield (0, DB_1.default)().updateOne("tasks", { id: task.id, library: this.name }, task.toJSON({ db: true }));
                this.wb.addToRuntime("copyTasks", task);
                return task;
            }
            else {
                throw new Error("Task with this label already exists");
            }
        });
    }
    /**
     *
     * @param {string} id
     * @return {Task}
     */
    getOneTask(id) {
        const search = this.tasks.find((task) => task.id === id);
        if (search)
            return search;
        throw Error("No task found with that key");
    }
    /**
     * Runs all jobs of a task and syncs metafiles and copies as needed
     *
     * @param {string} id the id of the task
     * @param {Function} cb the callback to get progress and speed
     * @param {{cancel:boolean}} cancelToken cancel the operation
     */
    runOneTask(id, cb, cancelToken = { cancel: false }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.readOnly)
                throw new Error("Library is read only");
            const task = this.getOneTask(id);
            if (!task) {
                throw new Error("Task not found");
            }
            try {
                //iterate over all jobs
                for (let job of task.jobs) {
                    if (job.status === Status_1.default.DONE) {
                        continue;
                    }
                    let executedJob;
                    if (cancelToken.cancel)
                        break; //listen on cancel and exit task before the job is executed
                    executedJob = yield task.runOneJob(job, cb, cancelToken); //run the job
                    if (cancelToken.cancel)
                        break; //listen on cancel and skip after the job is executed
                    //search for hash in library
                    const foundMetaFile = this.findMetaFileByHash(executedJob.result.hash);
                    if (foundMetaFile) {
                        //if found, add copy to metafile
                        for (let destination of executedJob.destinations) {
                            //add metacopy to the metafile
                            const newMetaCopy = new MetaCopy_1.MetaCopy({
                                hash: executedJob.result.hash,
                                pathToSource: executedJob.source,
                                pathToBucket: destination,
                                label: task.label,
                                metaFile: foundMetaFile,
                            });
                            //push changes to the database
                            yield this.addOneMetaCopy(newMetaCopy, foundMetaFile);
                            yield utility_1.default.twiddleThumbs(5); //wait 5 milliseconds to make sure the timestamp is incremented
                        }
                    }
                    else {
                        //create new metafile
                        const basename = system_1.finder.basename(executedJob.source).toString();
                        const newMetaFile = new MetaFile_1.MetaFile({
                            hash: executedJob.result.hash,
                            metaData: Scraper_1.default.parse(executedJob.result.metaData),
                            basename: basename,
                            name: basename.substring(0, basename.lastIndexOf(".")),
                            size: executedJob.result.size,
                            fileType: system_1.finder.getFileType(basename),
                            extension: system_1.finder.extname(basename),
                        });
                        yield this.addOneMetaFile(newMetaFile);
                        yield utility_1.default.twiddleThumbs(5); //wait a few ms to make sure the timestamp is different
                        //add copies to the metafile
                        for (let destination of executedJob.destinations) {
                            //add metaCopy
                            const newMetaCopy = new MetaCopy_1.MetaCopy({
                                hash: executedJob.result.hash,
                                pathToSource: executedJob.source,
                                pathToBucket: destination,
                                label: task.label,
                                metaFile: newMetaFile,
                                thumbnails: executedJob.result.thumbnails,
                            });
                            yield this.addOneMetaCopy(newMetaCopy, newMetaFile);
                            yield utility_1.default.twiddleThumbs(5); //wait 5 milliseconds to make sure the timestamp is incremented
                            //executedJob.result.metaCopies.push(newMetaCopy);
                        }
                    }
                }
                yield (0, DB_1.default)().updateOne("tasks", { id: task.id, library: this.name }, task.toJSON({ db: true }));
                return task;
            }
            catch (e) {
                yield (0, DB_1.default)().updateOne("tasks", { id: task.id, library: this.name }, task.toJSON({ db: true }));
                logbotjs_1.default.log(500, "Task failed or cancelled");
                throw e;
            }
        });
    }
    /**
     * Returns all tasks of the library
     * @returns {Task[]}
     */
    getManyTasks() {
        return this.tasks;
    }
    /**
     * Updates or Upserts a Task
     *
     * @param options {{label:string, jobs: {source:string, destination?:string}}} options
     * @returns {Promise<Error|boolean>}
     */
    updateOneTask(options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.readOnly)
                throw new Error("Library is read only");
            const copyTask = this.getOneTask(options.id);
            if (copyTask) {
                copyTask.label = options.label;
                const result = yield (0, DB_1.default)().updateOne("tasks", { id: copyTask.id, library: this.name }, copyTask.toJSON({ db: true }));
                return true;
            }
            return new Error("No task found with that id.");
        });
    }
    /**
     * Remove a Task from the library, it will attempt t remove it from the database() first. If it succeeds it will splice it from the runtime array
     *
     * @param {string} key
     * @param {'id'|'_id'|'label'} by
     * @param save
     * @return {Promise<{deletedCount:number}>}
     */
    removeOneTask(key, by = "id", save = true) {
        if (this.readOnly && save)
            throw new Error("Library is read only");
        const task = this.getManyTasks().find((t) => t[by] === key);
        if (task) {
            if (save) {
                (0, DB_1.default)().removeOne("tasks", { id: task.id, library: this.name });
            }
            this.tasks = this.tasks.filter((t) => t.id !== task.id);
            this.wb.removeFromRuntime("copyTasks", task);
        }
    }
    /**
     * Removes all tasks that match the filter
     *
     * @param filters {{any?:any?}}
     * @returns {Promise<Task[]>} the remaining tasks
     */
    removeManyTasks(filters) {
        if (this.readOnly)
            throw new Error("Library is read only");
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            const tasks = this.getManyTasks();
            for (let task of tasks) {
                for (let key in filters) {
                    if (task[key] !== filters[key])
                        continue;
                    yield this.removeOneTask(filters[key], key);
                    yield utility_1.default.twiddleThumbs(5); //wait a few ms to make sure the timestamp is different
                }
            }
            resolve(tasks);
        })).catch((e) => {
            logbotjs_1.default.log(500, e);
        });
    }
    getOneTranscodeTask(id) {
        const search = this.transcodes.find((job) => job.id === id);
        if (search)
            return search;
        throw Error("No job found with that key");
    }
    getManyTranscodeTasks(filters = {}) {
        return this.transcodes;
    }
    addOneTranscodeTask(files, options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!options.pathToExport)
                throw new Error("No path to export set");
            if (!system_1.finder.isReachable(options.pathToExport))
                throw new Error("Path to export is not reachable");
            const newTask = new TranscodeTask_1.TranscodeTask(files, options);
            this.transcodes.push(newTask);
            yield (0, DB_1.default)().updateOne("transcodes", { library: this.name, id: newTask.id }, newTask.toJSON({ db: true }));
            this.wb.addToRuntime("transcodes", newTask);
            return newTask;
        });
    }
    removeOneTranscodeTask(id, save = true) {
        if (this.readOnly && save)
            throw new Error("Library is read only");
        const task = this.getOneTranscodeTask(id);
        if (task && task.status !== 2) {
            this.transcodes = this.transcodes.filter((j) => j.id !== id);
            if (save)
                (0, DB_1.default)().removeOne("transcodes", { id: task.id, library: this.name });
            this.wb.removeFromRuntime("transcodes", task);
        }
        else {
            throw Error("Job does not exist or is still running.");
        }
    }
    runOneTranscodeTask(id, cb, cancelToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const task = this.getOneTranscodeTask(id);
            if (task) {
                try {
                    yield task.run(this, cb, cancelToken, (job) => {
                        (0, DB_1.default)().updateOne("transcodes", { id: task.id, library: this.name }, task.toJSON({ db: true }));
                    });
                    (0, DB_1.default)().updateOne("transcodes", { id: task.id, library: this.name }, task.toJSON({ db: true }));
                }
                catch (e) {
                    throw e;
                }
            }
        });
    }
    generateOneReport(metaFiles, options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (metaFiles.length === 0)
                throw new Error("No files to generate report for.");
            if (options.format === "html") {
                // return await ExportBot.generateHTML(metaFiles, options);
            }
            else if (options.format === "pdf") {
                return yield export_1.default.exportPDF(metaFiles, {
                    paths: [options.pathToExport || this.pathToLibrary + "/_reports"],
                    fileName: options.reportName,
                    logo: options.logoPath,
                    uniqueNames: options.uniqueNames,
                    credits: options.credits,
                    template: options.template,
                });
            }
        });
    }
    /* SAVING */
    /**
     * Returns the flattened version of the library with statistics
     *
     * @return {{metaData: Object, copyTasks: number, buckets: number, name, files: number, creationDate: string}}
     */
    toJSON(options = { db: false }) {
        let stats = {
            count: {
                total: this.metaFiles.length,
                video: 0,
                audio: 0,
                photo: 0,
                sidecar: 0,
                lessThanTwo: 0,
            },
            size: 0,
        };
        for (let f of this.metaFiles) {
            stats.size += f.size;
            stats.count[f.fileType]++;
            if (f.copies.length < 2)
                stats.count.lessThanTwo++;
        }
        return {
            creationDate: this.creationDate.toString(),
            name: this.name,
            pathToLibrary: this.pathToLibrary,
            drops: this.drops.getCols(),
            stats: !options.db ? stats : undefined,
            files: this.metaFiles.map((f) => f.id),
            tasks: this.tasks.map((t) => t.id),
            folders: this.folders,
            readOnly: this.readOnly,
        };
    }
}
exports.default = MetaLibrary;
_MetaLibrary_instances = new WeakSet(), _MetaLibrary_removeFromRunTime = function _MetaLibrary_removeFromRunTime(list, item) {
    try {
        if (this.wb.index[list]) {
            const foundItem = this.wb.index[list][item.id];
            if (foundItem) {
                delete this.wb.index[list][item.id];
                return 1;
            }
        }
        return -1;
    }
    catch (e) {
        console.error(e);
    }
}, _MetaLibrary_addToRuntime = function _MetaLibrary_addToRuntime(list, item) {
    if (this.wb.index[list]) {
        const alreadyExists = this.wb.index[list][item.id];
        if (!alreadyExists) {
            this.wb.index[list][item.id] = item;
            return 0;
        }
        else {
            this.wb.index[list][item.id] = item;
            return 1;
        }
    }
    return -1;
};
//# sourceMappingURL=MetaLibrary.js.map