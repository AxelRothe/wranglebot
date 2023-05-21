import { MetaFile } from "../library/MetaFile.js";

export default interface analyseOneMetaFileOptions {
  engine: string;
  frames: string[];
  metafile: MetaFile;
  prompt?: string;

  temperature?: number;
  max_tokens?: number;
  stop_sequences?: string[];
}
