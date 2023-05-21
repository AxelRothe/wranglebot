class FilterMask {
  private readonly filters: any[];
  constructor(...args) {
    this.filters = args;
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
      { id: "scene", name: "Scene", mask: new FilterMask("Scene") },
      { id: "shot", name: "Shot", mask: new FilterMask("Shot") },
      { id: "take", name: "Take", mask: new FilterMask("Take") },
      { id: "description", name: "Description", mask: new FilterMask("Description") },
      { id: "comments", name: "Comments", mask: new FilterMask("Comments") },
      { id: "keywords", name: "Keywords", mask: new FilterMask("Keywords") },
      { id: "good-take", name: "Good Take", mask: new FilterMask("Good Take") },
      { id: "creation-date", name: "Creation Date", mask: new FilterMask("Encoded_Date") },

      /* VIDEO TECHNICAL */
      {
        id: "video-camera-index",
        name: "Camera Index",
        mask: new FilterMask("com_arri_camera_CameraIndex"),
      },
      { id: "reel-name", name: "Reel Name", mask: new FilterMask("com_arri_camera_ReelName", "Title") },
      { id: "video-start-tc", name: "Start TC", mask: new FilterMask("TimeCode_FirstFrame") },
      { id: "video-frames", name: "Frames", mask: new FilterMask("FrameCount") },
      { id: "video-duration", name: "Duration", mask: new FilterMask("Duration") },
      { id: "video-bit-depth", name: "Bit Depth", mask: new FilterMask("ChromaSubsampling") },
      { id: "video-field-dominance", name: "Field Dominance", mask: new FilterMask("ScanType") },
      { id: "video-width", name: "Width", mask: new FilterMask("Width", "Sampled_Width") },
      { id: "video-height", name: "Height", mask: new FilterMask("Height", "Sampled_Height") },
      { id: "video-aspect-ratio", name: "Aspect Ratio", mask: new FilterMask("DisplayAspectRatio") },
      { id: "video-pixel-ratio", name: "Pixel Ratio", mask: new FilterMask("PixelAspectRatio") },
      { id: "video-frame-rate", name: "Frame Rate", mask: new FilterMask("FrameRate") },
      { id: "video-bit-rate", name: "Bit Rate", mask: new FilterMask("BitRate") },
      { id: "video-codec", name: "Codec", mask: new FilterMask("Format") },
      {
        id: "video-subsampling",
        name: "Chroma Subsampling",
        mask: new FilterMask("ChromaSubsampling"),
      },

      /* VIDEO CREATIVE */
      {
        id: "video-camera-model",
        name: "Camera Model",
        mask: new FilterMask("com_arri_camera_CameraModel"),
      },
      {
        id: "video-shutter-angle",
        name: "Shutter Angle",
        mask: new FilterMask("com_arri_camera_ShutterAngle"),
      },
      {
        id: "video-white-balance-kelvin",
        name: "White Balance",
        mask: new FilterMask("com_arri_camera_WhiteBalanceKelvin"),
      },
      {
        id: "white-balance-tint",
        name: "Tint",
        mask: new FilterMask("com_arri_camera_WhiteBalanceTintCc"),
      },
      {
        id: "video-color-space",
        name: "Color Space",
        mask: new FilterMask("ColorSpace", "colour_primaries"),
      },
      {
        id: "gamma",
        name: "Gamma Curve",
        mask: new FilterMask("com_arri_camera_ColorGammaSxS"),
      },
      { id: "video-iso", name: "ISO", mask: new FilterMask("com_arri_camera_ExposureIndexAsa") },
      { id: "video-lut", name: "LUT", mask: new FilterMask("com_arri_camera_look_name") },
    ],
    audio: [
      {
        id: "audio-codec",
        name: "Audio Codec",
        mask: new FilterMask("Format", "CodecID"),
      },
      {
        id: "audio-channels",
        name: "Audio Channels",
        mask: new FilterMask("Channels"),
      },
      {
        id: "audio-channel-positions",
        name: "Audio Channel Pos",
        mask: new FilterMask("ChannelPositions"),
      },
      {
        id: "audio-sample-rate",
        name: "Audio Sample Rate",
        mask: new FilterMask("SamplingRate"),
      },
      {
        id: "audio-duration",
        name: "Audio Duration",
        mask: new FilterMask("Duration"),
      },
      {
        id: "audio-bit-rate",
        name: "Audio Bitrate",
        mask: new FilterMask("BitRate"),
      },
    ],
  };
  parsedMetaData = {};

  getColumnNames() {
    let list: any = [];
    for (let entry of Scraper.availableColumns.video) {
      list.push(entry.name);
    }
    for (let entry of Scraper.availableColumns.audio) {
      list.push(entry.name);
    }
    return list;
  }

  getColumns() {
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

  parse(rawMetaData) {
    let start = Date.now();

    let metaDataTracks = {
      video: {},
      audio: {},
    };

    if (rawMetaData.media) {
      for (let track of rawMetaData.media.track) {
        if (track["@type"] === "General" || track["@type"] === "Video" || track["@type"] === "Other") {
          let temp = track;
          if (track["extra"]) {
            temp = { ...track, ...track["extra"] };
            delete temp.extra;
          }

          metaDataTracks.video = { ...metaDataTracks.video, ...temp };
        } else if (track["@type"] === "Audio") {
          metaDataTracks.audio = { ...metaDataTracks.audio, ...track };
        }
      }

      for (let entry of Scraper.availableColumns.video) {
        this.parsedMetaData[entry.id] = this.extract(Scraper.EXTRACT_VIDEO, entry, metaDataTracks);
      }
      for (let entry of Scraper.availableColumns.audio) {
        this.parsedMetaData[entry.id] = this.extract(Scraper.EXTRACT_AUDIO, entry, metaDataTracks);
      }
    } else {
      this.parsedMetaData = [];
    }

    return this.parsedMetaData;
  }

  extract(extractor, entry, rawMetaData) {
    if (entry.mask) {
      for (let mask of entry.mask.getFilters()) {
        let search;
        if (extractor === Scraper.EXTRACT_VIDEO) {
          for (let [key, value] of Object.entries(rawMetaData.video)) {
            if (key === mask) return value;
          }
        } else if (extractor === Scraper.EXTRACT_AUDIO) {
          for (let [key, value] of Object.entries(rawMetaData.audio)) {
            if (key === mask) return value;
          }
        }
      }
      //console.log("did not find " + entry.mask.getFilters());
      return "";
    }
  }
}
export default new Scraper();
