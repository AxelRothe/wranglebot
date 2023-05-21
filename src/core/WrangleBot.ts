import TranscodeBot from "./transcode/index.js";
import LogBot from "logbotjs";
import User from "./accounts/User.js";
import { Volume } from "./drives/Volume.js";
import { Thumbnail } from "./library/Thumbnail.js";

import MetaLibrary from "./library/MetaLibrary.js";
import { MetaFile } from "./library/MetaFile.js";
import { indexer } from "./media/Indexer.js";
import Task from "./media/Task.js";
import { MetaCopy } from "./library/MetaCopy.js";
import { TranscodeTask } from "./transcode/TranscodeTask.js";
import utility from "./system/utility.js";
import api from "../api/index.js";

import AccountManager from "./accounts/AccountManager.js";
import createTaskOptions from "./library/createTaskOptions.js";
import { MLInterface } from "./analyse/MLInterface.js";
import analyseMetaFileOptions from "./library/analyseMetaFileOptions.js";

import extensions from "../extensions/index.js";
import Extension from "./Extension.js";
import MetaLibraryOptions from "./library/MetaLibraryOptions.js";
import MetaLibraryUpdateOptions from "./library/MetaLibraryUpdateOptions.js";
import FolderOptions from "./library/FolderOptions.js";
import Transaction from "./database/Transaction.js";
import CancelToken from "./library/CancelToken.js";
import WrangleBotOptions from "./WrangleBotOptions.js";
import EventEmitter from "events";

import { config, finder } from "./system/index.js";
import { SearchLite } from "searchlite";
//load here, otherwise the config will be preloaded and the config will be overwritten
import { driveBot, DriveBot } from "./drives/DriveBot.js";

import { v4 as uuidv4 } from "uuid";
import DB from "./database/DB.js";

interface ReturnObject {
  status: 200 | 400 | 500 | 404;
  message?: string;
  result?: any;
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
  driveBot: DriveBot = driveBot;

  accountManager = AccountManager;

  finder = finder;

