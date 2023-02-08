const path = require("path");
const os = require("os");
const fs = require("fs");
const { ezyrnd } = require("ezyrnd");
const LogBot = require("logbotjs");
const finder = require("./finder");
const Cryptr = require("cryptr");
const writeFileAtomicSync = require("write-file-atomic").sync;

class Config {
  appName = require("../../package.json").appName;
  versionNumber = "6";
  cryptr = new Cryptr("c9b7fd52-e1c7-4c23-9e7f-75639b91f276");

  constructor() {
    /**
     * Build
     */
    const build = () => {
      if (!finder.existsSync(finder.getPathToUserData(this.appName))) {
        finder.mkdirSync(finder.getPathToUserData(this.appName));
        if (!finder.existsSync(finder.getPathToUserData(this.appName))) {
          LogBot.log(500, "Unable to create config directory. No permissions?");
          process.exit(1);
        } else {
          LogBot.log(100, "Creating new config in homedir...");
        }
      } else {
        LogBot.log(100, "Loading config from homedir...");
      }
    };
    build();

    //copy luts to homedir
    let pathToLUTs = this.getPathToUserData() + "/LUTs";

    if (!finder.existsSync(pathToLUTs)) {
      finder.mkdirSync(pathToLUTs, { recursive: true });
      let luts = finder.getContentOfFolder(path.join(__dirname, "../../../assets/luts"));
      for (let lut of luts) {
        if (lut.startsWith(".")) continue;
        finder.copy(finder.join(__dirname, "..", "..", "..", "assets/luts/", lut), path.join(pathToLUTs, lut));
      }
    }

    //set logfile path
    LogBot.setPathToLogFile(this.getPathToUserData() + "/log.txt");

    this.pathToConfigFile = path.join(this.getPathToUserData(), "config.json");

    if (fs.existsSync(this.pathToConfigFile)) {
      this.config = JSON.parse(fs.readFileSync(this.pathToConfigFile).toString());

      if (!this.config["wb-version"] || this.config["wb-version"] !== this.versionNumber) {
        //is version 1 upgrade to version 3
        LogBot.log(409, "Upgrading config from " + this.config.version + " to version " + this.versionNumber);
        this.set("wb-version", this.versionNumber);
        this.set("appName", this.appName);
        this.set("database", "https://db2.wranglebot.io");
        this.set("luts", pathToLUTs);
        this.set("jwt-secret", this.cryptr.encrypt(ezyrnd.randomString(128)));
      }
    } else {
      LogBot.log(100, "Creating config version " + this.versionNumber);
      this.config = {
        "jwt-secret": this.cryptr.encrypt(ezyrnd.randomString(128)),
        appName: this.appName,
        "wb-version": this.versionNumber,
        database: "https://db2.wranglebot.io",
        luts: pathToLUTs,
      };
      this.save();
    }
  }

  getPathToUserData() {
    return path.join(os.homedir(), this.appName);
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
    writeFileAtomicSync(this.pathToConfigFile, JSON.stringify(this.config, null, 2));
  }
}
module.exports = new Config();
