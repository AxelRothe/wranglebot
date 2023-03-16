"use strict";
class TranscodeTemplates {
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
    static get(codec, frameRate, flavour, container, audioCodec, audioBitrate, channels) {
        let template = TranscodeTemplates.videoCodecs.find((c) => c.name === codec);
        if (!template)
            throw new Error("Codec not found");
        let flavourTemplate = template.flavours.find((f) => f.name === flavour);
        if (!flavourTemplate)
            throw new Error("Flavour not found");
        if (!flavourTemplate.frameRates.includes(frameRate))
            throw new Error("Frame rate not supported");
        let audioCodecTemplate = TranscodeTemplates.audioCodecs.find((c) => c.name === audioCodec);
        if (!audioCodecTemplate)
            throw new Error("Audio codec not found");
        const containerTemplate = template.containers.find((c) => c.name === container);
        if (!containerTemplate)
            throw new Error("Container not found");
        if (!containerTemplate.audioBitrates.includes(audioBitrate))
            throw new Error("Audio bitrate not supported");
        if (channels < 1)
            throw new Error("Invalid number of channels");
        return {
            width: flavourTemplate.size.split("x")[0],
            height: flavourTemplate.size.split("x")[1],
            videoCodec: template.videoCodec,
            videoBitrate: flavourTemplate.bitrate,
            pixelFormat: flavourTemplate.pixelFormat,
            fps: frameRate,
            audioCodec: audioCodecTemplate.codec,
            audioBitrate: audioBitrate + "k",
            audioChannels: channels,
            extension: containerTemplate.extension,
        };
    }
    static getCodec(codec) {
        return TranscodeTemplates.videoCodecs.find((c) => c.name === codec);
    }
    static getAvailableCodecs() {
        return TranscodeTemplates.videoCodecs;
    }
    static getAvailableContainers(codec) {
        const containers = TranscodeTemplates.getCodec(codec).containers;
        //for each container map the audio codecs
        return containers.map((c) => {
            return Object.assign(Object.assign({}, c), { audioCodecs: TranscodeTemplates.mapAudioCodecs(c), audioChannels: TranscodeTemplates.mapAudioChannels(c) });
        });
    }
    static getAvailableFlavours(codec) {
        return TranscodeTemplates.getCodec(codec).flavours;
    }
    /**
     * Maps the audio codec ids to the audio codec template
     * @param container
     * @return {Array}
     */
    static mapAudioCodecs(container) {
        return container.audioCodecs.map((ac) => {
            return TranscodeTemplates.audioCodecs.find((c) => c.codec === ac);
        });
    }
    static mapAudioChannels(container) {
        return container.audioChannels.map((ac) => {
            return TranscodeTemplates.audioChannels.find((c) => c.channels === ac);
        });
    }
    static getAvailableTemplates() {
        return this.getAvailableCodecs().map((codec) => {
            return {
                name: codec.name,
                codec: codec.videoCodec,
                flavours: this.getAvailableFlavours(codec.name),
                containers: this.getAvailableContainers(codec.name),
            };
        });
    }
}
TranscodeTemplates.videoCodecs = [
    {
        name: "DNxHD",
        videoCodec: "dnxhd",
        flavours: [
            {
                name: "1080p DNxHD 36",
                bitrate: "36000",
                pixelFormat: "yuv422p",
                size: "1920x1080",
                frameRates: [24, 25, 30],
            },
            {
                name: "1080p DNxHD 145",
                bitrate: "145000",
                pixelFormat: "yuv422p",
                size: "1920x1080",
                frameRates: [24, 25, 30],
            },
            {
                name: "1080p DNxHD 220",
                bitrate: "220000",
                pixelFormat: "yuv422p",
                size: "1920x1080",
                frameRates: [24, 25, 30],
            },
        ],
        containers: [
            {
                name: "Media Exchange Format",
                extension: "mxf",
                audioCodecs: ["pcm_s16le", "pcm_s24le", "pcm_s32le"],
                audioBitrates: [128, 192, 256, 512],
                audioChannels: [1, 2, 3, 6, 8, 12],
            },
            {
                name: "Quicktime",
                extension: "mov",
                audioCodecs: ["pcm_s16le", "pcm_s24le", "pcm_s32le"],
                audioBitrates: [128, 192, 256, 512],
                audioChannels: [1, 2, 3, 6, 8, 12],
            },
        ],
    },
    {
        name: "ProRes",
        videoCodec: "prores_ks",
        flavours: [
            {
                name: "1080p ProRes 422",
                bitrate: "122000",
                pixelFormat: "yuv422p",
                size: "1920x1080",
                frameRates: [23.97, 24, 25, 30, 48, 50],
            },
            {
                name: "1080p ProRes 4444",
                bitrate: "275000",
                pixelFormat: "yuv444p",
                size: "1920x1080",
                frameRates: [23.97, 24, 25, 30, 48, 50],
            },
            {
                name: "4K ProRes 422",
                bitrate: "492000",
                pixelFormat: "yuv422p",
                size: "3840x2160",
                frameRates: [23.97, 24, 25, 30, 48, 50],
            },
            {
                name: "4K ProRes 4444",
                bitrate: "1106000",
                pixelFormat: "yuv444p",
                size: "3840x2160",
                frameRates: [23.97, 24, 25, 30, 48, 60, 120, 240],
            },
        ],
        containers: [
            {
                name: "Quicktime",
                extension: "mov",
                audioCodecs: ["pcm_s16le", "pcm_s24le", "pcm_s32le"],
                audioBitrates: [128, 192, 256, 512],
                audioChannels: [1, 2, 3, 6, 8],
            },
        ],
    },
    {
        name: "H.264",
        videoCodec: "h264_videotoolbox",
        flavours: [
            {
                name: "720p H.264",
                bitrate: "2000",
                pixelFormat: "yuv420p",
                size: "1280x720",
                frameRates: [23.97, 24, 25, 30, 48, 50, 60],
            },
            {
                name: "1080p H.264",
                bitrate: "8000",
                pixelFormat: "yuv420p",
                size: "1920x1080",
                frameRates: [23.97, 24, 25, 30, 48, 50, 60],
            },
            {
                name: "4K H.264",
                bitrate: "20000",
                pixelFormat: "yuv420p",
                size: "3840x2160",
                frameRates: [23.97, 24, 25, 30, 48, 50, 60],
            },
            {
                name: "Lossless 1080p",
                bitrate: "0",
                pixelFormat: "yuv444p",
                size: "1920x1080",
                frameRates: [23.97, 24, 25, 30, 48, 50, 60],
            },
            {
                name: "Lossless 4K",
                bitrate: "0",
                pixelFormat: "yuv444p",
                size: "3840x2160",
                frameRates: [23.97, 24, 25, 30, 48, 50, 60],
            },
        ],
        containers: [
            {
                name: "MP4",
                extension: "mp4",
                audioCodecs: ["pcm_s16le", "pcm_s24le", "pcm_s32le"],
                audioBitrates: [128, 192, 256, 512],
                audioChannels: [1, 2, 3, 6, 8, 12],
            },
            {
                name: "Quicktime",
                extension: "mov",
                audioCodecs: ["pcm_s16le", "pcm_s24le", "pcm_s32le"],
                audioBitrates: [128, 192, 256, 512],
                audioChannels: [1, 2, 3, 6, 8, 12],
            },
        ],
    },
];
TranscodeTemplates.audioCodecs = [
    {
        name: "PCM 16-bit",
        codec: "pcm_s16le",
        extension: "wav",
    },
    {
        name: "PCM 24-bit",
        codec: "pcm_s24le",
        extension: "wav",
    },
    {
        name: "PCM 32-bit",
        codec: "pcm_s32le",
        extension: "wav",
    },
    {
        name: "AAC",
        codec: "libfdk_aac",
        extension: "aac",
    },
];
TranscodeTemplates.audioChannels = [
    {
        name: "Mono",
        channels: 1,
    },
    {
        name: "Stereo",
        channels: 2,
    },
    {
        name: "2.1",
        channels: 3,
    },
    {
        name: "5.1",
        channels: 6,
    },
    {
        name: "7.1",
        channels: 8,
    },
    {
        name: "Dolby Atmos",
        channels: 12,
    },
];
module.exports = TranscodeTemplates;
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
//# sourceMappingURL=TranscodeTemplates.js.map