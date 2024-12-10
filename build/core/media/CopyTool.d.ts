import StreamSpeed from "streamspeed";
import fs from "fs";
export default class CopyTool {
    key: string;
    readStream: fs.ReadStream | null;
    writeStreams: fs.WriteStream[];
    abortController: AbortController | null;
    paranoid: boolean;
    overwrite: boolean;
    highWaterMark: number;
    fileSizeInBytes: number;
    streamSpeed: StreamSpeed | null;
    private _source;
    private _destinations;
    private hash;
    private chunkSize;
    constructor(options: {
        paranoid?: boolean;
        hash?: "xxhash128" | "xxhash64" | "xxhash32" | "xxhash3";
        overwrite?: boolean;
        chunkSize?: number;
        key?: string;
    });
    source(path: any): CopyTool;
    destinations(paths: string[]): CopyTool;
    private hasEnoughSpace;
    hashFile(path: string, callback?: (progress: any) => void): Promise<unknown>;
    copy(callback?: (progress: any) => void): Promise<unknown>;
    static analyseFile(path: string): Promise<{}>;
    abort(): boolean;
    verify(hash: string): Promise<boolean>;
    getDiskUsage(volumePath: any): Promise<unknown>;
    compareSizes(): boolean;
    calculateRequiredSpace(paths: any, totalJobSizeInBytes: any): Promise<boolean>;
}
//# sourceMappingURL=CopyTool.d.ts.map