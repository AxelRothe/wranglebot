"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const systeminformation_1 = __importDefault(require("systeminformation"));
const eject_media_1 = __importDefault(require("eject-media"));
const check_disk_space_1 = __importDefault(require("check-disk-space"));
const write_file_atomic_1 = require("write-file-atomic");
const logbotjs_1 = __importDefault(require("logbotjs"));
const cryptr_1 = __importDefault(require("cryptr"));
class Finder {
    constructor() {
        this.cryptr = new cryptr_1.default("b2909139-4cdc-46d6-985c-3726ede95335"); //this is just for obfuscation
        this.supportedPlatforms = {
            win32: "Windows",
            darwin: "MacOS",
            linux: "linux",
        };
        this.platform = os_1.default.platform();
        if (this.supportedPlatforms[this.platform]) {
            logbotjs_1.default.log(200, "Detected supported Platform: " + this.supportedPlatforms[this.platform]);
        }
        else {
            logbotjs_1.default.log(424, "Detected a non supported Platform. Please start this app on a supported Platform: MacOS x64");
        }
        switch (this.platform) {
            case "win32":
                this.pathToVolumes = "";
                break;
            case "darwin":
                this.pathToVolumes = "/Volumes/";
                break;
            case "linux":
                this.pathToVolumes = "/media/" + os_1.default.userInfo().username + "/";
                break;
            default:
                this.pathToVolumes = "/";
        }
    }
    isMac() {
        return this.platform === "darwin";
    }
    isWindows() {
        return this.platform === "win32";
    }
    isLinux() {
        return this.platform === "linux";
    }
    openInFinder(path, callback) {
        if (this.isMac()) {
            const { exec } = require("child_process");
            exec("open '" + path + "'", callback);
        }
        else if (this.isWindows()) {
            const { exec } = require("child_process");
            exec("explorer '" + path + "'", callback);
        }
        else if (this.isLinux()) {
            const { exec } = require("child_process");
            exec("xdg-open  '" + path + "'", callback);
        }
    }
    /**
     * @typedef {Object} DriveOptions
     * @property {string} label
     * @property {string} path
     * @property {string} serialNumber
     * @property {string} interface
     * @property {boolean} removable
     */
    /**
     *
     * @return {Promise<DriveOptions>}
     */
    getDisks() {
        return new Promise((resolve) => {
            systeminformation_1.default.fsSize().then((r) => {
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
                systeminformation_1.default.diskLayout().then((diskLayout) => {
                    for (let device of blockDevices) {
                        for (let disk of diskLayout) {
                            if (device.fs.includes(disk.device) || // if the device is a disk
                                (device.mount === "/" && disk.device === "disk0") //is this a macos disk?
                            ) {
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
    /**
     * @typedef {Object} DriveScan
     * @property {string} uuid
     * @property {string} productName
     * @property {string} label
     */
    /**
     * Scans a drive at the mountpoint and returns meta data
     *
     * @param mount
     * @return {Promise<DriveScan>}
     */
    scanDrive(mount) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                systeminformation_1.default.blockDevices().then((r) => {
                    for (let device of r) {
                        if (device.mount === mount) {
                            resolve(device);
                        }
                    }
                });
            });
        });
    }
    /**
     * Retrieve all folders with subfolders within a folder
     *
     * @param {string} sourcePath
     * @param {number} limit max level of subfolders
     * @param {number} index
     * @return {String[]} the array of absolute folder paths
     */
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
    getPathToVolumes() {
        return this.pathToVolumes;
    }
    getPathToUserData(path = "") {
        return this.join(os_1.default.homedir(), path);
    }
    /**
     *
     * @param pathToElement
     * @return {boolean}
     */
    access(pathToElement) {
        try {
            fs_1.default.accessSync(pathToElement.toString());
            return true;
        }
        catch (e) {
            return false;
        }
    }
    /**
     * Returns whether a path is reachable for this app
     *
     * @param path
     * @returns {boolean}
     */
    isReachable(path) {
        try {
            const elements = path.split("/");
            for (let el of elements) {
                if (el === "")
                    elements.splice(elements.indexOf(el), 1);
            }
            //works for unix and macos
            return this.existsSync("/" + elements[0] + "/" + elements[1]);
        }
        catch (e) {
            console.error(e);
            return false;
        }
    }
    /**
     * Returns whether a path exists, can be file or folder
     * use isDirectory to check for type
     *
     * @param pathToElement
     * @returns {boolean}
     */
    existsSync(pathToElement) {
        return fs_1.default.existsSync(pathToElement);
    }
    /**
     * returns if a file is in the home directory
     * @param pathToElement
     * @returns {boolean}
     */
    exists(pathToElement) {
        return fs_1.default.existsSync(this.join(this.getPathToUserData("wranglebot"), pathToElement));
    }
    check(...elements) {
        const path = this.join(...elements);
        return this.existsSync(path);
    }
    /**
     * Creates a new folder
     *
     * @param pathToNewFolder
     * @param options? {object|undefined}
     * @returns {boolean}
     */
    mkdirSync(pathToNewFolder, options = {}) {
        try {
            fs_1.default.mkdirSync(pathToNewFolder, options);
            return true;
        }
        catch (e) {
            return false;
        }
    }
    /**
     * Gets file stats
     * @deprecated use lstatSync instead
     * @param pathToElement
     * @returns {*}
     */
    statSync(pathToElement) {
        return fs_1.default.statSync(pathToElement);
    }
    /**
     * Gets file stats
     * @param pathToElement
     * @returns {*}
     */
    lstatSync(pathToElement) {
        return fs_1.default.lstatSync(pathToElement);
    }
    createReadStream(pathToElement, options) {
        return fs_1.default.createReadStream(pathToElement, options);
    }
    createWriteStream(pathToElement, options = {}) {
        return fs_1.default.createWriteStream(pathToElement, options);
    }
    readdirSync(pathToFolder) {
        return fs_1.default.readdirSync(pathToFolder);
    }
    /**
     * Reads a File
     *
     * @param {string} pathToElement
     */
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
    /**
     * Writes to a file
     * @param pathToNewElement
     * @param content
     * @param callback
     */
    writeFile(pathToNewElement, content, callback) {
        fs_1.default.writeFile(pathToNewElement, content, callback);
    }
    /**
     * Writes to a file synchronously
     * @param pathToElement
     * @param content
     * @param options?
     */
    writeFileSync(pathToElement, content, options = undefined) {
        this.mkdirSync(this.dirname(pathToElement), { recursive: true });
        return (0, write_file_atomic_1.sync)(pathToElement, content, options);
    }
    save(fileName, content, encrypt = false) {
        try {
            let data = JSON.stringify(content);
            if (encrypt) {
                data = this.encrypt(data);
            }
            this.writeFileSync(this.join(this.getPathToUserData("wranglebot"), fileName), data);
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
            const createWriteStream = fs_1.default.createWriteStream(this.join(this.getPathToUserData("wranglebot"), fileName));
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
            let contentOfFile = this.readFileSync(this.join(this.getPathToUserData("wranglebot"), fileName)).toString();
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
    /**
     * Reads a File
     *
     * @param pathToElement
     * @returns {Buffer}
     */
    readFileSync(pathToElement) {
        return fs_1.default.readFileSync(pathToElement);
    }
    parseFileSync(pathToElement) {
        return JSON.parse(this.readFileSync(pathToElement).toString());
    }
    rmSync(pathToElementToRemove) {
        return fs_1.default.rmSync(pathToElementToRemove, { recursive: true, force: true });
    }
    basename(pathToElement) {
        return path_1.default.basename(pathToElement);
    }
    label(pathToElement) {
        return this.basename(pathToElement).split(".")[0];
    }
    extname(pathToElement) {
        return path_1.default.extname(pathToElement);
    }
    dirname(pathToElement) {
        return path_1.default.dirname(pathToElement);
    }
    join(...paths) {
        return path_1.default.join(...paths);
    }
    watch(pathToFolder, callback) {
        return fs_1.default.watch(pathToFolder, callback);
    }
    checkDiskSpace(pathToDevice) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                (0, check_disk_space_1.default)(pathToDevice)
                    .then((diskSpace) => {
                    resolve(diskSpace);
                })
                    .catch((err) => {
                    resolve({});
                });
            });
        });
    }
    /**
     * ejects a drive
     *
     * @param pathToDevice
     * @param callback
     */
    eject(pathToDevice, callback) {
        eject_media_1.default.eject(pathToDevice, callback);
    }
    getVolumeMountpoint(stringToParse) {
        const pathArray = stringToParse.split("/");
        pathArray.shift();
        return "/" + pathArray[0] + "/" + pathArray[1];
    }
    getVolumeName(pathToElement) {
        let path = pathToElement.split("/");
        if (this.platform === "darwin" && path[1] === "Volumes") {
            return path[2];
        }
        if (this.platform === "darwin" && path[1] !== "Volumes") {
            return "Internal";
        }
        return "unknown volume";
    }
    /**
     * Returns the file type of the given path
     *
     * @param filename {string} the path to the file
     * @returns {'photo'|'video'|'audio'|'sidecar'}
     */
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
    /**
     * Returns the items of a folder
     * @param {String} pathToFolder Absolute Path to Folder
     * @param options
     */
    getContentOfFolder(pathToFolder, options = {
        showHidden: false,
        filters: "both",
        recursive: false,
        depth: 10,
    }) {
        try {
            let list = fs_1.default.readdirSync(pathToFolder);
            if (!options.showHidden) {
                //remove all files that start with a dot
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
    /**
     * Returns true if the given path is a folder
     * @param path
     * @returns {false|*}
     */
    isDirectory(path) {
        return this.isDir(path);
    }
    /**
     * Checks if the path is a directory
     * @param elements
     * @returns {false|*}
     */
    isDir(...elements) {
        const path = this.join(...elements);
        try {
            //check if the path exists
            fs_1.default.accessSync(path, fs_1.default.constants.F_OK);
            //check if the path is a directory
            return fs_1.default.lstatSync(path).isDirectory();
        }
        catch (e) {
            return false;
        }
    }
    /**
     * Rename a file or folder
     *
     * @param pathToElement
     * @param newName
     */
    rename(pathToElement, newName) {
        const newPath = this.join(this.dirname(pathToElement), newName + this.extname(pathToElement));
        return fs_1.default.renameSync(pathToElement, newPath);
    }
    copy(pathToElement, newPath) {
        return fs_1.default.copyFileSync(pathToElement, newPath);
    }
    /**
     * Move a file or folder
     *
     * @param pathToElement
     * @param newFolder
     */
    move(pathToElement, newFolder) {
        return fs_1.default.renameSync(pathToElement, this.join(newFolder, this.basename(pathToElement)));
    }
    /**
     * Rename a file and move it, returns true if the file was moved
     *
     * @param pathToElement
     * @param newName
     * @param newFolder
     * @returns {boolean}
     */
    renameAndMove(pathToElement, newName, newFolder) {
        const newPath = this.join(newFolder, newName + this.extname(pathToElement));
        fs_1.default.renameSync(pathToElement, newPath);
        return fs_1.default.existsSync(newPath);
    }
    getVolumePath(filePath) {
        const root = path_1.default.parse(filePath).root;
        if (this.platform === "darwin" && root === "/") {
            return `/${path_1.default.parse(filePath).dir.split(path_1.default.sep)[1]}/${path_1.default.parse(filePath).dir.split(path_1.default.sep)[2]}`;
        }
        if (this.platform === "linux" && root === "/") {
            return `/media/${process.env.USER}/${path_1.default.parse(filePath).dir.split(path_1.default.sep)[3]}`;
        }
        return root;
    }
}
const finder = new Finder();
exports.default = finder;
//# sourceMappingURL=finder.js.map