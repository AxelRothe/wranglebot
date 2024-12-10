import { MetaCopy } from "./MetaCopy.js";
import { Thumbnail } from "./Thumbnail.js";
import analyseMetaFileOptions from "./analyseMetaFileOptions.js";
declare class MetaFile {
    #private;
    id: any;
    copies: MetaCopy[];
    metaData: any;
    basename: any;
    name: any;
    size: any;
    fileType: any;
    extension: any;
    query: any;
    thumbnails: Thumbnail[];
    private _hash;
    creationDate: Date;
    constructor(options: any);
    static fromFile(source: any): Promise<MetaFile>;
    getReachableCopies(): MetaCopy[];
    get hash(): any;
    update(document: any, save?: boolean): Promise<void>;
    addThumbnail(thumbnail: any): any;
    removeOneThumbnail(thumbnailId: any): void;
    updateMetaData(index: any, value: any): void;
    getMetaData(options?: {
        table: boolean;
    }): any;
    addCopy(metaCopy: any): 1 | 0;
    dropCopy(metaCopy: any): 0 | -1;
    addCopies(copies: any): void;
    getCopiesAs(type: any): any;
    getMetaCopy(metaCopyId: any): any;
    getThumbnail(thumbnailId: any, by?: string): any;
    getThumbnails(filters?: {
        $ids?: any;
    }): Thumbnail[];
    analyse(options: analyseMetaFileOptions): Promise<{
        response: string;
        cost: number;
    }>;
    toJSON(options?: {}): {
        basename: any;
        id: any;
        hash: any;
        creationDate: string;
        name: any;
        fileType: any;
        extension: any;
        size: any;
        metaData: any;
        copies: any;
        thumbnails: string[];
    };
}
export { MetaFile };
//# sourceMappingURL=MetaFile.d.ts.map