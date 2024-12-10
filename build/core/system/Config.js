import path from "path";
import fs from "fs";
import { ezyrnd } from "ezyrnd";
import LogBot from "logbotjs";
import finder from "./finder.js";
import Cryptr from "cryptr";
import { sync as writeFileAtomicSync } from "write-file-atomic";
class Config {
    constructor() {
        this.appName = "wranglebot";
        this.versionNumber = "9";
        this.cryptr = new Cryptr("c9b7fd52-e1c7-4c23-9e7f-75639b91f276");
        this.pathToConfigFile = "./wb_data/config.json";
        this.appDataLocation = "./wb_data";
    }
    build(appDataLocation) {
        if (appDataLocation)
            this.appDataLocation = appDataLocation;
        const build = () => {
            if (!finder.existsSync(this.appDataLocation)) {
                finder.mkdirSync(this.appDataLocation);
                if (!finder.existsSync(this.appDataLocation)) {
                    LogBot.log(500, "Unable to create config directory. No permissions?");
                    process.exit(1);
                }
                else {
                    LogBot.log(100, "Creating new config in homedir...");
                }
            }
            else {
                LogBot.log(100, "Loading config from homedir...");
            }
        };
        build();
        LogBot.setPathToLogFile(this.appDataLocation + "/log.txt");
        this.pathToConfigFile = path.join(this.appDataLocation, "config.json");
        if (finder.existsSync(this.pathToConfigFile)) {
            this.config = JSON.parse(fs.readFileSync(this.pathToConfigFile).toString());
            if (!this.config["wb-version"] || this.config["wb-version"] !== this.versionNumber) {
                LogBot.log(409, "Upgrading config from " + this.config.version + " to version " + this.versionNumber);
                this.set("wb-version", this.versionNumber);
                this.set("jwt-secret", this.cryptr.encrypt(ezyrnd.randomString(128)));
                this.set("port", 3300);
            }
        }
        else {
            LogBot.log(100, "Creating config version " + this.versionNumber);
            this.config = {
                "jwt-secret": this.cryptr.encrypt(ezyrnd.randomString(128)),
                "wb-version": this.versionNumber,
                port: 3300,
            };
            this.save();
        }
    }
    getPathToUserData() {
        return this.appDataLocation;
    }
    set(key, value, encrypt = false) {
        if (encrypt) {
            value = this.cryptr.encrypt(value);
        }
        this.setConfig(key, value);
    }
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
        writeFileAtomicSync(this.pathToConfigFile, JSON.stringify(this.config, null, 2));
    }
}
const config = new Config();
export default config;
//# sourceMappingURL=Config.js.map