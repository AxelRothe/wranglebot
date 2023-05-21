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
    /**
     * Maps the audio codec ids to the audio codec template
     * @param container
     * @return {Array}
     */
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
/**
 * LEGAL DNxHD FFMPEG Settings
 *
 * Frame size: 1920x1080p; bitrate: 175Mbps; pixel format: yuv422p10
 * Frame size: 1920x1080p; bitrate: 185Mbps; pixel format: yuv422p10
 * Frame size: 1920x1080p; bitrate: 365Mbps; pixel format: yuv422p10
 * Frame size: 1920x1080p; bitrate: 440Mbps; pixel format: yuv422p10
 * Frame size: 1920x1080p; bitrate: 115Mbps; pixel format: yuv422p
 * Frame size: 1920x1080p; bitrate: 120Mbps; pixel format: yuv422p
 * Frame size: 1920x1080p; bitrate: 145Mbps; pixel format: yuv422p
 * Frame size: 1920x1080p; bitrate: 240Mbps; pixel format: yuv422p
 * Frame size: 1920x1080p; bitrate: 290Mbps; pixel format: yuv422p
 * Frame size: 1920x1080p; bitrate: 175Mbps; pixel format: yuv422p
 * Frame size: 1920x1080p; bitrate: 185Mbps; pixel format: yuv422p
 * Frame size: 1920x1080p; bitrate: 220Mbps; pixel format: yuv422p
 * Frame size: 1920x1080p; bitrate: 365Mbps; pixel format: yuv422p
 * Frame size: 1920x1080p; bitrate: 440Mbps; pixel format: yuv422p
 * Frame size: 1920x1080i; bitrate: 185Mbps; pixel format: yuv422p10
 * Frame size: 1920x1080i; bitrate: 220Mbps; pixel format: yuv422p10
 * Frame size: 1920x1080i; bitrate: 120Mbps; pixel format: yuv422p
 * Frame size: 1920x1080i; bitrate: 145Mbps; pixel format: yuv422p
 * Frame size: 1920x1080i; bitrate: 185Mbps; pixel format: yuv422p
 * Frame size: 1920x1080i; bitrate: 220Mbps; pixel format: yuv422p
 * Frame size: 1440x1080i; bitrate: 120Mbps; pixel format: yuv422p
 * Frame size: 1440x1080i; bitrate: 145Mbps; pixel format: yuv422p
 * Frame size: 1280x720p; bitrate: 90Mbps; pixel format: yuv422p10
 * Frame size: 1280x720p; bitrate: 180Mbps; pixel format: yuv422p10
 * Frame size: 1280x720p; bitrate: 220Mbps; pixel format: yuv422p10
 * Frame size: 1280x720p; bitrate: 90Mbps; pixel format: yuv422p
 * Frame size: 1280x720p; bitrate: 110Mbps; pixel format: yuv422p
 * Frame size: 1280x720p; bitrate: 180Mbps; pixel format: yuv422p
 * Frame size: 1280x720p; bitrate: 220Mbps; pixel format: yuv422p
 * Frame size: 1280x720p; bitrate: 60Mbps; pixel format: yuv422p
 * Frame size: 1280x720p; bitrate: 75Mbps; pixel format: yuv422p
 * Frame size: 1280x720p; bitrate: 120Mbps; pixel format: yuv422p
 * Frame size: 1280x720p; bitrate: 145Mbps; pixel format: yuv422p
 * Frame size: 1920x1080p; bitrate: 36Mbps; pixel format: yuv422p
 * Frame size: 1920x1080p; bitrate: 45Mbps; pixel format: yuv422p
 * Frame size: 1920x1080p; bitrate: 75Mbps; pixel format: yuv422p
 * Frame size: 1920x1080p; bitrate: 90Mbps; pixel format: yuv422p
 * Frame size: 1920x1080p; bitrate: 350Mbps; pixel format: yuv444p10, gbrp10
 * Frame size: 1920x1080p; bitrate: 390Mbps; pixel format: yuv444p10, gbrp10
 * Frame size: 1920x1080p; bitrate: 440Mbps; pixel format: yuv444p10, gbrp10
 * Frame size: 1920x1080p; bitrate: 730Mbps; pixel format: yuv444p10, gbrp10
 * Frame size: 1920x1080p; bitrate: 880Mbps; pixel format: yuv444p10, gbrp10
 * Frame size: 960x720p; bitrate: 42Mbps; pixel format: yuv422p
 * Frame size: 960x720p; bitrate: 60Mbps; pixel format: yuv422p
 * Frame size: 960x720p; bitrate: 75Mbps; pixel format: yuv422p
 * Frame size: 960x720p; bitrate: 115Mbps; pixel format: yuv422p
 * Frame size: 1440x1080p; bitrate: 63Mbps; pixel format: yuv422p
 * Frame size: 1440x1080p; bitrate: 84Mbps; pixel format: yuv422p
 * Frame size: 1440x1080p; bitrate: 100Mbps; pixel format: yuv422p
 * Frame size: 1440x1080p; bitrate: 110Mbps; pixel format: yuv422p
 * Frame size: 1440x1080i; bitrate: 80Mbps; pixel format: yuv422p
 * Frame size: 1440x1080i; bitrate: 90Mbps; pixel format: yuv422p
 * Frame size: 1440x1080i; bitrate: 100Mbps; pixel format: yuv422p
 * Frame size: 1440x1080i; bitrate: 110Mbps; pixel format: yuv422p
 */
/**
 * AUDIO CODECS FFMPEG
 *
 *  DE alaw            PCM A-law
 *  DE f32be           PCM 32-bit floating-point big-endian
 *  DE f32le           PCM 32-bit floating-point little-endian
 *  DE f64be           PCM 64-bit floating-point big-endian
 *  DE f64le           PCM 64-bit floating-point little-endian
 *  DE mulaw           PCM mu-law
 *  DE s16be           PCM signed 16-bit big-endian
 *  DE s16le           PCM signed 16-bit little-endian
 *  DE s24be           PCM signed 24-bit big-endian
 *  DE s24le           PCM signed 24-bit little-endian
 *  DE s32be           PCM signed 32-bit big-endian
 *  DE s32le           PCM signed 32-bit little-endian
 *  DE s8              PCM signed 8-bit
 *  DE u16be           PCM unsigned 16-bit big-endian
 *  DE u16le           PCM unsigned 16-bit little-endian
 *  DE u24be           PCM unsigned 24-bit big-endian
 *  DE u24le           PCM unsigned 24-bit little-endian
 *  DE u32be           PCM unsigned 32-bit big-endian
 *  DE u32le           PCM unsigned 32-bit little-endian
 *  DE u8              PCM unsigned 8-bit
 *  DE vidc            PCM Archimedes VIDC
 */
//# sourceMappingURL=TranscodeTemplates.d.ts.map