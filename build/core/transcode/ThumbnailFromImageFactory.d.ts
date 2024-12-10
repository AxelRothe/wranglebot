export default class ThumbnailFromImageFactory {
    private pathToFile;
    private options;
    constructor(pathToFile: any, options: any);
    generate(type?: string): Promise<{
        id: any;
        frame: number;
        data: string;
    }[] | undefined>;
}
//# sourceMappingURL=ThumbnailFromImageFactory.d.ts.map