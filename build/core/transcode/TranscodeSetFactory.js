"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
class TranscodeSetFactory extends events_1.EventEmitter {
    constructor(transcodes) {
        super();
        this.transcodes = transcodes;
        this.transcodes.forEach((transcode) => {
            transcode.on("progress", (progress) => {
                this.emit("progress", progress);
            });
        });
    }
    runOne(transcode) {
        return new Promise((resolve, reject) => {
            transcode.on("error", (err) => {
                this.emit("error", err);
                reject(err);
            });
            transcode.on("end", (type) => {
                resolve(type);
            });
            transcode.run();
        });
    }
    run() {
        return new Promise((resolve, reject) => {
            let i = 0;
            const tick = () => {
                if (i >= this.transcodes.length) {
                    resolve(true);
                }
                else {
                    this.runOne(this.transcodes[i]).then(() => {
                        i++;
                        tick();
                    });
                }
            };
            tick();
        });
    }
}
exports.default = TranscodeSetFactory;
//# sourceMappingURL=TranscodeSetFactory.js.map