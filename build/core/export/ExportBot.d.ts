declare class ExportBot {
    pathToAssets: string;
    assets: {
        fonts: {
            body: {
                normal: string;
                bold: string;
                italics: string;
                bolditalics: string;
            };
            mono: {
                normal: string;
                bold: string;
                light: string;
            };
        };
    };
    toPrettyBytes: string[];
    toPrettyTime: string[];
    exportPDF(metaFiles: any, options: any): Promise<boolean>;
}
declare const _default: ExportBot;
export default _default;
//# sourceMappingURL=ExportBot.d.ts.map