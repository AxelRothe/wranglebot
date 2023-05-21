import TranscodeFactory from "./TranscodeFactory.js";
import TranscodeSetFactory from "./TranscodeSetFactory.js";
declare class TranscodeBot {
    constructor();
    /**
     *
     * @param inputPath
     * @param options
     * @returns {TranscodeFactory}
     */
    generateTranscode(inputPath: any, options: any): TranscodeFactory | null;
    /**
     * Creates a Set of Transcode from a list of metafiles
     * @param {MetaFile[]} metaFiles
     * @param options
     */
    generateTranscodeSet(metaFiles: any, options: any): TranscodeSetFactory;
    /**
     * Generates Thumbnails for a given video file
     *
     * @param inputPath
     * @param options
     * @returns {Promise<{id: string, label: string, data: string}[]>} the id of the generated thumbnail
     */
    generateThumbnails(inputPath: any, options: any): Promise<unknown>;
}
declare const _default: TranscodeBot;
export default _default;
//# sourceMappingURL=TranscodeBot.d.ts.map