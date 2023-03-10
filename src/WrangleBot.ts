import { TranscodeBot } from "./transcode";
import LogBot from "logbotjs";
import User from "./accounts/User";
import { Volume } from "./drives/Volume";
import { CopyDrive } from "./library/CopyDrive";
import { Thumbnail } from "./library/Thumbnail";

import MetaLibrary from "./library/MetaLibrary";
import { MetaFile } from "./library/MetaFile";
import { Indexer } from "./media/Indexer";
import Task from "./media/Task";
import { MetaCopy } from "./library/MetaCopy";
import { TranscodeTask } from "./transcode/TranscodeTask";
import utility from "./system/utility";
import api from "./api";

import AccountManager from "./accounts/AccountManager";
import createTaskOptions from "./library/createTaskOptions";
import { MLInterface } from "./analyse/MLInterface";

const EventEmitter = require("events");
const { finder } = require("./system");
const { SearchLite } = require("searchlite");

const DB = require("./database/DB");

const { v4: uuidv4 } = require("uuid");

const { config } = require("./system"); //load here, otherwise the config will be preloaded and the config will be overwritten

const { DriveBot } = require("./drives");

interface ReturnObject {
  status: 200 | 400 | 500 | 404;
  message?: string;
  result?: any;
}

interface WrangleBotOptions {
  token: string;
  key: string;
  database?: string;
  port?: number;
  mlserver?: string;
}

/**
 * WrangleBot Interface
 * @class WrangleBot
 */
class WrangleBot extends EventEmitter {
  static OPEN = "open";
  static CLOSED = "closed";

  pingInterval;
  ping;

  // libraries: Array<MetaLibrary> = [];

  /**
   * @type {DriveBot}
   */
  driveBot = DriveBot;

  accountManager = AccountManager;

  finder = finder;

  /**
   @type {Config} config
   */
  config = config;

  status = WrangleBot.CLOSED;

  /**
   * index
   */
  index: {
    libraries: MetaLibrary[];
    metaFiles: { [key: string]: MetaFile };
    metaCopies: { [key: string]: MetaCopy };
    copyTasks: { [key: string]: Task };
    drives: { [key: string]: CopyDrive };
    transcodes: { [key: string]: TranscodeTask };
  } = {
    libraries: [],
    metaFiles: {},
    metaCopies: {},
    copyTasks: {},
    drives: {},
    transcodes: {},
  };

  constructor() {
    super();
  }

