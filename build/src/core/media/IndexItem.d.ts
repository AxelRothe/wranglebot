export class IndexItem {
    static hashStyle: string;
    constructor(pathToFile: any);
    pathToFile: any;
    basename: string;
    name: string;
    size: any;
    fileType: "photo" | "video" | "audio" | "sidecar";
    extension: string;
    stat: any;
    id: any;
    dirname: any;
    isDirectory(): any;
    is(type: any): boolean;
    toJSON(): {
        id: any;
        path: any;
        name: string;
        size: any;
        fileType: "photo" | "video" | "audio" | "sidecar";
        extension: string;
    };
}
//# sourceMappingURL=IndexItem.d.ts.map