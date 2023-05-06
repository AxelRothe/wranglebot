declare const _exports: ExportBot;
export = _exports;
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
    exportPDF(metaFiles: any, options?: {}): Promise<boolean>;
}
//# sourceMappingURL=ExportBot.d.ts.map