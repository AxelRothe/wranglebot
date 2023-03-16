export = TranscodeTemplates;
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
    /**
     * Returns a usable template for transcoding
     *
     * @param codec {string} Codec name
     * @param frameRate {number} Frame rate
     * @param flavour {string} Flavour name
     * @param container {string} Container name
     * @param audioCodec {string} Audio codec name
     * @param audioBitrate {number} Audio bitrate
     * @param channels {number} Number of audio channels
     * @returns {{videoBitrate: *, extension, pixelFormat: (string|*), audioChannels, width: string, fps, audioCodec: *, audioBitrate: string, height: string, videoCodec: (string|*)}}
     */
    static get(codec: string, frameRate: number, flavour: string, container: string, audioCodec: string, audioBitrate: number, channels: number): {
        videoBitrate: any;
        extension;
        pixelFormat: (string | any);
        audioChannels;
        width: string;
        fps;
        audioCodec: any;
        audioBitrate: string;
        height: string;
        videoCodec: (string | any);
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
        audioCodecs: any[];
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
    /**
     * Maps the audio codec ids to the audio codec template
     * @param container
     * @return {Array}
     */
    static mapAudioCodecs(container: any): any[];
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
            audioCodecs: any[];
            audioChannels: any;
            name: string;
            extension: string;
            audioBitrates: number[];
        }[];
    }[];
}
//# sourceMappingURL=TranscodeTemplates.d.ts.map