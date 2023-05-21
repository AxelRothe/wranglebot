import { IndexItem } from "./IndexItem.js";

export default interface Index {
  path: string;
  size: number;
  counts: {
    video: number;
    "video-raw": number;
    photo: number;
    audio: number;
    sidecar: number;
  };
  items: IndexItem[];
  duplicates?: boolean;
}
