class FilterMask {
  private readonly filters: any[];
  readonly transform: Function;
  constructor(props: string[], transform: Function = (value) => value) {
    this.filters = props;
    this.transform = transform;
  }

  getFilters() {
    return this.filters;
  }
}

class Scraper {
  static EXTRACT_VIDEO = "video";
  static EXTRACT_AUDIO = "audio";

  static availableColumns = {
    /* SHOT */
    video: [
      { id: "scene", name: "Scene", mask: new FilterMask(["scene"]) },
      { id: "shot", name: "Shot", mask: new FilterMask(["shot"]) },
      { id: "take", name: "Take", mask: new FilterMask(["take"]) },
      { id: "description", name: "Description", mask: new FilterMask(["description"]) },
      { id: "comments", name: "Comments", mask: new FilterMask(["comments"]) },
      { id: "keywords", name: "Keywords", mask: new FilterMask(["keywords"]) },
      { id: "good-take", name: "Good Take", mask: new FilterMask(["good take"]) },
      { id: "creation-date", name: "Creation Date", mask: new FilterMask(["creation_date", "encoded_date", "modification_date"]) },

      /* VIDEO TECHNICAL */
      {
        id: "video-camera-index",
        name: "Camera Index",
        mask: new FilterMask(["com.arri.camera.CameraIndex"]),
      },
      {
        id: "video-camera-id",
        name: "Camera Index",
        mask: new FilterMask(["com.arri.camera.CameraId"]),
      },
      {
        id: "video-camera-sn",
        name: "Camera Index",
        mask: new FilterMask(["com.arri.camera.CameraSerialNumber"]),
      },
      { id: "reel-name", name: "Reel Name", mask: new FilterMask(["com.arri.camera.ReelName", "tags.reel_name"]) },
      { id: "video-start-tc", name: "Start TC", mask: new FilterMask(["timecode"]) },
      {
        id: "video-frames",
        name: "Frames",
        mask: new FilterMask(["nb_frames"], (value) => {
          return parseInt(value);
        }),
      },
      { id: "video-duration", name: "Duration", mask: new FilterMask(["duration"]) },
      { id: "video-bit-depth", name: "Bit Depth", mask: new FilterMask(["bits_per_raw_sample"]) },
      { id: "video-field-dominance", name: "Field Dominance", mask: new FilterMask(["field_order"]) },
      { id: "video-width", name: "Width", mask: new FilterMask(["width"]) },
      { id: "video-height", name: "Height", mask: new FilterMask(["height"]) },
      { id: "video-aspect-ratio", name: "Aspect Ratio", mask: new FilterMask(["display_aspect_ratio"]) },
      { id: "video-pixel-ratio", name: "Pixel Ratio", mask: new FilterMask(["sample_aspect_ratio"]) },
      {
        id: "video-frame-rate",
        name: "Frame Rate",
        mask: new FilterMask(["r_frame_rate"], (value) => {
          const [numerator, denominator] = value.split("/");
          return parseFloat(numerator) / parseFloat(denominator);
        }),
      },
      { id: "video-bit-rate", name: "Bit Rate", mask: new FilterMask(["bit_rate"]) },
      { id: "video-codec", name: "Codec", mask: new FilterMask(["codec_long_name"]) },
      { id: "video-format", name: "Container", mask: new FilterMask(["format_long_name"]) },
      {
        id: "video-subsampling",
        name: "Chroma Subsampling",
        mask: new FilterMask(["profile"]),
      },

      /* VIDEO CREATIVE */
      {
        id: "video-camera-model",
        name: "Camera Model",
        mask: new FilterMask(["com.arri.camera.CameraModel", "product_name"]),
      },
      {
        id: "video-shutter-angle",
        name: "Shutter Angle",
        mask: new FilterMask(["com.arri.camera.ShutterAngle"]),
      },

      {
        id: "video-white-balance-kelvin",
        name: "White Balance",
        mask: new FilterMask(["com.arri.camera.WhiteBalanceKelvin"]),
      },
      {
        id: "white-balance-tint",
        name: "Tint",
        mask: new FilterMask(["com.arri.camera.WhiteBalanceTintCc"]),
      },
      {
        id: "video-color-space",
        name: "Color Space",
        mask: new FilterMask(["ColorSpace", "color_primaries"]),
      },
      {
        id: "video-gamma",
        name: "Gamma Curve",
        mask: new FilterMask(["com.arri.camera.ColorGammaSxS"]),
      },
      { id: "video-iso", name: "ISO", mask: new FilterMask(["com.arri.camera.ExposureIndexAsa"]) },
      { id: "video-lut", name: "LUT", mask: new FilterMask(["com.arri.camera.look.name"]) },
      { id: "video-neutral-density", name: "ND", mask: new FilterMask(["com.arri.camera.NdFilterDensity"]) },

      {
        id: "video-camera-firmware",
        name: "Firmware",
        mask: new FilterMask(["com.arri.camera.SupVersion", "product_version"]),
      },
    ],
    audio: [
      {
        id: "audio-codec",
        name: "Audio Codec",
        mask: new FilterMask(["codec_long_name"]),
      },
      {
        id: "audio-channels",
        name: "Audio Channels",
        mask: new FilterMask(["channels"]),
      },
      {
        id: "audio-channel-positions",
        name: "Audio Channel Pos",
        mask: new FilterMask(["channel_positions"]),
      },
      {
        id: "audio-sample-rate",
        name: "Audio Sample Rate",
        mask: new FilterMask(["sample_rate"]),
      },
      {
        id: "audio-duration",
        name: "Audio Duration",
        mask: new FilterMask(["duration"]),
      },
      {
        id: "audio-bit-rate",
        name: "Audio Bitrate",
        mask: new FilterMask(["bits_per_sample"]),
      },
    ],
  };
  private parsedMetaData = {};

