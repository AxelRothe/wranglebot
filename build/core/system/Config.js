"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const fs_1 = __importDefault(require("fs"));
const ezyrnd_1 = require("ezyrnd");
const logbotjs_1 = __importDefault(require("logbotjs"));
const finder_1 = __importDefault(require("./finder"));
const cryptr_1 = __importDefault(require("cryptr"));
const write_file_atomic_1 = require("write-file-atomic");
class Config {
    constructor() {
        this.appName = "wranglebot";
        this.versionNumber = "9";
        this.cryptr = new cryptr_1.default("c9b7fd52-e1c7-4c23-9e7f-75639b91f276");
        /**
         * Build
         */
        const build = () => {
            if (!finder_1.default.existsSync(finder_1.default.getPathToUserData(this.appName))) {
                finder_1.default.mkdirSync(finder_1.default.getPathToUserData(this.appName));
                if (!finder_1.default.existsSync(finder_1.default.getPathToUserData(this.appName))) {
                    logbotjs_1.default.log(500, "Unable to create config directory. No permissions?");
                    process.exit(1);
                }
                else {
                    logbotjs_1.default.log(100, "Creating new config in homedir...");
                }
            }
            else {
                logbotjs_1.default.log(100, "Loading config from homedir...");
            }
        };
        build();
        //copy luts to homedir
        let pathToLUTs = this.getPathToUserData() + "/LUTs";
        //set logfile path
        logbotjs_1.default.setPathToLogFile(this.getPathToUserData() + "/log.txt");
        this.pathToConfigFile = path_1.default.join(this.getPathToUserData(), "config.json");
        if (fs_1.default.existsSync(this.pathToConfigFile)) {
            this.config = JSON.parse(fs_1.default.readFileSync(this.pathToConfigFile).toString());
            if (!this.config["wb-version"] || this.config["wb-version"] !== this.versionNumber) {
                logbotjs_1.default.log(409, "Upgrading config from " + this.config.version + " to version " + this.versionNumber);
                this.set("wb-version", this.versionNumber);
                this.set("app-name", this.appName);
                this.set("auth-server", "https://wranglebot.io");
                this.set("ml-server", "https://ai.wranglebot.io");
                this.set("database", "https://db2.wranglebot.io");
                this.set("luts", pathToLUTs);
                this.set("jwt-secret", this.cryptr.encrypt(ezyrnd_1.ezyrnd.randomString(128)));
                this.set("port", 3300);
            }
        }
        else {
            logbotjs_1.default.log(100, "Creating config version " + this.versionNumber);
            this.config = {
                "jwt-secret": this.cryptr.encrypt(ezyrnd_1.ezyrnd.randomString(128)),
                "app-name": this.appName,
                "wb-version": this.versionNumber,
                "auth-server": "https://wranglebot.io",
                "ml-server": "https://ai.wranglebot.io",
                database: "https://db2.wranglebot.io",
                luts: pathToLUTs,
                port: 3300,
            };
            this.save();
        }
    }
    getPathToUserData() {
        return path_1.default.join(os_1.default.homedir(), this.appName);
    }
    set(key, value, encrypt = false) {
        if (encrypt) {
            value = this.cryptr.encrypt(value);
        }
        this.setConfig(key, value);
    }
    /**
     * Sets a Config value, if no value is found, it return
     *
     * @param key
     * @param value
     */
    setConfig(key, value) {
        this.config[key] = value;
        this.save();
    }
    get(key, decrypt = false) {
        const val = this.getConfig(key);
        if (decrypt) {
            return this.cryptr.decrypt(val);
        }
        return val;
    }
    getConfig(key) {
        return this.config[key];
    }
    save() {
        (0, write_file_atomic_1.sync)(this.pathToConfigFile, JSON.stringify(this.config, null, 2));
    }
}
const config = new Config();
exports.default = config;
//# sourceMappingURL=Config.js.map