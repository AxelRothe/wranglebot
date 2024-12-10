declare class TranscodeTemplates {
    static videoCodecs: {
        name: string;
        videoCodec: string;
        flavours: {
            name: string;
            bitrate: string;
            pixelFormat: string;
            size: string;
            frameRates: number[];
        }[];
        containers: {
            name: string;
            extension: string;
            audioCodecs: string[];
            audioBitrates: number[];
            audioChannels: number[];
        }[];
    }[];
    static audioCodecs: {
        name: string;
        codec: string;
        extension: string;
    }[];
    static audioChannels: {
        name: string;
        channels: number;
    }[];
    static get(codec: any, frameRate: any, flavour: any, container: any, audioCodec: any, audioBitrate: any, channels: any): {
        width: string;
        height: string;
        videoCodec: string;
        videoBitrate: string;
        pixelFormat: string;
        fps: any;
        audioCodec: string;
        audioBitrate: string;
        audioChannels: any;
        extension: string;
    };
    static getCodec(codec: any): {
        name: string;
        videoCodec: string;
        flavours: {
            name: string;
            bitrate: string;
            pixelFormat: string;
            size: string;
            frameRates: number[];
        }[];
        containers: {
            name: string;
            extension: string;
            audioCodecs: string[];
            audioBitrates: number[];
            audioChannels: number[];
        }[];
    } | undefined;
    static getAvailableCodecs(): {
        name: string;
        videoCodec: string;
        flavours: {
            name: string;
            bitrate: string;
            pixelFormat: string;
            size: string;
            frameRates: number[];
        }[];
        containers: {
            name: string;
            extension: string;
            audioCodecs: string[];
            audioBitrates: number[];
            audioChannels: number[];
        }[];
    }[];
    static getAvailableContainers(codec: any): {
        audioCodecs: any;
        audioChannels: any;
        name: string;
        extension: string;
        audioBitrates: number[];
    }[];
    static getAvailableFlavours(codec: any): {
        name: string;
        bitrate: string;
        pixelFormat: string;
        size: string;
        frameRates: number[];
    }[];
    static mapAudioCodecs(container: any): any;
    static mapAudioChannels(container: any): any;
    static getAvailableTemplates(): {
        name: string;
        codec: string;
        flavours: {
            name: string;
            bitrate: string;
            pixelFormat: string;
            size: string;
            frameRates: number[];
        }[];
        containers: {
            audioCodecs: any;
            audioChannels: any;
            name: string;
            extension: string;
            audioBitrates: number[];
        }[];
    }[];
}
export default TranscodeTemplates;
//# sourceMappingURL=TranscodeTemplates.d.ts.map