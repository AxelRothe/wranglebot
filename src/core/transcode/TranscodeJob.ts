import { MetaFile } from "../library/MetaFile.js";
import { MetaCopy } from "../library/MetaCopy.js";

import { v4 as uuidv4 } from "uuid";
import { finder } from "../system/index.js";
import TranscodeBot from "./index.js";
import Espresso from "../media/Espresso.js";
import { TranscodeTask } from "./TranscodeTask.js";

export class TranscodeJob {
  id: string = uuidv4();

  status: number = 1; // 1 = pending, 2 = running, 3 = done, 4 = error
  metaFile: MetaFile;
  pathToExport: string;
  customName: string | undefined;

  task: TranscodeTask;

  metaCopy: MetaCopy | undefined;
  private cancelToken: { cancel: boolean } = { cancel: false };

  constructor(task, options: { id?: string; metaFile: MetaFile; metaCopy?: MetaCopy; pathToExport: string; customName?: string; status?: number }) {
    this.id = options.id || this.id;
    this.task = task;
    this.status = options.status || this.status;
    this.metaFile = options.metaFile || null;
    this.metaCopy = options.metaCopy || undefined;
    this.pathToExport = options.pathToExport;
    this.customName = options.customName || undefined;

    if (!this.task) throw new Error("TranscodeJob needs a task");

    if (!this.pathToExport) {
      throw new Error("No pathToExport supplied. TranscodeJob is corrupted.");
    }
    if (this.metaFile === null) {
      throw new Error("No metaFile supplied. TranscodeJob is corrupted.");
    }
  }

  async run(cancelToken, callback) {
    this.cancelToken = cancelToken;

    try {
      const metaCopy = await this.#transcodeOneMetaFile(this.metaFile, callback);
      if (metaCopy) {
        this.metaCopy = metaCopy;
        this.status = 3;
        return metaCopy;
      } else {
        this.status = 4;
        return null;
      }
    } catch (e: any) {
      this.status = 4;
      throw new Error("Could not transcode " + this.metaFile.name + " Reason: " + e.message);
    }
  }

  cancel() {
    this.cancelToken.cancel = true;
  }

  async #transcodeOneMetaFile(metaFile, callback) {
    //find reachable meta copy
    const reachableMetaCopy = metaFile.copies.find((copy) => {
      return finder.existsSync(copy.pathToBucket.file);
    });

    if (reachableMetaCopy) {
      const pathToExport = this.pathToExport;
      const pathToExportedFile = pathToExport + "/" + (this.customName || metaFile.name) + "." + this.task.template.extension;

      if (finder.existsSync(pathToExportedFile) && !this.task.overwrite) {
        throw new Error("File already exists.");
      }

      //transcode the meta file
      try {
        const transcode = TranscodeBot.generateTranscode(reachableMetaCopy.pathToBucket.file, {
          ...this.task.template,
          output: pathToExportedFile, //there is a reason this needs to be here
          lut: this.task.lut,
        });

        if (transcode === null) throw new Error("Could not generate transcode");

        await transcode.run(callback, this.cancelToken);

        if (this.cancelToken.cancel) return null;

        const cup = new Espresso();
        const analyzedFile = await cup.pour(pathToExportedFile).analyse(this.cancelToken, () => {});

        const newMetaCopy = new MetaCopy({
          hash: analyzedFile.hash,
          pathToSource: reachableMetaCopy.pathToBucket.file,
          pathToBucket: pathToExportedFile,
          label: "transcode",
          metaFile: metaFile,
        });

        return newMetaCopy;
      } catch (e) {
        console.log(e);
        throw new Error("Could not transcode " + reachableMetaCopy.pathToBucket.file + " to " + pathToExport);
      }
    } else {
      throw new Error("Could not find a reachable copy for " + metaFile.name);
    }
  }

  toJSON() {
    return {
      id: this.id,
      status: this.status,
      metaFile: this.metaFile.id,
      pathToExport: this.pathToExport,
    };
  }
}
