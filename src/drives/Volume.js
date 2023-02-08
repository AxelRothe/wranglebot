const { finder } = require("../system");
const md5 = require("md5");

class Volume {
  label = "";
  mountpoint = "";
  serialNumber = "";
  interface = "";
  removable = false;
  status = "offline";
  volumeId = "";

  constructor(drive) {
    const parsedLabel = drive.mount.match(new RegExp("(?<!/ )[^/]*$"));
    if (parsedLabel.length > 0) {
      this.label = parsedLabel[0] !== "" ? parsedLabel[0] : parsedLabel[0] === "" && finder.isMac() ? "Macintosh HD" : "Unknown";
    } else {
      this.label = drive.label;
    }

    this.host = drive.host;
    this.mountpoint = drive.mount;
    this.fs = drive.fs;
    this.removable = drive.interface === "USB";
    this.serialNumber = drive.serialNumber;
    this.size = drive.size;
    this.free = drive.available;
    this.interface = drive.interface;

    this.volumeId = md5(this.label + this.size.toString());

    if (finder.isReachable(this.mountpoint)) {
      this.status = "online";
    }
  }

  get used() {
    return this.size - this.free;
  }

  scan(options = { limit: 10, extended: false }) {
    if (options.extended) {
      const fullPaths = finder.getFolders(this.mountpoint, options.limit);

      //trim paths of mountpoint
      const trimmedPaths = fullPaths.map((path) => path.replace(this.mountpoint, ""));

      return {
        mountpoint: this.mountpoint,
        paths: trimmedPaths,
      };
    }
    return [this.mountpoint, ...finder.getFolders(this.mountpoint, options.limit)];
  }

  /**
   * Returns a JSON friendly representation of the drive
   *
   * @return {{label: string, removable: boolean, mountpoint: string, size: number,  used: number, free: number}}
   */
  print() {
    return {
      mountpoint: this.mountpoint,
      volumeId: this.volumeId,
      fs: this.fs,
      serialNumber: this.serialNumber,
      label: this.label,
      host: this.host,
      interface: this.interface,
      free: this.free,
      size: this.size,
      used: this.size - this.free,
    };
  }

  get stats() {
    return this.print();
  }
}

module.exports.Volume = Volume;
