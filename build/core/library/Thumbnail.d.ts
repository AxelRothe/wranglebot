import { MetaFile } from "./MetaFile.js";
declare class Thumbnail {
    id: string;
    data: any;
    metaFile: MetaFile | undefined;
    constructor(thumb: any);
    toJSON(): {
        data: string;
        id: string;
        metaFile?: string;
    };
}
export { Thumbnail };
//# sourceMappingURL=Thumbnail.d.ts.map