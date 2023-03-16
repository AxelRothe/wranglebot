export const Indexer: Indexer;
export type Index = {
    path: string;
    size: number;
    counts: {
        video: number;
        audio: number;
        sidecar: number;
    };
    items: IndexItem[];
    duplicates?: boolean;
};
/**
 * @typedef {{  path: string,
 *              size: number,
 *              counts : {
 *                          video: number,
 *                          audio: number,
 *                          sidecar: number},
 *              items:IndexItem[],
 *              duplicates?: boolean,
 *              }} Index
 */
/**
 * media
 */
declare class Indexer {
    constructor(isLazy?: boolean);
    isLazy: boolean;
    /**
     * Indexes the folders recursively
     *
     * @param sourcePath {String} the folders to archive
     * @param toCount {String["video"|"video-raw"|"audio"|"sidecar"|"photo"]} the type of files to count
     * @param matchExpression {RegExp|null} the expression to match
     * @return {Promise<Index>}
     */
    index(sourcePath: string, toCount?: any, matchExpression?: RegExp | null): Promise<Index>;
}
import { IndexItem } from "./IndexItem";
export {};
//# sourceMappingURL=Indexer.d.ts.map