  static getColumnNames() {
    let list: any = [];
    for (let entry of Scraper.availableColumns.video) {
      list.push(entry.name);
    }
    for (let entry of Scraper.availableColumns.audio) {
      list.push(entry.name);
    }
    return list;
  }

  static getColumns() {
    let list: any = [];
    for (let entry of Scraper.availableColumns.video) {
      list.push({
        id: entry.id,
        name: entry.name,
        filters: entry.mask.getFilters(),
      });
    }
    for (let entry of Scraper.availableColumns.audio) {
      list.push({
        id: entry.id,
        name: entry.name,
        filters: entry.mask.getFilters(),
      });
    }
    return list;
  }

  private extract(extractor, entry, rawMetaData) {
    if (entry.mask) {
      for (let mask of entry.mask.getFilters()) {
        if (extractor === Scraper.EXTRACT_VIDEO) {
          for (let [key, value] of Object.entries(rawMetaData)) {
            if (key === mask) {
              if (value === "N/A" || value === "unknown") return undefined;
              return entry.mask.transform(value);
            }
          }
        } else if (extractor === Scraper.EXTRACT_AUDIO) {
          for (let [key, value] of Object.entries(rawMetaData)) {
            if (value === "N/A" || value === "unknown") return undefined;
            if (key === mask) return entry.mask.transform(value);
          }
        }
      }
      return undefined;
    }
  }

  parse(raw) {
    if (!raw.streams) return {};
    if (raw.streams.length === 0) throw new Error("No streams found in metadata");

    let videoStream = raw.streams.find((stream) => stream.codec_type === "video");
    let audioStreams = raw.streams.filter((stream) => stream.codec_type === "audio");
    let format = raw.format;
    let tags = format.tags;

    for (let entry of Scraper.availableColumns.video) {
      this.parsedMetaData[entry.id] =
        this.extract(Scraper.EXTRACT_VIDEO, entry, videoStream) ||
        this.extract(Scraper.EXTRACT_VIDEO, entry, format) ||
        this.extract(Scraper.EXTRACT_VIDEO, entry, tags) ||
        "";
    }

    for (let entry of Scraper.availableColumns.audio) {
      for (let audioStream of audioStreams) {
        this.parsedMetaData[entry.id] = this.extract(Scraper.EXTRACT_AUDIO, entry, audioStream) || "";
      }
    }

    return this.parsedMetaData;
  }
}
export default new Scraper();
export { Scraper };