  ML;

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
    transcodes: { [key: string]: TranscodeTask };
  } = {
    libraries: [],
    metaFiles: {},
    metaCopies: {},
    copyTasks: {},
    transcodes: {},
  };

  private thirdPartyExtensions: Extension[] = [];
  private servers: any;

  constructor() {
    super();
  }

  async open(options: WrangleBotOptions) {
    LogBot.log(100, "Opening WrangleBot instance ... ");
    this.$emit("notification", {
      title: "Opening WrangleBot",
      message: "WrangleBot is starting up",
    });

    if (!config) throw new Error("Config failed to load. Aborting. Delete the config file and restart the bot.");

    if (!options.port) options.port = config.get("port");

    this.pingInterval = this.config.get("pingInterval") || 5000;

    try {
      await this.loadExtensions();

      let db;
      if (options.vault.sync_url && options.vault.token) {
        //CLOUD SYNC DB
        LogBot.log(100, "User supplied cloud database credentials. Attempting to connect to cloud database.");

        if (!options.vault.sync_url) throw new Error("No databaseURL provided");
        if (!options.vault.token) throw new Error("No token provided");

        //init db interface
        db = DB({
          url: options.vault.sync_url,
          token: options.vault.token,
        });
        //rebuild local model
        await DB().rebuildLocalModel();
        //connect to db websocket
        await db.connect(options.vault.token);

        if (options.vault.ai_url) {
          //init machine learning interface
          this.ML = MLInterface({
            url: options.vault.ai_url,
            token: options.vault.token,
          });
        }
      } else if (options.vault.key) {
        //LOCAL DB
        LogBot.log(100, "User supplied local database credentials. Attempting to connect to local database.");

        //init db interface for local use
        db = DB({
          token: options.vault.key,
        });
        //rebuild local model
        await DB().rebuildLocalModel();
      }

      if (db) {
        DB().on("transaction", (transaction) => {
          this.applyTransaction(transaction);
        });

        db.on("notification", (notification) => {
          this.$emit("notification", notification);
        });

        //start Account Manager
        await AccountManager.init();

        //start Socket and REST API
        await this.startServer({
          port: options.port || this.config.get("port"),
          secret: options.secret || this.config.get("jwt-secret"),
          mailConfig: options.mail || this.config.get("mail"),
        });

        await this.driveBot.updateDrives();
        this.driveBot.watch(); //start drive watching

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

            const r = await this.loadOneLibrary(libraryName);

            if (r.status !== 200) {
              this.error(new Error("Could not load library: " + r.message));

              this.$emit("notification", {
                title: "Library failed to load",
                message: "Library " + libraryName + " was not loaded.",
              });
            } else {
              const str = " (" + i + "/" + total + ") Successfully loaded MetaLibrary " + libraryName;
              this.$emit("notification", {
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

        this.driveBot.on("removed", this.handleVolumeUnmount.bind(this));
        this.driveBot.on("added", this.handleVolumeMount.bind(this));

        this.status = WrangleBot.OPEN;

        this.$emit("notification", {
          title: "Howdy!",
          message: "WrangleBot is ready to wrangle",
        });

        this.$emit("ready", this);

        return this;
      } else {
        this.status = WrangleBot.CLOSED;

        this.$emit("notification", {
          title: "Could not connect to database",
          message: "WrangleBot could not connect to the database. Please check your internet connection and try again.",
        });

        this.$emit("error", new Error("Could not connect to database"));
        return null;
      }
    } catch (e: any) {
      LogBot.log(500, e.message);
      this.status = WrangleBot.CLOSED;
      this.$emit("error", e);

      this.$emit("notification", {
        title: "Could not connect to database",
        message: "WrangleBot could not connect to the database. Please check your internet connection and try again.",
      });

      return null;
    }
  }

  async close() {
    this.status = WrangleBot.CLOSED;
    clearInterval(this.ping);

    this.driveBot.stopWatching();

    this.servers.httpServer.close();
    this.servers.socketServer.close();

    return WrangleBot.CLOSED;
  }

  private async startServer(options: { port: number; mailConfig: Object; secret: string }) {
    this.servers = await api.init(this, options);
  }

  /**
   * UTILITY FUNCTIONS
   */

  $emit(event: string, ...args: any[]): Promise<boolean> {
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

  private async runCustomScript(event: string, ...args: any[]) {
    for (let extension of extensions) {
      if (extension.events.includes(event)) {
        await extension.handler(event, args, this);
      }
    }
    for (let extension of this.thirdPartyExtensions) {
      if (extension.events.includes(event)) {
        await extension.handler(event, args, this);
      }
    }
  }

  private async loadExtensions() {
    try {
      LogBot.log(100, "Loading extensions ... ");
      //scan the plugins folder in the wranglebot directory
      //and load the routes from the plugins
      const pathToPlugins = finder.getPathToUserData("wranglebot/custom/");
      const thirdPartyPluginsRAW = finder.getContentOfFolder(pathToPlugins);
      LogBot.log(100, "Found " + thirdPartyPluginsRAW.length + " third party plugins.");
      if (thirdPartyPluginsRAW.length > 0) {
        for (let folderName of thirdPartyPluginsRAW) {
          LogBot.log(100, "Loading plugin " + folderName + " ... ");
          const pathToPlugin = finder.getPathToUserData("wranglebot/custom/" + folderName);
          const folderContents = finder.getContentOfFolder(pathToPlugin);

          for (let pluginFolder of folderContents) {
            if (pluginFolder === "hooks") {
              const pathToPluginHooks = finder.getPathToUserData("wranglebot/custom/" + folderName + "/" + pluginFolder);
              const hookFolderContent = finder.getContentOfFolder(pathToPluginHooks);

              for (let scriptFileName of hookFolderContent) {
                LogBot.log(100, "Loading hook " + scriptFileName + " ... ");
                const script = (await import(pathToPluginHooks + "/" + scriptFileName)).default;

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
    } catch (e: any) {
      LogBot.log(500, e.message);
    }
  }

  getAvailableLibraries() {
    return DB().getMany("libraries", {});
  }

  private async addOneLibrary(options: MetaLibraryOptions) {
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

    //add metaLibrary in database
    await DB().updateOne("libraries", { name: metaLibrary.name }, metaLibrary.toJSON({ db: true }));

    metaLibrary.createFoldersOnDiskFromTemplate();

    this.$emit("metalibrary-new", metaLibrary);

    return metaLibrary;
  }

  private removeOneLibrary(name, save = true) {
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

  private getOneLibrary(name) {
    const lib = this.index.libraries.find((l) => l.name === name);
    if (lib) return lib;
    return DB().getOne("libraries", { name });
  }

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
        } catch (e: any) {
          LogBot.log(500, "Error while generating thumbnail for file " + file.id + ": " + e.message);
          throw e;
        }
      }
      return true;
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
  private async generateThumbnail(library, metaFile, metaCopy, callback: Function) {
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
        const thumbnails: any = await TranscodeBot.generateThumbnails(reachableMetaCopy.pathToBucket.file, {
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

          const thumbData: any[] = [];

          for (let thumb of metaFile.getThumbnails()) {
            thumbData.push(thumb.toJSON());
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

          this.$emit("thumbnail-new", metaFile.getThumbnails());
          this.$emit("metafile-edit", metaFile);

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

  error(message) {
    return LogBot.log(500, message, true);
  }

  notify(title, message) {
    this.$emit("notification", { title, message });
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
              if (lib[key] !== filters[key]) return false;
            }
            return true;
          });

          return {
            fetch: async () => {
              return libs;
            },
          };
        },
        one: (libraryId: string) => {
          const lib = this.index.libraries.find((l) => l.name === libraryId);
          if (!lib) throw new Error("Library is not loaded or does not exist.");

          return {
            fetch(): MetaLibrary {
              lib.query = this;
              return lib;
            },
            put: (options: MetaLibraryUpdateOptions): Boolean => {
              return lib.update(options);
            },
            delete: (): Boolean => {
              return this.removeOneLibrary(libraryId);
            },
            scan: async (): Promise<Task | false> => {
              return await lib.createCopyTaskForNewFiles();
            },
            transactions: {
              one: (id: string) => {
                return {
                  fetch: (): Transaction => {
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
                  fetch: (): Transaction[] => {
                    return this.getManyTransactions({
                      ...filter,
                      library: lib.name,
                    });
                  },
                };
              },
            },
            metafiles: {
              one: (metaFileId: string) => {
                const metafile = lib.getOneMetaFile(metaFileId);
                if (!metafile) throw new Error("Metafile not found.");

                return {
                  fetch(): MetaFile {
                    metafile.query = this;
                    return metafile;
                  },
                  delete: (): Boolean => {
                    return lib.removeOneMetaFile(metafile);
                  },
                  thumbnails: {
                    one: (id: string) => {
                      return {
                        fetch: (): Thumbnail => {
                          return metafile.getThumbnail(id);
                        },
                      };
                    },
                    many: (filters) => {
                      const thumbnails = metafile.getThumbnails(filters);
                      return {
                        fetch: (): Thumbnail[] => {
                          return thumbnails;
                        },
                        analyse: async (options) => {
                          return await metafile.analyse({
                            ...options,
                            frames: thumbnails.map((t) => t.id),
                          });
                        },
                      };
                    },
                    first: {
                      fetch: (): Thumbnail => {
                        return metafile.getThumbnails()[0];
                      },
                    },
                    center: {
                      fetch: (): Thumbnail => {
                        const thumbs = metafile.getThumbnails();
                        return thumbs[Math.floor(thumbs.length / 2)];
                      },
                    },
                    last: {
                      fetch: (): Thumbnail => {
                        const thumbs = metafile.getThumbnails();
                        return thumbs[thumbs.length - 1];
                      },
                    },
                    generate: async (): Promise<Boolean> => {
                      return await this.generateThumbnails(lib, metafile);
                    },
                  },
                  metacopies: {
                    one: (metaCopyId) => {
                      const metacopy = lib.getOneMetaCopy(metaFileId, metaCopyId);
                      if (!metacopy) throw new Error("Metacopy not found.");
                      return {
                        fetch(): MetaCopy {
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
                    put: (options): Boolean => {
                      return lib.updateMetaDataOfFile(metafile, options.key, options.value);
                    },
                  },
                  analyse: async (options: analyseMetaFileOptions): Promise<{ response: Object }> => {
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
                    report: async (options): Promise<Boolean> => {
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
                  },
                };
              },
            },
            tasks: {
              one: (id) => {
                let task = lib.getOneTask(id);

                return {
                  fetch(): Task {
                    task.query = this;
                    return task;
                  },
                  run: async (callback: Function, cancelToken: CancelToken): Promise<Task> => {
                    return await lib.runOneTask(id, callback, cancelToken);
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
                  delete: async () => {
                    return await lib.removeManyTasks(filters);
                  },
                };
              },
              post: async (options: { label: string; jobs: { source: string; destinations?: string[] | null }[] }) => {
                return await lib.addOneTask(options);
              },
              generate: async (options: createTaskOptions) => {
                return await lib.generateOneTask(options);
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
                  run: async (callback: Function, cancelToken: CancelToken): Promise<void> => {
                    await lib.runOneTranscodeTask(id, callback, cancelToken);
                  },
                  delete: (): Boolean => {
                    return lib.removeOneTranscodeTask(id);
                  },
                };
              },
              many: () => {
                return {
                  fetch(): TranscodeTask[] {
                    return lib.getManyTranscodeTasks();
                  },
                  // delete: async () => {
                  //   return lib.removeManyTranscodeTask({$ids : filters.$ids});
                  // },
                };
              },
              post: async (files: MetaFile[], options): Promise<TranscodeTask> => {
                return await lib.addOneTranscodeTask(files, options);
              },
            },
            folders: {
              put: async (options: FolderOptions): Promise<Boolean> => {
                return await lib.updateFolder(options.path, options.options);
              },
            },
          };
        },
        post: async (options: MetaLibraryOptions): Promise<MetaLibrary> => {
          return await this.addOneLibrary(options);
        },
        load: async (name: string) => {
          return await this.loadOneLibrary(name);
        },
        unload: (name: string) => {
          return this.unloadOneLibrary(name);
        },
      },
      users: {
        one: (options: { id: string }) => {
          if (!options.id) throw new Error("No id provided");

          const user = AccountManager.getOneUser(options.id);
          if (!user) throw new Error("No user found with that " + options.id);

          return {
            fetch(): User {
              user.query = this;
              return user;
            },
            put: (options) => {
              return AccountManager.updateUser(user, options);
            },
            allow: (libraryName: string) => {
              return AccountManager.allowAccess(user, libraryName);
            },
            revoke: (libraryName: string) => {
              return AccountManager.revokeAccess(user, libraryName);
            },
            reset: () => {
              return AccountManager.resetPassword(user);
            },
          };
        },
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
      volumes: {
        one: (id) => {
          const vol = this.driveBot.drives.find((d) => d.volumeId === id);
          if (!vol) throw new Error("Volume not found.");
          return {
            fetch(): Volume {
              vol.query = this;
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
        return await indexer.index(pathToFolder, types);
      },
      list: (pathToFolder, options: { showHidden: boolean; filters: "both" | "files" | "folders"; recursive: boolean; depth: Number }) => {
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

  private async applyTransaction(transaction) {
    try {
      if (transaction.$method === "updateOne") await this.applyTransactionUpdateOne(transaction);
      if (transaction.$method === "insertMany") await this.applyTransactionInsertMany(transaction);
      if (transaction.$method === "removeOne") await this.applyTransactionRemoveOne(transaction);
    } catch (e) {
      console.error(e);
      LogBot.log(500, "Error applying transaction", e);
    }
  }

  private async applyTransactionUpdateOne(transaction) {
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

  private async applyTransactionInsertMany(transaction) {
    if (transaction.$collection === "thumbnails") {
      const metaFile = this.index.metaFiles[transaction.$query.metaFile];
      if (!metaFile) throw new Error("MetaFile not found.");

      for (let thumb of transaction.$set) {
        metaFile.addThumbnail(thumb);
      }
    }
  }

  private async applyTransactionRemoveOne(transaction) {
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
export { WrangleBot, config };
