import Folders from "./Folders";

export default interface MetaLibraryOptions {
  name: string;
  pathToLibrary: string;
  drops: Object;
  folders: Folders[];
}
