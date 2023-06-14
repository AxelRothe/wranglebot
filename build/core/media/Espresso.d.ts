export default class Espresso {
    #private;
    static key: string;
    static hashStyle: string;
    hash: any;
    pathToFile: string;
    /**
     * Grab an Espresso Cup
     * @param hashStyle hash style to use, default is xxhash64
     * @param key key to use for the hash, default is 12345678
     * */
    constructor(hashStyle?: string, key?: string);
    /**
     * Pour yourself a sweet cup of joe.
     * Set the path to the file you want to read
     *
     * @param pathToFile path to the file
     * @returns {Espresso} returns the current instance
     */
    pour(pathToFile: any): this;
    /**
     * analyzes the file and returns the metadata and hash
     *
     * @param {{cancel:boolean}} cancelToken cancel token to cancel the operation during read
     * @param {Function} callback callback function to get the progress and speed
     * @returns {Promise<{metaData: Object, hash: string, bytesPerSecond: number, bytesRead: number, size: number}>}
     */
    analyse(cancelToken: any, callback: any): Promise<{
        metaData: Object;
        hash: string;
        bytesPerSecond: number;
        bytesRead: number;
        size: number;
    }>;
    /**
     * analyses the file and pipes the chunks to the target path and returns the metadata and hash at the end
     *
     * @param pathToTargets path to the target file location, if the does not exist it will be created
     * @param cancelToken cancel token to cancel the operation during read
     * @param callback callback function to get the progress and speed
     * @returns {Promise<{metaData: Object, hash: string, bytesPerSecond: number, bytesRead: number, size: number}>}
     */
    drink(pathToTargets: string[] | undefined, cancelToken: any, callback: any): Promise<{
        metaData: Object;
        hash: string;
        bytesPerSecond: number;
        bytesRead: number;
        size: number;
    }>;
    getDiskUsage(volumePath: any): Promise<{
        path: string;
        freeSpace: number;
    }>;
    calculateRequiredSpace(paths: string[], totalJobSizeInBytes: number): Promise<boolean>;
    /**
     * Checks if the size of the file is the same as the size of the file that was read
     * @param paths
     * @param fileSize
     * @return {boolean}
     */
    compareSizes(paths: string[], fileSize: number): boolean;
}
//# sourceMappingURL=Espresso.d.ts.map