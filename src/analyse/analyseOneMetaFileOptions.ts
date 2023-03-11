import { MetaFile } from "../library/MetaFile";

export default interface analyseOneMetaFileOptions {
  frames: string[];
  metafile: MetaFile;
  prompt: string;

  temperature?: number;
  max_tokens?: number;
}
