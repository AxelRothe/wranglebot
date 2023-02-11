export class MetaFile {
    /**
     *
     * @param options {{hash:string, id?: string, metaData?: object, name: string, basename:string, thumbnails?: string[], size: number, fileType: string, extension: string, creationDate?: string}}
     */
    constructor(options: {
        hash: string;
        id?: string;
        metaData?: object;
        name: string;
        basename: string;
        thumbnails?: string[];
        size: number;
        fileType: string;
        extension: string;
        creationDate?: string;
    });
    id: any;
    copies: any[];
    metaData: MetaData;
    basename: string;
    name: string;
    size: number;
    fileType: string;
    extension: string;
    query: any;
    /**
     * @type {Thumbnail[]}
     */
    thumbnails: Thumbnail[];
    creationDate: Date;
    _hash: string;
    /**
     * Get Hash
     * @return {string} hash
     */
    get hash(): string;
    update(document: any, save?: boolean): Promise<void>;
    /**
     *
     * @param thumbnail
     * @returns {Thumbnail}
     */
    addThumbnail(thumbnail: any): Thumbnail;
    /**
     * Removes a Thumbnail from the metafile and deletes its disk counterpart
     *
     * Does not remove the thumbnail from the database
     *
     * @param {string} thumbnailId
     * @returns {boolean} True if it was successful, false otherwise
     */
    removeOneThumbnail(thumbnailId: string): boolean;
    /**
     *
     * @param {String} index
     * @param {String} value
     */
    updateMetaData(index: string, value: string): void;
    /**
     * @return {any}
     */
    getMetaData(options?: {}): any;
    /**
     *
     * @param {MetaCopy} metaCopy
     */
    addCopy(metaCopy: MetaCopy): 1 | 0;
    dropCopy(metaCopy: any): 0 | -1;
    addCopies(copies: any): void;
    getCopiesAs(type: any): any[] | undefined;
    getMetaCopy(metaCopyId: any): any;
    getThumbnail(thumbnailId: any, by?: string): any;
    getThumbnails(): Thumbnail[];
    toJSON(options?: {}): {
        basename: string;
        id: any;
        hash: string;
        creationDate: string;
        name: string;
        fileType: string;
        extension: string;
        size: number;
        metaData: {
            [x: string]: string;
        };
        copies: any[] | undefined;
        thumbnails: string[];
    };
    #private;
}
import { MetaData } from "./MetaData";
import { Thumbnail } from "./Thumbnail";
import { MetaCopy } from "./MetaCopy";
//# sourceMappingURL=MetaFile.d.ts.map