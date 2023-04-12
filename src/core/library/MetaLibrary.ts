import { WrangleBot } from "../WrangleBot";

import MetaLibraryData from "./MetaLibraryData";
import { CopyBucket } from "./CopyBucket";
import { SearchLite } from "searchlite";
import { MetaFile } from "./MetaFile";
import Task from "../media/Task";
import ExportBot from "../export";

import DB from "../database/DB";

import LogBot from "logbotjs";
import { MetaCopy } from "./MetaCopy";
import { finder } from "../system";
import utility from "../system/utility";
import { CopyDrive } from "./CopyDrive";

import config from "../system/config";
import Scraper from "./Scraper";
import Espresso from "../media/Espresso";
import { TranscodeTask } from "../transcode/TranscodeTask";
import { Indexer } from "../media/Indexer";
import Job from "../media/Job";
import Status from "../media/Status";
import createTaskOptions from "./createTaskOptions";
import Folders from "./Folders";
import MetaLibraryOptions from "./MetaLibraryOptions";
import MetaLibraryUpdateOptions from "./MetaLibraryUpdateOptions";
import CancelToken from "./CancelToken";

interface ReportOptions {
  format: "html" | "json" | "text" | "pdf" | "csv";
  template: object;
  pathToExport?: string;
  reportName?: string;
  logoPath?: string;
  uniqueNames: boolean;
  credits?: object;
}

export default class MetaLibrary {
  wb: WrangleBot;

  name: string = "UNNAMED";

  folders: Folders[] = [];

  /**
   * The metadata of the library, this is info that can be saved and used in the handlebars
   * @type {MetaLibraryData}
   */
  drops = new MetaLibraryData();

  pathToLibrary;

  metaFiles: MetaFile[] = [];
  tasks: Task[] = [];
  transcodes: TranscodeTask[] = [];

  readOnly = false;

  /**
   * The creation date of the library
   * @type {Date}
   */
  creationDate = new Date();

  query;

  constructor(wb, options: MetaLibraryOptions | null) {
    if (!wb) throw new Error("Failed to create library! Reason: Missing WrangleBot Instance");
    this.wb = wb;

    if (options) {
      if (!options.name) throw new Error("new MetaLibrary must have a option .name");
      if (!options.pathToLibrary) throw new Error("new MetaLibrary must have a option .pathToLibrary");

      this.name = options.name;
      this.pathToLibrary = options.pathToLibrary;

      this.drops = new MetaLibraryData(options.drops || null);
      this.folders = options.folders || [];
    }

    return this;
  }

  /**
   * Updates and saves the library
   * @param options {{pathToLibrary?:string, drops?:Map<name,value>, folders?:Folders}}
   * @param save
   * @returns {boolean}
   */
  update(options: MetaLibraryUpdateOptions, save = true) {
    if (options.pathToLibrary) {
      if (!finder.isReachable(options.pathToLibrary) && save && !this.readOnly) {
        throw new Error(options.pathToLibrary + " is not reachable and can not be updated.");
      }
      this.pathToLibrary = options.pathToLibrary;
    }
    if (options.folders) this.folders = options.folders;
    if (options.drops) this.drops = new MetaLibraryData(options.drops);

    if (finder.existsSync(this.pathToLibrary)) {
      this.readOnly = false;
      this.createFoldersOnDiskFromTemplate();
    }

    if (save) return this.save(options);

    this.wb.emit("metalibrary-edit", this);

    return true;
  }

