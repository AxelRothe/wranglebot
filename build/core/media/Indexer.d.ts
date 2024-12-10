import Index from "./Index.js";
declare class Indexer {
    private readonly isLazy;
    constructor(isLazy?: boolean);
    index(sourcePath: any, toCount?: string[], matchExpression?: RegExp | null): Promise<Index>;
}
declare const indexer: Indexer;
export { indexer };
//# sourceMappingURL=Indexer.d.ts.map