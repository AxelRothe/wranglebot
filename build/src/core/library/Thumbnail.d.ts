import { MetaFile } from "./MetaFile";
declare class Thumbnail {
    id: string;
    data: any;
    metaFile: MetaFile | undefined;
    constructor(thumb: any);
    /**
     *
     * @returns {Promise<{data: string, id: string}>}
     */
    toJSON(): {
        data: string;
        id: string;
        metaFile?: string;
    };
}
export { Thumbnail };
//# sourceMappingURL=Thumbnail.d.ts.map