  async updateFolder(folderPath, overwriteOptions) {
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
        if (finder.readdirSync(finder.join(this.pathToLibrary, folderPath)).length > 0) {
          throw new Error(`Folder ${folderPath} is not empty, can not rename`);
        }
        finder.rename(finder.join(this.pathToLibrary, folderPath), overwriteOptions.name);
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

      this.wb.emit("metalibrary-edit", this);

      return true;
    } catch (e) {
      throw e;
    }
  }

  getFolderByPath(folderPath): Folders | null {
    if (!this.folders) return null;

    //remove leading slash and trailing slash
    folderPath = folderPath.replace(/^\/|\/$/g, "");

    let folderPathArray = folderPath.split("/");
    let folder: Folders[] = this.folders;

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

      if (!found) return null;
    }
    return null;
  }

  save(options = {}) {
    return DB().updateOne("libraries", { name: this.name }, options);
  }

  /**
   * REBUILD
   * Takes a library database Structure and assembles all attached elements
   *
   * @param {Object} metaLibraryProto
   * @param readOnly
   * @return {Promise<boolean>}
   */
  async rebuild(metaLibraryProto, readOnly = false) {
    if (!metaLibraryProto) throw new Error("Failed to Rebuild library! Reason: Missing Proto");
    if (!metaLibraryProto.name) throw new Error("Failed to Rebuild library! Reason: Missing Name");
    if (!metaLibraryProto.creationDate) throw new Error("Failed to Rebuild library! Reason: Missing Creation Date");
    if (!metaLibraryProto.folders) throw new Error("Failed to Rebuild library! Reason: Missing Folders");
    if (!metaLibraryProto.pathToLibrary) throw new Error("Failed to Rebuild library! Reason: Missing Path To Library");

    this.readOnly = readOnly;

    try {
      /* GENERAL */

      this.name = metaLibraryProto.name;
      this.folders = metaLibraryProto.folders;
      this.pathToLibrary = metaLibraryProto.pathToLibrary;
      this.drops = new MetaLibraryData(metaLibraryProto.drops);
      this.creationDate = new Date(metaLibraryProto.creationDate);

      /* METAFILES */

      const metaFilesRaw = DB().getMany("metafiles", { library: this.name });
      const allMetaCopiesRaw = DB().getMany("metacopies", { library: this.name });

      for (let metaFileRaw of metaFilesRaw) {
        const thumbnailsRaw = DB().getMany("thumbnails", { metaFile: metaFileRaw.id });
        const newMetaFile = new MetaFile({ ...metaFileRaw, thumbnails: thumbnailsRaw });

        if (metaFileRaw.copies) {
          const metaCopiesRaw = metaFileRaw.copies.map((copy) => {
            const copyRaw = allMetaCopiesRaw.find((c) => c.id === copy);

            if (!copyRaw) throw new Error(`Failed to find copy ${copy.id} for ${newMetaFile.name}`);
            return copyRaw;
          });

          if (metaCopiesRaw.length > 0) {
            for (let metaCopyRaw of metaCopiesRaw) {
              metaCopyRaw.metaFile = newMetaFile;
              const metaCopy = new MetaCopy(metaCopyRaw);
              this.wb.addToRuntime("metaCopies", metaCopy);
              newMetaFile.addCopy(metaCopy);
            }
          }
        }

        this.metaFiles.push(newMetaFile);
        this.wb.addToRuntime("metaFiles", newMetaFile);
      }

      /* REBUILD TASKS */
      const tasks = DB().getMany("tasks", { library: this.name });
      for (let task of tasks) {
        for (let job of task.jobs) {
          if (this.wb.index.metaCopies[job.metaCopy]) {
            job.metaCopy = this.wb.index.metaCopies[job.metaCopy];
          } else {
            task.status = -1;
          }
        }
        const newTask = new Task(task);
        this.tasks.push(newTask);
        this.wb.addToRuntime("copyTasks", newTask);
      }

      /* REBUILD TRANSCODES */
      const transcodes = DB().getMany("transcodes", { library: this.name });

      for (let transcode of transcodes) {
        try {
          for (let job of transcode.jobs) {
            if (job.metaFile) {
              job.metaFile = this.wb.index.metaFiles[job.metaFile];

              if (job.metaCopy) {
                job.metaCopy = this.wb.index.metaCopies[job.metaCopy];
              }
            } else {
              transcode.status = -1;
            }
          }
          const t = new TranscodeTask(null, transcode);
          this.transcodes.push(t);
          this.#addToRuntime("transcodes", t);
        } catch (e: any) {
          LogBot.log(500, "Failed to rebuild transcode. Reason: " + e.message);
        }
      }

      if (!this.readOnly) {
        this.createFoldersOnDiskFromTemplate(this.folders);
      }

      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  /**
   * Iterates over the given folders and creates them on the disk relative to pathToLibrary
   */
  createFoldersOnDiskFromTemplate(folders: Folders[] = this.folders, basePath: string = this.pathToLibrary, jobs: any[] = []): void {
    if (!finder.existsSync(this.pathToLibrary)) {
      finder.mkdirSync(this.pathToLibrary, { recursive: true });
    }

    for (let folder of folders) {
      let folderPath = finder.join(basePath, folder.name);

      if (folder.folders) {
        this.createFoldersOnDiskFromTemplate(folder.folders, folderPath, jobs);
      }

      if (!finder.existsSync(folderPath)) {
        finder.mkdirSync(folderPath, { recursive: true });
      }

      /*if (folder.watch) {
        watch(folderPath, { recursive: false }, (eventType, path) => {
          if (path.includes(".DS_Store")) return;
          this.handleFileChange(eventType, path);
        });
      }*/
    }
  }

  async createCopyTaskForNewFiles() {
    const jobs = await this.scanLibraryForNewFiles();
    if (jobs.length > 0) {
      LogBot.log(100, `Found ${jobs.length} new files to add to the library`);
      const r = await this.addOneTask({
        label: "Delta Detection " + new Date().toLocaleString(),
        jobs,
      });
      if (r) {
        return r;
      }
    }
    return false;
  }

  async scanLibraryForNewFiles(folders: Folders[] = this.folders, basePath: string = this.pathToLibrary, jobs: any[] = []): Promise<Array<Job>> {
    for (let folder of folders.filter((f) => f.watch)) {
      let folderPath = finder.join(basePath, folder.name);

      const r = await Indexer.index(folderPath);

      for (let indexItem of r.items) {
        let metaCopy = this.getMetaCopyByPath(indexItem.pathToFile);
        let f = jobs.find((j: Job) => j.source === indexItem.pathToFile);
        let t = Object.values(this.wb.index.copyTasks).find((t) =>
          t.jobs.find((j) => {
            if (j.destinations === null) return false;

            const inDestinations = j.destinations.find((d) => d === indexItem.pathToFile);

            return j.source === indexItem.pathToFile || inDestinations;
          })
        );
        if (!metaCopy && !f && !t) {
          jobs.push({
            source: indexItem.pathToFile,
          });
        }
      }

      if (folder.folders && folder.folders.length > 0) {
        await this.scanLibraryForNewFiles(folder.folders, folderPath, jobs);
      }
    }
    return jobs;
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

  async handleFileChange(event, path) {
    let basename = finder.basename(path);

    if (event === "update") {
      //check if this a file of an existing job
      for (const task of Object.values(this.wb.index.copyTasks)) {
        for (let job of task.jobs) {
          if (job.destinations === null) continue;

          for (let destination of job.destinations) {
            if (destination === path || job.source === path) return;
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
      const cup = new Espresso();
      const result = await cup.pour(path).analyse({ cancel: false }, (progress) => {});

      const mf = this.findMetaFileByHash(result.hash);
      if (mf) {
        //found new copy of existing metafile
        const mc = new MetaCopy({
          metaFile: mf,
          hash: result.hash,
          pathToSource: path,
          label: "watched",
        });
        await this.addOneMetaCopy(mc, mf);
      } else {
        //create new metafile
        const newMF = new MetaFile({
          hash: result.hash,
          metaData: Scraper.parse(result.metaData),
          basename: basename,
          name: basename.substring(0, basename.lastIndexOf(".")),
          size: result.size,
          fileType: finder.getFileType(basename),
          extension: finder.extname(basename),
        });

        await this.addOneMetaFile(newMF);

        const newMC = new MetaCopy({
          metaFile: newMF,
          hash: result.hash,
          pathToSource: path,
          label: "watched",
        });

        await utility.twiddleThumbs(5); //wait 5 milliseconds to make sure the timestamp is incremented, yes lazy I know; sue me, it works; worthy of a test though if we can reduce to 1ms

        await this.addOneMetaCopy(newMC, newMF);

        LogBot.log(200, `Added new MetaFile ${newMF.name} with hash ${newMF.hash}`);
      }
    } else if (event === "remove") {
      console.log("remove", path);
    }
  }

  log(message, type) {
    LogBot.log(`${this.name}:${type}`, message);
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
      return SearchLite.find(this[list], property, value).result;
    } else {
      return undefined;
    }
  }

  /**
   * Removes an Object from the runtime
   * if it already exists it will be overwritten
   *
   * @param {string} list i.e. copyTasks
   * @param {Object} item the object to remove
   * @return {0|1|-1} 0 if the item was not found, 1 if it was removed, -1 if the list does not exist
   */
  #removeFromRunTime(list, item) {
    try {
      if (this.wb.index[list]) {
        const foundItem = this.wb.index[list][item.id];
        if (foundItem) {
          delete this.wb.index[list][item.id];
          return 1;
        }
      }
      return -1;
    } catch (e) {
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
  #addToRuntime(list, item) {
    if (this.wb.index[list]) {
      const alreadyExists = this.wb.index[list][item.id];
      if (!alreadyExists) {
        this.wb.index[list][item.id] = item;
        return 0;
      } else {
        this.wb.index[list][item.id] = item;
        return 1;
      }
    }
    return -1;
  }

  /* META DATA (LIBRARY) */
  async updateMetaData(col, value) {
    if (this.drops.updateCol(col, value)) {
      const result = await DB().updateOne(
        "libraries",
        { name: this.name },
        {
          drops: this.drops,
        }
      );
      return true;
    }
    return new Error("Could not update metaData for <" + col + "> to <" + value + "> in library <" + this.name + ">");
  }
  async removeMetaData(col) {
    if (this.drops.removeCol(col)) {
      const result = await DB().updateOne(
        "libraries",
        { name: this.name },
        {
          drops: this.drops,
        }
      );
      return true;
    }
    return Error("Could not remove key: <" + col + "> from metaData of library <" + this.name + ">");
  }

  /* METAFILES */

  /**
   * Adds a MetaFile to the database(), as well as the runtime
   *
   * @param metaFile
   * @return {Promise<void>}
   */
  async addOneMetaFile(metaFile) {
    if (this.readOnly) throw new Error("Library is read only");

    await DB().updateOne("metafiles", { id: metaFile.id, library: this.name }, metaFile.toJSON({ db: true }));
    this.metaFiles.push(metaFile);
    this.wb.addToRuntime("metaFiles", metaFile);

    this.wb.emit("metafile-new", metaFile);
  }

  /**
   * Retrieves a MetaFile from its library by hash, can lead to collisions
   *
   * @param hash
   * @return {MetaFile}
   */
  findMetaFileByHash(hash) {
    const search = SearchLite.find(this.metaFiles, "_hash", hash);
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

  getManyMetaFiles(filters: { $ids?: string[] } = {}): MetaFile[] {
    const files = this.metaFiles;

    if (filters.$ids) {
      const filteredFiles: MetaFile[] = [];
      filters.$ids.forEach((id) => {
        const f = files.find((e) => e.id === id);
        if (f) filteredFiles.push(f);
      });
      return filteredFiles;
    }

    if (Object.entries(filters).length > 0) {
      return this.metaFiles.filter((mf) => {
        for (let key in filters) {
          if (mf[key] === filters[key]) return true;
        }
      });
    } else {
      return this.metaFiles;
    }
  }

  removeOneMetaFile(metaFile, save = true) {
    if (this.readOnly && save) throw new Error("Library is read only");

    return this.removeManyMetaFiles([metaFile], save);
  }

  removeManyMetaFiles(metaFiles, save = true) {
    if (this.readOnly && save) throw new Error("Library is read only");

    let listOfIdsToRemove: string[] = [];

    try {
      for (let file of metaFiles) {
        for (let copy of file.copies) {
          this.wb.removeFromRuntime("metaCopies", copy);
        }
        for (let thumbnail of file.thumbnails) {
          finder.rmSync(finder.join(config.getPathToUserData(), "thumbnails", thumbnail.id + ".jpg"));
        }
        listOfIdsToRemove.push(file.id);
        this.wb.removeFromRuntime("metaFiles", file);
      }

      //remove the files from the library
      for (let f of this.metaFiles) {
        if (listOfIdsToRemove.includes(f.id)) {
          if (save) {
            DB().removeOne("metafiles", { id: f.id, library: this.name });
            DB().removeMany("metacopies", { metafile: f.id, library: this.name });
            DB().removeMany("thumbnails", { metafile: f.id, library: this.name });
          }

          this.wb.emit("metafile-removed", f.id);

          this.metaFiles.splice(this.metaFiles.indexOf(f), 1);
        }
      }

      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  /* METACOPIES */

  async addOneMetaCopy(metaCopy, metaFile) {
    if (this.readOnly) throw new Error("Library is read only");

    metaFile.addCopy(metaCopy);
    this.wb.addToRuntime("metaCopies", metaCopy);
    await DB().updateOne(
      "metafiles",
      { id: metaFile.id, library: this.name },
      {
        copies: metaFile.copies.map((c) => c.id),
      }
    );
    await utility.twiddleThumbs(5); //wait 5 seconds to make sure the timestamp is incremented

    this.wb.emit("metacopy-new", metaCopy);

    return DB().updateOne("metacopies", { id: metaCopy.id, library: this.name, metaFile: metaFile.id }, metaCopy.toJSON({ db: true }));
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
    if (this.readOnly && save) throw new Error("Library is read only");

    if (save) {
      const result = DB().removeOne("metacopies", { id: metaCopy.id, library: this.name });
    }

    if (options.deleteFile) {
      try {
        finder.rmSync(metaCopy.pathToBucket.file);
      } catch (e) {
        LogBot.log(404, "Could not delete file <" + metaCopy.pathToBucket.file + ">");
      }
    }
    metaCopy.metaFile.dropCopy(metaCopy);

    if (save) {
      const updateResult = DB().updateOne(
        "metafiles",
        { id: metaCopy.metaFile.id, library: this.name },
        {
          copies: metaCopy.metaFile.copies.map((c) => c.id),
        }
      );
      this.wb.emit("metacopy-remove", metaCopy.id);
    }

    this.#removeFromRunTime("metaCopies", metaCopy);
    return true;
  }

  updateMetaDataOfFile(metafile, key, value) {
    if (metafile) {
      metafile.metaData.updateEntry(key, value);

      const set = { metaData: {} };
      set.metaData[key] = value;

      DB().updateOne("metafiles", { id: metafile.id, library: this.name }, set);

      this.wb.emit("metafile-metadata-edit", {
        id: metafile.id,
        key: key,
        value: value,
      });

      return true;
    }
    throw new Error("File not found");
  }

  /* THUMBNAILS */

  async downloadOneThumbnail(thumb) {
    //if the thumbnail doesn't exist, try to get it from the database and save it to the thumbnail folder
    const thumbnailInDB = await DB().getOne("thumbnails", { id: thumb.id });
    if (thumbnailInDB) {
      finder.mkdirSync(finder.join(config.getPathToUserData(), "thumbnails"));
      const newPath = finder.join(config.getPathToUserData(), "thumbnails", thumb.id + ".jpg");
      let buff = Buffer.from(thumbnailInDB.data, "base64");
      finder.writeFileSync(newPath, buff);
    }
  }

  /* TASKS */

  async generateOneTask(options: createTaskOptions) {
    if (this.readOnly) throw new Error("Library is read only");
    if (!options.settings) throw new Error("No options provided");

    //remove trailing slashes from source and destinations
    options.source = options.source.replace(/\/+$/, "");
    options.destinations = options.destinations.map((d) => d.replace(/\/+$/, ""));

    const index = await Indexer.index(options.source, options.types, options.matchExpression ? new RegExp(options.matchExpression) : null);

    const jobs: { source: string; destinations: string[] | null }[] = [];

    if (index) {
      for (let item of index.items) {
        let destinations: string[] = [];

        //if this index items path is a duplicate of metacopy, skip it if the user doesn't want duplicates
        if (options.settings.ignoreDuplicates) {
          let metacopy = this.getMetaCopyByPath(item.pathToFile);
          if (metacopy) {
            continue;
          }
        }

        if (options.destinations.length > 0) {
          for (let folder of options.destinations) {
            if (options.settings) {
              if (!options.settings.preserveFolderStructure && index.duplicates) {
                throw new Error("Must preserve folder structure when there are duplicates");
              }

              if (options.settings.preserveFolderStructure) {
                let prefixToStrip = options.source;
                let prefix = item.pathToFile.replace(prefixToStrip, "");

                destinations.push(folder + (options.settings.createSubFolder ? "/" + options.label : "") + prefix);
              } else {
                destinations.push(folder + (options.settings.createSubFolder ? "/" + options.label : "") + "/" + item.basename);
              }
            } else {
              destinations.push(folder + "/" + item.basename);
            }
          }
        }

        jobs.push({
          source: item.pathToFile,
          destinations: destinations.length > 0 ? destinations : null,
        });
      }

      if (jobs.length > 0) {
        const task = await this.addOneTask({
          label: options.label,
          jobs: jobs,
        });

        this.wb.emit("copytask-new", task);

        return task;
      } else {
        throw new Error("No files that matched the criteria were found");
      }
    }
    throw new Error("Indexing failed");
  }

  /**
   * Creates CopyTask and adds it to the library
   *
   * @param {{label: string; jobs: {source: string; destinations?: string[]}[]}} options
   * @return {Promise<Task>}
   */
  async addOneTask(options) {
    if (this.readOnly) throw new Error("Library is read only");

    if (!options.label) {
      throw new Error("No label provided");
    }
    if (!options.jobs) {
      throw new Error("No jobs provided");
    }

    //check if task with label already exists
    const search = SearchLite.find(Object.values(this.tasks), "label", options.label);
    if (search.wasFailure()) {
      for (let job of options.jobs) {
        if (!job.source) {
          throw new Error("No source provided");
        }
        if (job.destinations !== null && job.destinations instanceof Array && job.destinations.length === 0) {
          throw new Error("No destinations provided. Arrays must not be empty, use null instead.");
        }

        if (!finder.existsSync(job.source)) {
          throw new Error("Source file does not exist: " + job.source);
        }
        let stats = finder.statSync(job.source);
        if (!stats.isFile()) {
          throw new Error("Source is not a file: " + job.source);
        }
        job.stats = {
          size: stats.size,
        };
      }

      const task = new Task(options);

      this.tasks.push(task);
      await DB().updateOne("tasks", { id: task.id, library: this.name }, task.toJSON({ db: true }));
      this.wb.addToRuntime("copyTasks", task);

      this.wb.emit("copytask-new", task);

      return task;
    } else {
      throw new Error("Task with this label already exists");
    }
  }

  /**
   *
   * @param {string} id
   * @return {Task}
   */
  getOneTask(id) {
    const search = this.tasks.find((task) => task.id === id);
    if (search) return search;
    throw Error("No task found with that key");
  }

  /**
   * Runs all jobs of a task and syncs metafiles and copies as needed
   *
   * @param {string} id the id of the task
   * @param {Function} cb the callback to get progress and speed
   * @param {{cancel:boolean}} cancelToken cancel the operation
   */
  async runOneTask(id, cb, cancelToken: CancelToken) {
    if (this.readOnly) throw new Error("Library is read only");

    const task = this.getOneTask(id);
    if (!task) {
      throw new Error("Task not found");
    }

    const addMetaCopy = async (executedJob, task, metaFile) => {
      if (executedJob.destinations === null) {
        //add metacopy that is in place
        const newMetaCopy = new MetaCopy({
          hash: executedJob.result.hash,
          pathToSource: executedJob.source,
          pathToBucket: executedJob.source,
          label: task.label,
          metaFile: metaFile,
        });
        //push changes to the database
        await this.addOneMetaCopy(newMetaCopy, metaFile);
        await utility.twiddleThumbs(5); //wait 5 milliseconds to make sure the timestamp is incremented
        return;
      }

      for (let destination of executedJob.destinations) {
        //add metacopy to the metafile
        const newMetaCopy = new MetaCopy({
          hash: executedJob.result.hash,
          pathToSource: executedJob.source,
          pathToBucket: destination,
          label: task.label,
          metaFile: metaFile,
        });
        //push changes to the database
        await this.addOneMetaCopy(newMetaCopy, metaFile);
        await utility.twiddleThumbs(5); //wait 5 milliseconds to make sure the timestamp is incremented
      }
    };

    try {
      //iterate over all jobs
      for (let job of task.jobs) {
        if (job.status === Status.DONE) {
          continue;
        }

        let executedJob;

        if (cancelToken.cancel) break; //listen on cancel and exit task before the job is executed

        executedJob = await task.runOneJob(job, cb, cancelToken); //run the job

        if (cancelToken.cancel) break; //listen on cancel and skip after the job is executed

        //search for hash in library
        const foundMetaFile = this.findMetaFileByHash(executedJob.result.hash);
        if (foundMetaFile) {
          //if found, add copy to metafile
          await addMetaCopy(executedJob, task, foundMetaFile);
        } else {
          //create new metafile
          const basename = finder.basename(executedJob.source).toString();
          const newMetaFile = new MetaFile({
            hash: executedJob.result.hash,
            metaData: Scraper.parse(executedJob.result.metaData),
            basename: basename,
            name: basename.substring(0, basename.lastIndexOf(".")),
            size: executedJob.result.size,
            fileType: finder.getFileType(basename),
            extension: finder.extname(basename),
          });

          await this.addOneMetaFile(newMetaFile);
          await utility.twiddleThumbs(5); //wait a few ms to make sure the timestamp is different

          await addMetaCopy(executedJob, task, newMetaFile);
        }
      }

      await DB().updateOne("tasks", { id: task.id, library: this.name }, task.toJSON({ db: true }));

      this.wb.emit("copytask-edit", task);

      return task;
    } catch (e) {
      await DB().updateOne("tasks", { id: task.id, library: this.name }, task.toJSON({ db: true }));

      LogBot.log(500, "Task failed or cancelled");

      this.wb.emit("copytask-edit", task);

      throw e;
    }
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
  async updateOneTask(options: Task) {
    if (this.readOnly) throw new Error("Library is read only");

    const copyTask = this.getOneTask(options.id);
    if (copyTask) {
      copyTask.label = options.label;
      const result = await DB().updateOne("tasks", { id: copyTask.id, library: this.name }, copyTask.toJSON({ db: true }));

      this.wb.emit("copytask-edit", copyTask);

      return true;
    }
    return new Error("No task found with that id.");
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
    if (this.readOnly && save) throw new Error("Library is read only");

    const task = this.getManyTasks().find((t) => t[by] === key);
    if (task) {
      if (save) {
        DB().removeOne("tasks", { id: task.id, library: this.name });

        this.wb.emit("copytask-remove", task);
      }

      this.tasks = this.tasks.filter((t) => t.id !== task.id);
      this.wb.removeFromRuntime("copyTasks", task);

      return true;
    }
  }

  /**
   * Removes all tasks that match the filter
   *
   * @param filters {{any?:any?}}
   * @returns {Promise<Task[]>} the remaining tasks
   */
  removeManyTasks(filters) {
    if (this.readOnly) throw new Error("Library is read only");

    return new Promise(async (resolve) => {
      const tasks = this.getManyTasks();
      for (let task of tasks) {
        for (let key in filters) {
          if (task[key] !== filters[key]) continue;
          this.removeOneTask(filters[key], key);

          await utility.twiddleThumbs(5); //wait a few ms to make sure the timestamp is different
        }
      }
      resolve(tasks);
    }).catch((e) => {
      LogBot.log(500, e);
    });
  }

  getOneTranscodeTask(id) {
    const search = this.transcodes.find((job) => job.id === id);
    if (search) return search;
    throw Error("No job found with that key");
  }

  getManyTranscodeTasks(filters = {}) {
    return this.transcodes;
  }

  async addOneTranscodeTask(files: MetaFile[], options: { pathToExport: string }) {
    if (!options.pathToExport) throw new Error("No path to export set");
    if (!finder.isReachable(options.pathToExport)) throw new Error("Path to export is not reachable");

    const newTask = new TranscodeTask(files, options);
    this.transcodes.push(newTask);
    await DB().updateOne("transcodes", { library: this.name, id: newTask.id }, newTask.toJSON({ db: true }));
    this.wb.addToRuntime("transcodes", newTask);

    this.wb.emit("transcode-new", newTask);

    return newTask;
  }

  removeOneTranscodeTask(id, save = true) {
    if (this.readOnly && save) throw new Error("Library is read only");

    const task = this.getOneTranscodeTask(id);
    if (task && task.status !== 2) {
      this.transcodes = this.transcodes.filter((j) => j.id !== id);

      if (save) {
        DB().removeOne("transcodes", { id: task.id, library: this.name });
        this.wb.emit("transcode-remove", task);
      }

      this.wb.removeFromRuntime("transcodes", task);
      return true;
    }
    throw Error("Job does not exist or is still running.");
  }

  async runOneTranscodeTask(id, cb, cancelToken) {
    const task = this.getOneTranscodeTask(id);
    if (task) {
      try {
        await task.run(this, cb, cancelToken, (job) => {
          //DB().updateOne("transcodes", { id: task.id, library: this.name }, task.toJSON({ db: true }));
        });

        DB().updateOne("transcodes", { id: task.id, library: this.name }, task.toJSON({ db: true }));
        this.wb.emit("transcode-edit", task);

        return true;
      } catch (e) {
        DB().updateOne("transcodes", { id: task.id, library: this.name }, task.toJSON({ db: true }));
        throw e;
      }
    }
  }

  async generateOneReport(metaFiles: MetaFile[], options: ReportOptions): Promise<Boolean> {
    if (metaFiles.length === 0) throw new Error("No files to generate report for.");

    if (options.format === "html") {
      // return await ExportBot.generateHTML(metaFiles, options);
      throw new Error("HTML reports are not supported yet.");
    }

    if (options.format === "pdf") {
      return await ExportBot.exportPDF(metaFiles, {
        paths: [options.pathToExport || this.pathToLibrary + "/_reports"],
        fileName: options.reportName,
        logo: options.logoPath,
        uniqueNames: options.uniqueNames,
        credits: options.credits,
        template: options.template,
      });
    }
    return false;
  }

  /* SAVING */

  /**
   * Returns the flattened version of the library with statistics
   *
   * @return {{metaData: Object, copyTasks: number, buckets: number, name, files: number, creationDate: string}}
   */
  toJSON(options: { db: boolean } = { db: false }) {
    let stats = {
      count: {
        total: this.metaFiles.length,
        video: 0,
        "video-raw": 0,
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
      if (f.copies.length < 2) stats.count.lessThanTwo++;
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