  async open(options: WrangleBotOptions) {
    LogBot.log(100, "Opening WrangleBot");
    this.emit("notification", {
      title: "Opening WrangleBot",
      message: "WrangleBot is starting up",
    });

    if (!config) throw new Error("Config failed to load. Aborting. Delete the config file and restart the bot.");

    if (!options.port) options.port = config.get("port");

    this.pingInterval = this.config.get("pingInterval") || 5000;

    try {
      let db;
      if (options.database) {
        //CLOUD SYNC DB

        db = DB({
          url: options.database,
          token: options.token,
        });
        await DB().rebuildLocalModel();
        await db.connect(options.key);
        if (options.mlserver) {
          MLInterface({
            url: options.mlserver,
            token: options.token,
          });
        }
      } else {
        //LOCAL DB

        db = DB({
          key: options.key,
        });
        await DB().rebuildLocalModel();
      }

      if (db) {
        DB().on("transaction", (transaction) => {
          this.applyTransaction(transaction);
        });

        db.on("notification", (notification) => {
          this.emit("notification", notification);
        });

        //start Account Manager
        await AccountManager.init();

        //start Socket and REST API
        await this.startServer({
          port: options.port || this.config.get("port"),
          key: options.key,
        });

        await this.driveBot.updateDrives();
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
            LogBot.log(100, str);

            const r = await this.loadOneLibrary(libraryName);

            if (r.status !== 200) {
              this.error(new Error("Could not load library: " + r.message));

              this.emit("notification", {
                title: "Library failed to load",
                message: "Library " + libraryName + " was not loaded.",
              });
            } else {
              const str = " (" + i + "/" + total + ") Successfully loaded MetaLibrary " + libraryName;
              this.emit("notification", {
                title: str,
                message: "Library " + libraryName + " loaded",
              });
              LogBot.log(200, str);
            }
          } catch (e: any) {
            this.error(new Error("Could not load library: " + e.message));
          }
          i++;
        }

        for (let drive of DB().getMany("drives", {})) {
          this.addToRuntime("drives", new CopyDrive(drive));
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
      } else {
        this.status = WrangleBot.CLOSED;

        this.emit("notification", {
          title: "Could not connect to database",
          message: "WrangleBot could not connect to the database. Please check your internet connection and try again.",
        });

        this.emit("failedToConnectToCloud", new Error("Could not connect to database"));
        return null;
      }
    } catch (e: any) {
      LogBot.log(500, e.message);
      this.status = WrangleBot.CLOSED;
      this.emit("failedToConnectToCloud", e);

      this.emit("notification", {
        title: "Could not connect to database",
        message: "WrangleBot could not connect to the database. Please check your internet connection and try again.",
      });

      return null;
    }
  }

  async startServer(options: { port: number; key: string }) {
    this.servers = await api.init(this, options.port, options.key);
  }

  /**
   * Shuts down the WrangleBot.
   *
   * @return {Promise<string>}
   */
  async close() {
    this.status = WrangleBot.CLOSED;
    clearInterval(this.ping);
    this.driveBot.watcher.close();

    this.servers.httpServer.close();
    this.servers.socketServer.close();

    return WrangleBot.CLOSED;
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
  async addOneLibrary(options) {
    if (!options.name) throw new Error("No name provided");

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
    if (!allowed) throw new Error("Path is not allowed");

    //check if lib exists in database
    if (this.index.libraries.find((l) => l.name.toLowerCase() === options.name.toLowerCase())) {
      throw new Error("Library with that name already exists");
    }

    if (this.index.libraries.find((l) => path.startsWith(l.pathToLibrary.toLowerCase()))) {
      throw new Error("Library in path already exists");
    }

    const metaLibrary = new MetaLibrary(this, options);

    //add library to runtime
    this.index.libraries.unshift(metaLibrary);

    //write to config file for startup
    this.config.set(
      "libraries",
      this.index.libraries.map((lib) => lib.name)
    );

    //add metaLibrary in database
    await DB().updateOne("libraries", { name: metaLibrary.name }, metaLibrary.toJSON({ db: true }));

    metaLibrary.createFoldersOnDiskFromTemplate();

    return metaLibrary;
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
  private getOneLibrary(name) {
    const lib = this.index.libraries.find((l) => l.name === name);
    if (lib) return lib;
    return DB().getOne("libraries", { name });
  }

  /**
   * Loads a Library from a file and returns a library
   * @param {String} name
   * @return {Promise<ReturnObject>}
   */
  private loadOneLibrary(name: string): Promise<ReturnObject> {
    return new Promise<ReturnObject>((resolve, reject) => {
      if (this.index.libraries.find((l) => l.name === name)) {
        resolve({
          status: 500,
          message: "I can not load a library, that has been loaded already.",
        });
      } else {
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
        } else {
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
  private unloadOneLibrary(name) {
    const search = SearchLite.find(this.index.libraries, "name", name);
    if (search.wasSuccess()) {
      this.index.libraries.splice(search.count, 1);
      this.config.set(
        "libraries",
        this.index.libraries.map((lib) => lib.name)
      );
      return {
        status: 200,
        message: "Library unloaded",
      };
    } else {
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
  getOneLinkedDrive(by: string, value: string): CopyDrive {
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
    let list: any = [];
    let listOfDrives: CopyDrive[] = Object.values(this.index.drives);
    for (let d of listOfDrives) {
      if (d.wbType === asType || asType === "all") {
        if (d.isMounted() && onlyMounted) {
          list.push(d);
        } else if (!onlyMounted) {
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
  async linkOneDrive(volume, wbType) {
    const drives = await this.getManyLinkedDrives();
    const search = drives.find((d) => {
      return (d.volume instanceof Volume && d.volume.label === volume.label) || d.volume === volume;
    });

    if (!search) {
      const newCopyDrive = new CopyDrive(volume, { wbType: wbType });

      const result = await DB().updateOne("drives", { id: newCopyDrive.id, library: this.name }, newCopyDrive.toJSON({ db: true })); //post to database

      if (result.acknowledged && result.upsertedCount > 0) {
        //if success
        this.addToRuntime("drives", newCopyDrive); //add it to the runtime
        return newCopyDrive;
      } else {
        return new Error("Could not add CopyDrive with mountpoint " + volume.mountpoint);
      }
    } else {
      return new Error("Drive with mountpoint " + volume.mountpoint + " already registered");
    }
  }

  /**
   * Unlink a drive from the library
   *
   * @param {CopyDrive | string} driveOrId copydrive or the id
   * @returns {Promise<Error|true>}
   */
  async unlinkOneDrive(driveOrId) {
    if (driveOrId instanceof CopyDrive) {
      const res = await DB().removeOne("drives", { id: driveOrId.id, library: this.name });
      this.removeFromRuntime("drives", driveOrId);
      return true;
    } else {
      const drive = this.index.drives[driveOrId];
      const res = await DB().removeOne("drives", { id: driveOrId, library: this.name });
      this.removeFromRuntime("drives", drive);
      return true;
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
  async generateThumbnails(library, metaFiles, callback = (progress) => {}, finishCallback = (success) => {}) {
    const callbackWrapper = function (p) {
      callback({ ...p, metaFile: currentFile });
    };
    let currentFile = metaFiles[0];

    if (metaFiles.length > 0) {
      for (let file of metaFiles) {
        currentFile = file;
        try {
          await this.generateThumbnail(library, file, null, callbackWrapper);
          finishCallback(file.id);
        } catch (e) {
          console.error(e);
        }
      }
    } else {
      return false;
    }
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
  async generateThumbnail(library, metaFile, metaCopy, callback: Function) {
    if (metaFile.fileType === "photo" || metaFile.fileType === "video") {
      //find the first copy that is has a reachable path
      let reachableMetaCopy;
      if (metaCopy && finder.existsSync(metaCopy.pathToBucket.file)) {
        reachableMetaCopy = metaCopy;
      } else {
        reachableMetaCopy = metaFile.copies.find((copy) => {
          return finder.existsSync(copy.pathToBucket.file);
        });
      }

      if (reachableMetaCopy) {
        const thumbnails = await TranscodeBot.generateThumbnails(reachableMetaCopy.pathToBucket.file, {
          callback,
          metaFile,
        });
        if (thumbnails) {
          LogBot.log(200, "Generated Thumbnails for <" + metaFile.name + ">");

          if (metaFile.thumbnails.length > 0) {
            LogBot.log(200, "Deleting old Thumbnails <" + metaFile.thumbnails.length + "> for <" + metaFile.name + ">");
            let thumbs: Thumbnail[] = Object.values(metaFile.thumbnails);
            for (let thumb of thumbs) {
              metaFile.removeOneThumbnail(thumb.id);
            }
            await DB().removeMany("thumbnails", { metafile: metaFile.id, library });
            await utility.twiddleThumbs(5); //wait 5 seconds to make sure the timestamp is incremented
            LogBot.log(200, "Deleted old Thumbnails now <" + metaFile.thumbnails.length + "> for <" + metaFile.name + ">");
          }

          LogBot.log(200, "Saving Thumbnails <" + thumbnails.length + "> for <" + metaFile.name + ">");

          for (let thumbnail of thumbnails) {
            metaFile.addThumbnail(thumbnail);
          }

          // for (let thumb of metaFile.getThumbnails()) {
          //   await DB().updateOne("thumbnails", { id: thumb.id, metafile: metaFile.id }, await thumb.toJSON({ db: true }), false);
          // }

          const thumbData: any[] = [];

          for (let thumb of metaFile.getThumbnails()) {
            thumbData.push(await thumb.toJSON({ db: true }));
          }

          await DB().insertMany("thumbnails", { metaFile: metaFile.id, library }, thumbData);

          await utility.twiddleThumbs(5); //wait 5 seconds to make sure the timestamp is incremented

          await DB().updateOne(
            "metafiles",
            { id: metaFile.id, library },
            {
              thumbnails: metaFile.getThumbnails().map((t) => t.id),
            }
          );

          LogBot.log(200, "Saved Thumbnails <" + thumbnails.length + "> for <" + metaFile.name + "> in DB");

          return true;
        }
      } else {
        throw new Error("No reachable copy found. make sure a copy is reachable before generating thumbnails");
      }
    }
    throw new Error("Can't generate thumbnails for this file type");
  }

  private getManyTransactions(filter) {
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
  addToRuntime(list, item) {
    if (this.index[list]) {
      const alreadyExists = this.index[list][item.id];
      if (!alreadyExists) {
        this.index[list][item.id] = item;
        return 0;
      } else {
        this.index[list][item.id] = item;
        return 1;
      }
    }
    return -1;
  }

  /* LOGGING & DEBUGGING */

  success(message) {
    return LogBot.log(200, message, true);
  }

  error(message) {
    return LogBot.log(500, message, true);
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
        one: (options: { id: string }): { fetch(); put: (options) => any } => {
          if (!options.id) throw new Error("No id provided");

          const user = AccountManager.getOneUser(options.id);
          if (!user) throw new Error("No user found with that " + options.id);

          return {
            fetch(): User {
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
        many: (filters = {}): { fetch: Function } => {
          return {
            fetch(): User[] {
              return AccountManager.getAllUsers(filters);
            },
          };
        },
        post: async (options) => {
          return AccountManager.addOneUser({
            ...options,
            create: true,
          });
        },
      },
      library: {
        many: (filters = {}) => {
          const libs = this.index.libraries.filter((lib) => {
            for (let key in filters) {
              if (lib[key] !== filters[key]) return false;
            }
            return true;
          });

          return {
            /**
             * Returns the grabbed libraries
             * @returns {Promise<MetaLibrary[]>}
             */
            fetch: async () => {
              return libs;
            },
          };
        },
        one: (libraryId) => {
          const lib = this.index.libraries.find((l) => l.name === libraryId);
          if (!lib) throw new Error("Library is not loaded or does not exist.");

          return {
            /**
             * Returns the grabbed library
             * @returns {MetaLibrary}
             */
            fetch() {
              lib.query = this;
              return lib;
            },
            put: async (options) => {
              return await lib.update(options);
            },
            delete: async () => {
              return await this.removeOneLibrary(libraryId);
            },
            scan: async () => {
              return await lib.createCopyTaskForNewFiles();
            },
            transactions: {
              one: (id) => {},
              many: (filter) => {
                return {
                  fetch: async () => {
                    return this.getManyTransactions({
                      ...filter,
                      library: lib.name,
                    });
                  },
                };
              },
            },
            metafiles: {
              one: (metaFileId) => {
                const metafile = lib.getOneMetaFile(metaFileId);
                if (!metafile) throw new Error("Metafile not found.");

                return {
                  fetch(): MetaFile {
                    metafile.query = this;
                    return metafile;
                  },
                  delete: async () => {
                    return lib.removeOneMetaFile(metafile);
                  },
                  thumbnails: {
                    one: (id) => {
                      return {
                        fetch: async (): Promise<Thumbnail> => {
                          return metafile.getThumbnail(id);
                        },
                      };
                    },
                    all: {
                      fetch: async (): Promise<Thumbnail[]> => {
                        return metafile.getThumbnails();
                      },
                    },
                    first: {
                      fetch: async (): Promise<Thumbnail> => {
                        return metafile.getThumbnails()[0];
                      },
                    },
                    center: {
                      fetch: async (): Promise<Thumbnail> => {
                        const thumbs = metafile.getThumbnails();
                        if (!(thumbs instanceof Array)) return thumbs;

                        return thumbs[Math.floor(thumbs.length / 2)];
                      },
                    },
                    last: {
                      fetch: async (): Promise<Thumbnail> => {
                        const thumbs = metafile.getThumbnails();
                        if (!(thumbs instanceof Array)) return thumbs;

                        return thumbs[thumbs.length - 1];
                      },
                    },
                    post: {},
                    put: {},
                    delete: {},
                  },
                  metacopies: {
                    one: (metaCopyId) => {
                      const metacopy = lib.getOneMetaCopy(metaFileId, metaCopyId);
                      if (!metacopy) throw new Error("Metacopy not found.");
                      return {
                        fetch() {
                          metacopy.query = this;
                          return metacopy;
                        },
                        delete: async (options = { deleteFile: false }) => {
                          return lib.removeOneMetaCopy(metacopy, options);
                        },
                      };
                    },
                    many: (filters = {}) => {
                      return {
                        fetch: async () => {
                          return lib.getManyMetaCopies(metaFileId);
                        },
                      };
                    },
                  },
                  analyse: async (options) => {
                    return await metafile.analyse(options);
                  },
                };
              },
              many: (filters) => {
                const files = lib.getManyMetaFiles(filters);
                return {
                  fetch: (): MetaFile[] => {
                    return files;
                  },
                  export: {
                    report: async (options) => {
                      return await lib.generateOneReport(files, {
                        pathToExport: options.pathToExport ? options.pathToExport : lib.pathToLibrary + "/_Reports",
                        reportName: options.reportName || "Report",
                        logoPath: options.logoPath,
                        uniqueNames: options.uniqueNames,
                        format: options.format,
                        template: options.template,
                        credits: options.credits,
                      });
                    },
                    transcode: {
                      post: async (options): Promise<TranscodeTask> => {
                        return await lib.addOneTranscodeTask(files, options);
                      },
                      run: async (jobId, callback, cancelToken) => {
                        return await lib.runOneTranscodeTask(jobId, callback, cancelToken);
                      },
                      delete: async (jobId) => {
                        return lib.removeOneTranscodeTask(jobId);
                      },
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
                  run: async (cb, cancelToken) => {
                    return await lib.runOneTask(id, cb, cancelToken);
                  },
                  put: async (options) => {
                    return await lib.updateOneTask({ id, ...options });
                  },
                  delete: async () => {
                    return lib.removeOneTask(id);
                  },
                };
              },
              many: (filters = {}) => {
                return {
                  fetch() {
                    return lib.getManyTasks();
                  },
                  put: async () => {}, //TODO
                  delete: async () => {
                    return await lib.removeManyTasks(filters);
                  },
                };
              },
              post: {
                one: async (options: { label: string; jobs: { source: string; destinations?: string[] }[] }) => {
                  if (!options.label) throw new Error("No data provided to create task.");
                  return await lib.addOneTask(options);
                },
                generate: async (options: createTaskOptions) => {
                  return await lib.generateOneTask(options);
                },
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
                  run: async (cb, cancelToken) => {
                    return await lib.runOneTranscodeTask(id, cb, cancelToken);
                  },
                  put: async (options) => {
                    // return await lib.updateOneTranscodeJob({ id, ...options });
                  },
                  delete: async () => {
                    return lib.removeOneTranscodeTask(id);
                  },
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
              put: async (folderPath, overwriteOptions) => {
                return await lib.updateFolder(folderPath, overwriteOptions);
              },
            },
          };
        },
        post: {
          /**
           * Adds a new library
           * @param options
           * @returns {Promise<MetaLibrary>}
           */
          one: async (options): Promise<MetaLibrary> => {
            return await this.addOneLibrary(options);
          },
        },
        /*
        Loads a library into runtime
         */
        load: async (name: string) => {
          return await this.loadOneLibrary(name);
        },
        /*
        Unloads a library from runtime
         */
        unload: async (name: string) => {
          return await this.unloadOneLibrary(name);
        },
      },
      volumes: {
        one: (id) => {
          const vol = this.driveBot.drives.find((d) => d.volumeId === id);
          if (!vol) throw new Error("Volume not found.");
          return {
            fetch() {
              return vol;
            },
            eject: async () => {
              return await this.driveBot.eject(id);
            },
          };
        },
        many: (): { fetch(): Promise<Volume[]> } => {
          let driveWatcher = this.driveBot;
          return {
            async fetch(): Promise<Volume[]> {
              return await driveWatcher.getDrives();
            },
          };
        },
      },
      drives: {
        one: (id) => {
          let linkedDrive = this.getOneLinkedDrive("id", id);

          return {
            fetch(): CopyDrive {
              linkedDrive.query = this;
              return linkedDrive;
            },
            put: async (options) => {
              return await this.updateOneDrive({ ...options, id });
            },
            delete: async (): Promise<Error | boolean> => {
              return await this.unlinkOneDrive(linkedDrive);
            },
          };
        },
        many: (filters: { wbType: "source" | "endpoint" | "generic" | "all" } = { wbType: "all" }) => {
          return {
            fetch: async (): Promise<CopyDrive[]> => {
              return await this.getManyLinkedDrives(filters.wbType, false);
            },
          };
        },
        post: {
          one: async (options: { volume: Volume; type: "source" | "endpoint" | "generic" }) => {
            return await this.linkOneDrive(options.volume, options.type);
          },
        },
      },
      transactions: {
        one: (id) => {},
        many: (filter) => {
          return {
            fetch: async () => {
              return this.getManyTransactions(filter);
            },
          };
        },
      },
    };
  }

  get utility() {
    return {
      index: async (pathToFolder, types) => {
        return await Indexer.index(pathToFolder, types);
      },
      list: (pathToFolder, options : {showHidden: boolean, filters: 'both' | 'files' | 'folders', recursive: boolean, depth: Number}) => {
        if (!pathToFolder) throw new Error("No path provided.");
        if (pathToFolder === "/") throw new Error("Cannot list root directory.");
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
        } else {
          return [];
        }
      },
    };
  }

  get drops() {
    //get drops of each metalibrary and return them in one map
    let drops: Map<string, string> = new Map();
    for (let lib of this.index.libraries) {
      for (let key in lib.drops) {
        drops.set(key, lib.drops[key]);
      }
    }
    return Object.fromEntries(drops);
  }

  async applyTransaction(transaction) {
    try {
      if (transaction.$method === "updateOne") await this.applyTransactionUpdateOne(transaction);
      if (transaction.$method === "insertMany") await this.applyTransactionInsertMany(transaction);
      if (transaction.$method === "removeOne") await this.applyTransactionRemoveOne(transaction);
    } catch (e) {
      console.error(e);
      LogBot.log(500, "Error applying transaction", e);
    }
  }

  async applyTransactionUpdateOne(transaction) {
    LogBot.log(100, "applying transaction: " + transaction.id);

    //LIBRARY ADDED/UPDATED
    if (transaction.$collection === "libraries") {
      let lib = this.index.libraries.find((l) => l.name === transaction.$query.name);
      if (lib) {
        await lib.update(transaction.$set, false);
        LogBot.log(200, `Library ${lib.name} updated.`);
      } else {
        const newMetaLibrary = new MetaLibrary(this, { ...transaction.$set, ...transaction.$query });
        this.addToRuntime("libraries", newMetaLibrary);
        LogBot.log(200, `Library ${newMetaLibrary.name} added.`);
      }
      this.servers.socketServer.inform("database", "libraries", "change");
    }
    //METAFILE ADDED/UPDATED
    if (transaction.$collection === "metafiles") {
      if (!transaction.$query.library) throw new Error("No library provided to update metaFile.");

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
        } else {
          const newMetaFile = new MetaFile({ ...transaction.$set, ...transaction.$query });
          lib.metaFiles.push(newMetaFile);
          this.addToRuntime("metaFiles", newMetaFile);

          this.servers.socketServer.inform("database", "metafiles", "change");

          LogBot.log(200, "MetaFile created");
        }
      } else {
        throw new Error("Library not found.");
      }
    }

    //METACOPY ADDED/UPDATED
    if (transaction.$collection === "metacopies") {
      if (!transaction.$query.library) throw new Error("No library provided to update MetaCopy.");

      let lib = this.index.libraries.find((l) => l.name === transaction.$query.library);
      if (lib) {
        let copy = this.index.metaCopies[transaction.$query.id];
        if (copy) {
          copy.update(transaction.$set, false);
          LogBot.log(200, "MetaCopy updated", copy);

          this.servers.socketServer.inform("database", "metafiles", "change");
        } else {
          //find the file that this copy belongs to
          let file = lib.metaFiles.find((f) => f.id === transaction.$query.metaFile);
          if (!file) {
            LogBot.log(404, "MetaFile for MetaCopy not found");
            return;
          }

          const newMetaCopy = new MetaCopy({ ...transaction.$set, ...transaction.$query });
          file.addCopy(newMetaCopy);
          this.addToRuntime("metaCopies", newMetaCopy);

          this.servers.socketServer.inform("database", "metafiles", "change");
          LogBot.log(200, "MetaCopy created", newMetaCopy);
        }
      } else {
        throw new Error("Library not found.");
      }
    }
    //TASKS ADDED/UPDATED
    if (transaction.$collection === "tasks") {
      if (!transaction.$query.library) throw new Error("No library provided to update Task.");

      let lib = this.index.libraries.find((l) => l.name === transaction.$query.library);
      if (lib) {
        let task = this.index.copyTasks[transaction.$query.id];
        if (task) {
          task.update(transaction.$set, false);

          this.servers.socketServer.inform("database", "tasks", "change");
          LogBot.log(200, "Task updated", task);
        } else {
          const newTask = new Task({ ...transaction.$set, ...transaction.$query });
          lib.tasks.push(newTask);
          this.addToRuntime("copyTasks", newTask);

          this.servers.socketServer.inform("database", "tasks", "change");
          LogBot.log(200, "Task created", newTask);
        }
      } else {
        throw new Error("Library not found.");
      }
    }
    //TRANSCODES ADDED/UPDATED
    if (transaction.$collection === "transcodes") {
      if (!transaction.$query.library) throw new Error("No library provided to update Transcodes.");

      let lib = this.index.libraries.find((l) => l.name === transaction.$query.library);
      if (lib) {
        let transcode = this.index.transcodes[transaction.$query.id];
        if (transcode) {
          transcode.update(transaction.$set);
          this.servers.socketServer.inform("database", "transcodes", "change");
          LogBot.log(200, "Transcode updated", transcode);
        } else {
          const newTranscode = new TranscodeTask(null, { ...transaction.$set, ...transaction.$query });
          lib.transcodes.push(newTranscode);
          this.addToRuntime("transcodes", newTranscode);
          this.servers.socketServer.inform("database", "transcodes", "change");
          LogBot.log(200, "Transcode created", newTranscode);
        }
      } else {
        throw new Error("Library not found.");
      }
    }
  }

  async applyTransactionInsertMany(transaction) {
    if (transaction.$collection === "thumbnails") {
      const metaFile = this.index.metaFiles[transaction.$query.metaFile];
      if (!metaFile) throw new Error("MetaFile not found.");

      for (let thumb of transaction.$set) {
        metaFile.addThumbnail(thumb);
      }
    }
  }

  async applyTransactionRemoveOne(transaction) {
    if (transaction.$collection === "libraries") {
      let lib = this.index.libraries.find((l) => l.name === transaction.$query.name);
      if (lib) {
        this.removeOneLibrary(lib, false);
        this.servers.socketServer.inform("database", "libraries", "change");
        LogBot.log(200, `Library ${lib.name} removed.`);
      }
    } else if (transaction.$collection === "metafiles") {
      if (!transaction.$query.library) throw new Error("No library provided to remove metaFile.");

      let lib = this.index.libraries.find((l) => l.name === transaction.$query.library);
      if (lib) {
        let file = lib.metaFiles.find((f) => f.id === transaction.$query.id);
        if (file) {
          lib.removeOneMetaFile(file, false);
          this.servers.socketServer.inform("database", "metafiles", "change");
          LogBot.log(200, "MetaFile removed", file);
        }
      } else {
        throw new Error("Library not found.");
      }
    } else if (transaction.$collection === "metacopies") {
      if (!transaction.$query.library) throw new Error("No library provided to remove MetaCopy.");

      let lib = this.index.libraries.find((l) => l.name === transaction.$query.library);
      if (lib) {
        let copy = this.index.metaCopies[transaction.$query.id];
        if (copy) {
          lib.removeOneMetaCopy(copy, { deleteFile: false }, false);
          this.servers.socketServer.inform("database", "metafiles", "change");
          LogBot.log(200, "MetaCopy removed", copy);
        }
      } else {
        throw new Error("Library not found.");
      }
    } else if (transaction.$collection === "tasks") {
      if (!transaction.$query.library) throw new Error("No library provided to remove Task.");

      let lib = this.index.libraries.find((l) => l.name === transaction.$query.library);
      if (lib) {
        let task = this.index.copyTasks[transaction.$query.id];
        if (task) {
          lib.removeOneTask(task.id, "id", false);
          this.servers.socketServer.inform("database", "tasks", "change");
          LogBot.log(200, "Task removed", task);
        }
      } else {
        throw new Error("Library not found.");
      }
    } else if (transaction.$collection === "transcodes") {
      if (!transaction.$query.library) throw new Error("No library provided to remove Transcode.");

      let lib = this.index.libraries.find((l) => l.name === transaction.$query.library);
      if (lib) {
        let transcode = this.index.transcodes[transaction.$query.id];
        if (transcode) {
          lib.removeOneTranscodeTask(transcode.id, false);
          this.servers.socketServer.inform("database", "transcodes", "change");
          LogBot.log(200, "Transcode removed", transcode);
        }
      } else {
        throw new Error("Library not found.");
      }
    }
  }
}
const wb = new WrangleBot();

export default wb;
export { WrangleBot };
