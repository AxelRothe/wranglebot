import TranscodeFactory from "./TranscodeFactory.js";
import TranscodeSetFactory from "./TranscodeSetFactory.js";
declare class TranscodeBot {
    constructor();
    generateTranscode(inputPath: any, options: any): TranscodeFactory | null;
    generateTranscodeSet(metaFiles: any, options: any): TranscodeSetFactory;
    generateThumbnails(inputPath: any, options: any): Promise<unknown>;
}
declare const _default: TranscodeBot;
export default _default;
//# sourceMappingURL=TranscodeBot.d.ts.map