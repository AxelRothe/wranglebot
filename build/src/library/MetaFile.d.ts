import { MetaCopy } from "./MetaCopy";
import { Thumbnail } from "./Thumbnail";
import analyseMetaFileOptions from "./analyseMetaFileOptions";
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
    /**
     *
     * @param options {{hash:string, id?: string, metaData?: object, name: string, basename:string, thumbnails?: string[], size: number, fileType: string, extension: string, creationDate?: string}}
     */
    constructor(options: any);
    /**
     * Get Hash
     * @return {string} hash
     */
    get hash(): any;
    update(document: any, save?: boolean): Promise<void>;
    /**
     *
     * @param thumbnail
     * @returns {Thumbnail}
     */
    addThumbnail(thumbnail: any): any;
    /**
     * Removes a Thumbnail from the metafile and deletes its disk counterpart
     *
     * Does not remove the thumbnail from the database
     *
     * @param {string} thumbnailId
     * @returns {boolean} True if it was successful, false otherwise
     */
    removeOneThumbnail(thumbnailId: any): void;
    /**
     *
     * @param {String} index
     * @param {String} value
     */
    updateMetaData(index: any, value: any): void;
    getMetaData(options: any): any;
    /**
     *
     * @param {MetaCopy} metaCopy
     */
    addCopy(metaCopy: any): 1 | 0;
    dropCopy(metaCopy: any): 0 | -1;
    addCopies(copies: any): void;
    getCopiesAs(type: any): any;
    getMetaCopy(metaCopyId: any): any;
    getThumbnail(thumbnailId: any, by?: string): any;
    getThumbnails(): Thumbnail[];
    analyse(options: analyseMetaFileOptions): Promise<{
        response: string;
        cost: number;
    }> | undefined;
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