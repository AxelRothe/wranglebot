import Index from "./Index";
/**
 * media
 */
declare class Indexer {
    private readonly isLazy;
    constructor(isLazy?: boolean);
    /**
     * Indexes the folders recursively
     *
     * @param sourcePath {String} the folders to archive
     * @param toCount {String["video"|"video-raw"|"audio"|"sidecar"|"photo"]} the type of files to count
     * @param matchExpression {RegExp|null} the expression to match
     * @return {Promise<Index>}
     */
    index(sourcePath: any, toCount?: string[], matchExpression?: RegExp | null): Promise<Index>;
}
declare const indexer: Indexer;
export { indexer };
//# sourceMappingURL=Indexer.d.ts.map