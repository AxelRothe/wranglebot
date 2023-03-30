import Folders from "./Folders";

export default interface FolderOptions {
  path: string;
  options: {
    name?: string;
    watch?: boolean;
    folders?: Folders[];
  };
}
