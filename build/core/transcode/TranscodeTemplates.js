class TranscodeTemplates {
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
        const codecTemplate = TranscodeTemplates.getCodec(codec);
        if (!codecTemplate)
            throw new Error("Codec not found");
        return codecTemplate.containers.map((c) => {
            return Object.assign(Object.assign({}, c), { audioCodecs: TranscodeTemplates.mapAudioCodecs(c), audioChannels: TranscodeTemplates.mapAudioChannels(c) });
        });
    }
    static getAvailableFlavours(codec) {
        const codecTemplate = TranscodeTemplates.getCodec(codec);
        if (!codecTemplate)
            throw new Error("Codec not found");
        return codecTemplate.flavours;
    }
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
export default TranscodeTemplates;
//# sourceMappingURL=TranscodeTemplates.js.map