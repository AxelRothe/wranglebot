import { Stats } from "fs";
declare class IndexItem {
    pathToFile: any;
    basename: any;
    name: any;
    size: any;
    fileType: any;
    extension: any;
    stat: Stats;
    id: any;
    dirname: any;
    constructor(pathToFile: any);
    isDirectory(): boolean;
    is(type: any): boolean;
    toJSON(): {
        id: any;
        path: any;
        name: any;
        size: any;
        fileType: any;
        extension: any;
    };
}
export { IndexItem };
//# sourceMappingURL=IndexItem.d.ts.map