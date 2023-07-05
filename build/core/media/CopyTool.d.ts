/// <reference types="node" />
/// <reference types="node" />
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
    /**
     * Creates an instance of CopyTool.
     * @param [options] - The options for the CopyTool
     * @param [options.paranoid] - If true, will check the hash of the file after copying to ensure it matches the source
     * @param [options.hash] - The hash algorithm to use. Defaults to xxhash64, but can be xxhash128, xxhash32, or xxhash3
     * @param [options.overwrite] - If true, will overwrite the destination file if it exists
     * @param [options.chunkSize] - The size of each chunk to copy in MB. Defaults to 10MB
     */
    constructor(options: {
        paranoid?: boolean;
        hash?: "xxhash128" | "xxhash64" | "xxhash32" | "xxhash3";
        overwrite?: boolean;
        chunkSize?: number;
        key?: string;
    });
    /**
     * Adds a source file to copy
     * @param path - The path to the source file
     */
    source(path: any): CopyTool;
    /**
     * Adds a destination paths to copy to
     * @param paths - The paths to copy to
     */
    destinations(paths: string[]): CopyTool;
    /**
     * Checks if there is enough space on the disks to copy the files
     * @private
     */
    private hasEnoughSpace;
    /**
     * hashes the source file and returns the hash
     */
    hashFile(path: string, callback?: (progress: any) => void): Promise<unknown>;
    /**
     * Copies the file to the destinations
     *
     * @example
     *  const callback = (progress) => {
     *  //do something with progress
     *  }
     *
     *
     *  copyTool.source("path/to/source").destinations(["path/to/dest1", "path/to/dest2"]).copy(progress, abort).then(() => {
     *    //do something
     *  }).catch((e) => {
     *    //handle error
     *  });
     *
     * @param options
     * @param callback
     */
    copy(callback?: (progress: any) => void): Promise<unknown>;
    static analyseFile(path: string): Promise<{}>;
    abort(): boolean;
    verify(hash: string): Promise<boolean>;
    getDiskUsage(volumePath: any): Promise<unknown>;
    /**
     * Checks if the size of the file is the same as the size of the file that was read
     * @param paths
     * @param fileSize
     * @return {boolean}
     */
    compareSizes(): boolean;
    calculateRequiredSpace(paths: any, totalJobSizeInBytes: any): Promise<boolean>;
}
//# sourceMappingURL=CopyTool.d.ts.map