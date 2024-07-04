import { EventEmitter } from "events";
export default class TranscodeSetFactory extends EventEmitter {
    private transcodes;
    constructor(transcodes: any);
    runOne(transcode: any): Promise<unknown>;
    run(): Promise<unknown>;
}
//# sourceMappingURL=TranscodeSetFactory.d.ts.map