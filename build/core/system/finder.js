var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import os from "os";
import path from "path";
import fs from "fs";
import si from "systeminformation";
import ejectMedia from "eject-media";
import checkDiskSpace from "check-disk-space";
import { sync as writeFileAtomicSync } from "write-file-atomic";
import LogBot from "logbotjs";
import Cryptr from "cryptr";
import { exec } from "child_process";
import config from "./Config.js";
class Finder {
    constructor() {
        this.cryptr = new Cryptr("b2909139-4cdc-46d6-985c-3726ede95335");
        this.supportedPlatforms = {
            darwin: "MacOS",
            linux: "linux",
        };
        this.platform = os.platform();
        this.pathToVolumes = "/";
        if (this.supportedPlatforms[this.platform]) {
            LogBot.log(200, "Detected supported Platform: " + this.supportedPlatforms[this.platform]);
        }
        else {
            throw new Error("Detected a non supported Platform. Please start this app on a supported Platform: " + Object.values(this.supportedPlatforms));
        }
        switch (this.platform) {
            case "darwin":
                this.pathToVolumes = "/volumes/";
                break;
            case "linux":
                this.pathToVolumes = "/media/" + os.userInfo().username + "/";
                break;
        }
    }
    isMac() {
        return this.platform === "darwin";
    }
    isLinux() {
        return this.platform === "linux";
    }
    openInFinder(path, callback) {
        if (this.isMac()) {
            exec("open '" + path + "'", callback);
        }
        else if (this.isLinux()) {
            exec("xdg-open  '" + path + "'", callback);
        }
    }
    getDisks() {
        return new Promise((resolve) => {
            si.fsSize().then((r) => {
                let blockDevices = r.filter((element) => {
                    return element.mount.toLowerCase().startsWith(this.pathToVolumes.toLowerCase());
                });
                blockDevices = blockDevices.map((d) => {
                    d = Object.assign(d, {
                        partition: d.type,
                        type: undefined,
                        interface: "software",
                        serialNumber: "NaN",
                        host: "Generic Host Controller",
                    });
                    return d;
                });
                si.diskLayout().then((diskLayout) => {
                    for (let device of blockDevices) {
                        for (let disk of diskLayout) {
                            if (device.fs.includes(disk.device) ||
                                (device.mount === "/" && disk.device === "disk0")) {
                                device = Object.assign(device, {
                                    type: disk.type,
                                    host: disk.name,
                                    serialNumber: disk.serialNum,
                                    interface: disk.interfaceType,
                                });
                                break;
                            }
                        }
                    }
                    resolve(blockDevices);
                });
            });
        });
    }
    getMountPoint(pathToElement) {
        const elements = pathToElement.split("/");
        for (let el of elements) {
            if (el === "")
                elements.splice(elements.indexOf(el), 1);
        }
        return "/" + elements[0] + "/" + elements[1];
    }
    getFolders(sourcePath, limit, index = 0) {
        let matches = [];
        const paths = this.getContentOfFolder(sourcePath);
        for (let path of paths) {
            const fullPath = this.join(sourcePath, path);
            if (this.existsSync(fullPath) && this.isDirectory(fullPath) && path.charAt(0) !== "." && path.indexOf(".app") === -1) {
                if (index <= limit) {
                    matches = [...matches, fullPath, ...this.getFolders(fullPath, limit, index + 1)];
                }
                else {
                    matches.push(fullPath);
                }
            }
        }
        return matches;
    }
    getPathToUserData(subPath = "") {
        return path.join(config.getPathToUserData(), subPath);
    }
    access(pathToElement) {
        try {
            fs.accessSync(pathToElement.toString());
            return true;
        }
        catch (e) {
            return false;
        }
    }
    isReachable(path) {
        try {
            const elements = path.split("/");
            for (let el of elements) {
                if (el === "")
                    elements.splice(elements.indexOf(el), 1);
            }
            return this.existsSync("/" + elements[0] + "/" + elements[1]);
        }
        catch (e) {
            console.error(e);
            return false;
        }
    }
    existsSync(pathToElement) {
        return fs.existsSync(pathToElement);
    }
    exists(pathToElement) {
        return fs.existsSync(this.join(this.getPathToUserData(), pathToElement));
    }
    check(...elements) {
        const path = this.join(...elements);
        return this.existsSync(path);
    }
    mkdirSync(pathToNewFolder, options = {}) {
        try {
            fs.mkdirSync(pathToNewFolder, options);
            return true;
        }
        catch (e) {
            return false;
        }
    }
    statSync(pathToElement) {
        return fs.statSync(pathToElement);
    }
    lstatSync(pathToElement) {
        return fs.lstatSync(pathToElement);
    }
    createReadStream(pathToElement, options) {
        return fs.createReadStream(pathToElement, options);
    }
    createWriteStream(pathToElement, options = {}) {
        return fs.createWriteStream(pathToElement, options);
    }
    readdirSync(pathToFolder) {
        return fs.readdirSync(pathToFolder);
    }
    readFile(pathToElement) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                const readStream = this.createReadStream(pathToElement, { encoding: "utf8" });
                let file = "";
                readStream.on("data", (chunk) => {
                    file += chunk;
                });
                readStream.on("end", () => {
                    resolve(JSON.parse(file));
                });
            });
        });
    }
    writeFile(pathToNewElement, content, callback) {
        fs.writeFile(pathToNewElement, content, callback);
    }
    writeFileSync(pathToElement, content, options = undefined) {
        this.mkdirSync(this.dirname(pathToElement), { recursive: true });
        return writeFileAtomicSync(pathToElement, content, options);
    }
    save(fileName, content, encrypt = false) {
        try {
            let data = JSON.stringify(content);
            if (encrypt) {
                data = this.encrypt(data);
            }
            this.writeFileSync(this.join(this.getPathToUserData(), fileName), data);
            return true;
        }
        catch (e) {
            console.error("Failed to save file", e);
            throw e;
        }
    }
    saveAsync(fileName, content, encrypt = false) {
        return new Promise((resolve, reject) => {
            let data = JSON.stringify(content);
            if (encrypt) {
                data = this.encrypt(data);
            }
            const createWriteStream = fs.createWriteStream(this.join(this.getPathToUserData(), fileName));
            createWriteStream.write(data);
            createWriteStream.end();
            createWriteStream.on("finish", () => {
                createWriteStream.close();
                resolve(true);
            });
            createWriteStream.on("error", (e) => {
                createWriteStream.close();
                reject(e);
            });
        });
    }
    encrypt(data) {
        return this.cryptr.encrypt(data);
    }
    decrypt(data) {
        return this.cryptr.decrypt(data);
    }
    load(fileName, decrypt = false) {
        try {
            let contentOfFile = this.readFileSync(this.join(this.getPathToUserData(), fileName)).toString();
            if (decrypt) {
                contentOfFile = this.decrypt(contentOfFile);
            }
            return JSON.parse(contentOfFile);
        }
        catch (e) {
            console.error("Failed to read file " + fileName);
            throw e;
        }
    }
    readFileSync(pathToElement) {
        return fs.readFileSync(pathToElement);
    }
    parseFileSync(pathToElement) {
        return JSON.parse(this.readFileSync(pathToElement).toString());
    }
    rmSync(pathToElementToRemove) {
        return fs.rmSync(pathToElementToRemove, { recursive: true, force: true });
    }
    basename(pathToElement) {
        return path.basename(pathToElement);
    }
    label(pathToElement) {
        return this.basename(pathToElement).split(".")[0];
    }
    extname(pathToElement) {
        return path.extname(pathToElement);
    }
    dirname(pathToElement) {
        return path.dirname(pathToElement);
    }
    join(...paths) {
        return path.join(...paths);
    }
    watch(pathToFolder, callback) {
        return fs.watch(pathToFolder, callback);
    }
    checkDiskSpace(pathToDevice) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                checkDiskSpace(pathToDevice)
                    .then((diskSpace) => {
                    resolve(diskSpace);
                })
                    .catch((err) => {
                    resolve({});
                });
            });
        });
    }
    eject(pathToDevice, callback) {
        ejectMedia.eject(pathToDevice, callback);
    }
    getFileType(filename) {
        let type = this.extname(filename);
        if (type.match(/(webm)|(mkv)|(vob)|(ogv)|(ogg)|(gif)|(gifv)|(avi)|(mts)|(m2ts)|(ts)|(mov)|(qt)|(wmv)|(mp4)|(m4p)|(mpeg)|(m4v)|(mpg)|(mpg2)|(mpe)|(mpv)|(m2v)|(3gp)|(3gp2)|(mxf)|(flv)/gim)) {
            return "video";
        }
        if (type.match(/(r3d)|(braw)/gim)) {
            return "video-raw";
        }
        if (type.match(/(aa)|(aac)|(aax)|(act)|(aiff)|(alac)|(amr)|(ape)|(au)|(awb)|(dvf)|(flac)|(m4a)|(m4b)|(m4p)|(mp3)|(mpc)|(msv)|(nmf)|(ogg)|(oga)|(mogg)|(opus)|(wav)|(wma)/gim)) {
            return "audio";
        }
        if (type.match(/(png)|(bmp)|(gif)|(gifv)|(avif)|(jpeg)|(jpg)|(svg)|(webp)/gim)) {
            return "photo";
        }
        return "sidecar";
    }
    getContentOfFolder(pathToFolder, options = {
        showHidden: false,
        filters: "both",
        recursive: false,
        depth: 10,
    }) {
        try {
            let list = fs.readdirSync(pathToFolder);
            if (!options.showHidden) {
                list = list.filter((item) => !item.startsWith("."));
            }
            if (options.filters === "files") {
                list = list.filter((item) => !this.isDir(pathToFolder, item));
            }
            if (options.filters === "folders") {
                list = list.filter((item) => this.isDir(pathToFolder, item));
            }
            return list;
        }
        catch (e) {
            return [];
        }
    }
    isDirectory(path) {
        return this.isDir(path);
    }
    isDir(...elements) {
        const path = this.join(...elements);
        try {
            fs.accessSync(path, fs.constants.F_OK);
            return fs.lstatSync(path).isDirectory();
        }
        catch (e) {
            return false;
        }
    }
    rename(pathToElement, newName) {
        const newPath = this.join(this.dirname(pathToElement), newName + this.extname(pathToElement));
        return fs.renameSync(pathToElement, newPath);
    }
    copy(pathToElement, newPath) {
        return fs.copyFileSync(pathToElement, newPath);
    }
    move(pathToElement, newFolder) {
        return fs.renameSync(pathToElement, this.join(newFolder, this.basename(pathToElement)));
    }
    renameAndMove(pathToElement, newName, newFolder) {
        const newPath = this.join(newFolder, newName + this.extname(pathToElement));
        fs.renameSync(pathToElement, newPath);
        return fs.existsSync(newPath);
    }
    getVolumePath(stringToParse) {
        const volumeName = this.getVolumeName(stringToParse);
        return this.join(this.pathToVolumes, volumeName);
    }
    getVolumeName(pathToElement) {
        try {
            let path = pathToElement.split("/");
            let element = path[1].toLowerCase();
            if (this.platform === "darwin") {
                if (element === "volumes")
                    return path[2];
                if (element === "users")
                    return "Macintosh HD";
            }
            if (this.platform === "linux") {
                if (element === "media")
                    return path[2];
                if (element === "home") {
                    return "/";
                }
            }
            throw new Error("incompatible path to a volume");
        }
        catch (e) {
            throw e;
        }
    }
}
const finder = new Finder();
export default finder;
//# sourceMappingURL=finder.js.map