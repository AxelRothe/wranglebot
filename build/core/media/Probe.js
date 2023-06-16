import ffmpeg from "fluent-ffmpeg";
import { path as ffprobePath } from "@ffprobe-installer/ffprobe";
ffmpeg.setFfprobePath(ffprobePath);
export default class Probe {
    static analyse(path) {
        return new Promise((resolve, reject) => {
            ffmpeg.ffprobe(path, (err, metadata) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(metadata);
                }
            });
        });
    }
}
//# sourceMappingURL=Probe.js.map