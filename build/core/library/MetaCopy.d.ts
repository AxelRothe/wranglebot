declare class MetaCopy {
    #private;
    id: any;
    label: string;
    metaFile: any;
    constructor(options: any);
    update(options: any, save?: boolean): void;
    get pathToSource(): any;
    get pathToBucket(): {
        folder: string;
        file: any;
    };
    verify(hash: any): boolean;
    get hash(): string;
    isVerified(): boolean;
    isReachable(): boolean;
    toJSON(options?: {
        db: boolean;
    }): {
        id: any;
        label: string;
        pathToSource: any;
        pathToBucket: any;
        hash: string;
        reachable: boolean | undefined;
    };
}
export { MetaCopy };
//# sourceMappingURL=MetaCopy.d.ts.map