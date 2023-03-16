import MLInterfaceOptions from "./MLInterfaceOptions";
import analyseOneMetaFileOptions from "./analyseOneMetaFileOptions";
declare class MLInterfaceSingleton {
    private readonly token;
    private readonly url;
    constructor(options: MLInterfaceOptions);
    analyseFrames(options: analyseOneMetaFileOptions): Promise<{
        response: string;
        cost: number;
    }>;
}
declare const MLInterface: (options?: MLInterfaceOptions | undefined) => MLInterfaceSingleton;
export { MLInterface };
//# sourceMappingURL=MLInterface.d.ts.map