declare const _exports: TranscodeBot;
export = _exports;
declare class TranscodeBot {
    /**
     *
     * @param inputPath
     * @param options
     * @returns {TranscodeFactory}
     */
    generateTranscode(inputPath: any, options: any): TranscodeFactory;
    /**
     * Creates a Set of Transcode from a list of metafiles
     * @param {MetaFile[]} metaFiles
     * @param options
     */
    generateTranscodeSet(metaFiles: MetaFile[], options: any): TranscodeSetFactory;
    /**
     * Generates Thumbnails for a given video file
     *
     * @param inputPath
     * @param options
     * @returns {Promise<{id: string, label: string, data: string}[]>} the id of the generated thumbnail
     */
    generateThumbnails(inputPath: any, options: any): Promise<{
        id: string;
        label: string;
        data: string;
    }[]>;
}
declare class TranscodeFactory {
    constructor(inputPath: any, options: any, callback: any);
    command: null;
    output: any;
    run(callback: any, cancelToken: any): Promise<any>;
}
declare class TranscodeSetFactory extends EventEmitter {
    constructor(transcodes: any);
    transcodes: any;
    runOne(transcode: any): Promise<any>;
    run(): Promise<any>;
}
import { EventEmitter } from "events";
//# sourceMappingURL=TranscodeBot.d.ts.map