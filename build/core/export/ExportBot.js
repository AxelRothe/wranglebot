var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { finder } from "../system/index.js";
import PdfPrinter from "pdfmake";
import prettyBytes from "pretty-bytes";
import prettyMilliseconds from "pretty-ms";
import { Scraper } from "../media/Scraper.js";
import { v4 as uuidv4 } from "uuid";
import { dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));
class ExportBot {
    constructor() {
        this.pathToAssets = finder.join(__dirname, "../../../assets/");
        this.assets = {
            fonts: {
                body: {
                    normal: finder.join(this.pathToAssets, "fonts", "overpass", "regular.otf"),
                    bold: finder.join(this.pathToAssets, "fonts", "overpass", "bold.otf"),
                    italics: finder.join(this.pathToAssets, "fonts", "overpass", "italic.otf"),
                    bolditalics: finder.join(this.pathToAssets, "fonts", "overpass", "bold-italic.otf"),
                },
                mono: {
                    normal: finder.join(this.pathToAssets, "fonts", "overpass-mono", "regular.otf"),
                    bold: finder.join(this.pathToAssets, "fonts", "overpass-mono", "bold.otf"),
                    light: finder.join(this.pathToAssets, "fonts", "overpass-mono", "light.otf"),
                },
            },
        };
        //keys to convert for better readability
        this.toPrettyBytes = ["video-bit-rate", "audio-bit-rate"];
        this.toPrettyTime = ["video-duration", "audio-duration"];
    }
    exportPDF(metaFiles, options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (options.paths.length === 0)
                throw new Error("No path to export to");
            try {
                // Define font files
                const printer = new PdfPrinter(this.assets.fonts);
                // Define document layout
                // thumbnail, filename, hash, size ,[...], creation date
                let widthCols = ["auto", "auto", "auto", "auto", "auto"];
                // metadata columns are dynamic
                Scraper.getColumns().forEach(() => {
                    widthCols.push("auto");
                });
                let lines = [];
                for (const file of metaFiles) {
                    let metaData = file.getMetaData();
                    let cells = [];
                    //prettify entries
                    for (const column of Scraper.getColumns()) {
                        //find the entry in the file
                        let val = metaData.entries[column.id];
                        if (!val) {
                            cells.push("");
                            continue;
                        }
                        //convert if needed
                        if (this.toPrettyTime.indexOf(column.id) >= 0) {
                            val = prettyMilliseconds(Number(val) * 1000);
                        }
                        if (this.toPrettyBytes.indexOf(column.id) >= 0) {
                            val = prettyBytes(Number(val));
                        }
                        //add to list
                        cells.push(val);
                    }
                    // add thumbnail or empty string
                    let thumbnail = "";
                    if (file.thumbnails.length > 0) {
                        thumbnail = {
                            image: "data:image/jpeg;base64," + (yield file.thumbnails[Math.floor(file.thumbnails.length / 2)].data),
                            width: 100,
                        };
                    }
                    //add line
                    lines.push([thumbnail, file.hash, file.basename, prettyBytes(file.size), ...cells, file.creationDate.toLocaleString()]);
                }
                let countOfVideoFiles = 0;
                let countOfAudioFiles = 0;
                let countOfImageFiles = 0;
                let countOfOtherFiles = 0;
                let totalSize = 0;
                let sizeOfVideoFiles = 0;
                let sizeOfAudioFiles = 0;
                let totalDuration = 0;
                let durationOfVideoFiles = 0;
                let durationOfAudioFiles = 0;
                for (const file of metaFiles) {
                    if (file.fileType === "video") {
                        countOfVideoFiles++;
                        sizeOfVideoFiles += file.size;
                        totalDuration += Number(file.getMetaData().get("video-duration"));
                        durationOfVideoFiles += Number(file.getMetaData().get("video-duration"));
                    }
                    else if (file.fileType === "audio") {
                        countOfAudioFiles++;
                        sizeOfAudioFiles += file.size;
                        totalDuration += Number(file.getMetaData().get("audio-duration"));
                        durationOfAudioFiles += Number(file.getMetaData().get("audio-duration"));
                    }
                    else if (file.fileType === "image") {
                        countOfImageFiles++;
                    }
                    else {
                        countOfOtherFiles++;
                    }
                    totalSize += file.size;
                }
                let countOfScenes = 0;
                let mapOfScenes = new Map();
                for (const file of metaFiles) {
                    if (file.fileType === "video") {
                        let scene = file.getMetaData().get("scene");
                        if (scene.length > 0) {
                            if (mapOfScenes.has(scene)) {
                                mapOfScenes.set(scene, mapOfScenes.get(scene) + 1);
                            }
                            else {
                                mapOfScenes.set(scene, 1);
                            }
                            countOfScenes++;
                        }
                    }
                }
                let totalScenesSize = 0;
                let totalScenesDuration = 0;
                let totalScenesAverageMinutes = 0;
                let totalScenesAverageMinuteToSize = 0;
                let scenes = new Map([...mapOfScenes.entries()].sort((a, b) => b[1] - a[1]));
                if (countOfScenes > 0) {
                    for (let scene of mapOfScenes.keys()) {
                        //caluclate size and duration of scene
                        let size = 0;
                        let duration = 0;
                        for (const file of metaFiles) {
                            if (file.fileType === "video" && file.getMetaData().get("scene") === scene) {
                                size += file.size;
                                duration += Number(file.getMetaData().get("video-duration"));
                                totalScenesSize += file.size;
                                totalScenesDuration += Number(file.getMetaData().get("video-duration"));
                            }
                        }
                        scenes.set(scene, { count: mapOfScenes.get(scene), size: size, duration: duration });
                    }
                    totalScenesAverageMinutes = totalScenesDuration / 60 / countOfScenes;
                    totalScenesAverageMinuteToSize = totalScenesSize / totalScenesAverageMinutes;
                }
                const docDefinition = {
                    content: [
                        {
                            columns: [
                                [
                                    {
                                        text: `${options.credits.title}`,
                                        style: "header",
                                    },
                                    {
                                        text: prettyBytes(metaFiles.reduce((a, b) => a + b.size, 0)) + " over " + metaFiles.length + " Files",
                                    },
                                    {
                                        text: `Exported on ${new Date().toLocaleString()}`,
                                    },
                                    {
                                        text: `${options.credits.owner ? "All Rights Reserved " + options.credits.owner : ""}`,
                                    },
                                ],
                                [
                                    {
                                        image: options.logo ? options.logo : this.pathToAssets + "images/logo.png",
                                        width: 64,
                                        height: 64,
                                        alignment: "right",
                                        style: "logo",
                                    },
                                    {
                                        text: [
                                            `Unique ID: ${uuidv4()}`, //add random id to prevent caching
                                        ],
                                        bold: true,
                                        alignment: "right",
                                    },
                                    {
                                        text: "Learn more at https://wranglebot.io",
                                        bold: true,
                                        link: "https://wranglebot.io",
                                        margin: [0, 20, 0, 8],
                                        alignment: "right",
                                        style: "footer",
                                    },
                                ],
                            ],
                        },
                        [
                            {
                                text: `Metafiles (${metaFiles.length})`,
                            },
                            {
                                style: "table",
                                table: {
                                    widths: widthCols,
                                    headerRows: 1,
                                    body: [["Thumbnail", "Hash", "File Name", "Size", ...Scraper.getColumnNames(), "Creation Date"], ...lines],
                                },
                                layout: "lightHorizontalLines",
                            },
                        ],
                        {
                            columns: [
                                [
                                    {
                                        text: "Summary",
                                        style: "head",
                                    },
                                    {
                                        style: "tableSummary",
                                        table: {
                                            headerRows: 1,
                                            widths: ["auto", "auto", "auto"],
                                            body: [
                                                ["", "Audio", "Video"],
                                                ["Count", countOfAudioFiles, countOfVideoFiles],
                                                ["Size", prettyBytes(sizeOfAudioFiles), prettyBytes(sizeOfVideoFiles)],
                                                ["Duration", prettyMilliseconds(durationOfAudioFiles * 1000), prettyMilliseconds(durationOfVideoFiles * 1000)],
                                            ],
                                        },
                                        layout: "lightHorizontalLines",
                                    },
                                ],
                                [
                                    {
                                        text: "Scene Breakdown",
                                        style: "head",
                                    },
                                    {
                                        style: "tableSummary",
                                        layout: "lightHorizontalLines",
                                        table: {
                                            headerRows: 1,
                                            widths: ["auto", "auto", "auto", "auto", "auto", "auto"],
                                            body: [
                                                ["Scene", "Size", "Duration", "Count", "Average Duration", "Average Minute / Size"],
                                                ...[...scenes.keys()].map((scene) => {
                                                    return [
                                                        scene, //scene name
                                                        prettyBytes(scenes.get(scene).size), //size
                                                        prettyMilliseconds(Number(scenes.get(scene).duration) * 1000), //duration
                                                        scenes.get(scene).count, //count
                                                        prettyMilliseconds((Number(scenes.get(scene).duration) * 1000) / scenes.get(scene).count), //average duration
                                                        "1m : " + prettyBytes(Number(scenes.get(scene).size) / (Number(scenes.get(scene).duration) / 60)), //1 min : size
                                                    ];
                                                }),
                                                [
                                                    "Total",
                                                    prettyBytes(totalScenesSize),
                                                    prettyMilliseconds(totalScenesDuration * 1000),
                                                    countOfScenes,
                                                    prettyMilliseconds(totalScenesAverageMinutes * 1000),
                                                    "1m : " + prettyBytes(totalScenesAverageMinuteToSize),
                                                ],
                                            ],
                                        },
                                    },
                                ],
                            ],
                        },
                    ],
                    defaultStyle: {
                        font: "body",
                    },
                    styles: {
                        header: {
                            fontSize: 18,
                            bold: true,
                        },
                        footer: {
                            fontSize: 8,
                        },
                        subheader: {
                            fontSize: 15,
                            bold: true,
                        },
                        quote: {
                            italics: true,
                        },
                        small: {
                            fontSize: 6,
                        },
                        table: {
                            fontSize: 6,
                            font: "mono",
                            margin: [0, 5, 0, 15],
                        },
                        tableSummary: {
                            fontSize: 12,
                            font: "mono",
                            margin: [0, 5, 0, 15],
                        },
                    },
                    pageSize: "A1",
                    pageOrientation: "landscape",
                };
                const docOptions = {
                // ...
                };
                for (let path of options.paths) {
                    const pdfDoc = printer.createPdfKitDocument(docDefinition, docOptions);
                    finder.mkdirSync(path, { recursive: true });
                    const writeStream = finder.createWriteStream(finder.join(path, options.fileName + (options.uniqueNames ? "_" + Date.now() : "") + ".pdf"));
                    writeStream.on("error", (e) => {
                        console.log(e);
                    });
                    try {
                        pdfDoc.pipe(writeStream);
                        pdfDoc.end();
                    }
                    catch (e) {
                        console.log(e);
                        return false;
                    }
                }
                return true;
            }
            catch (e) {
                console.log(e);
                throw e;
            }
        });
    }
}
export default new ExportBot();
//# sourceMappingURL=ExportBot.js.map