import { finder } from "../system";
import { SearchLite } from "searchlite";
import ReturnObject from "../utility/SendBack";
import { Volume } from "./Volume";
import LogBot from "logbotjs";
import EventEmitter from "events";
import { FSWatcher } from "fs";

class DriveBot extends EventEmitter {
  /**
   * @wbType {Volume[]}
   */
  drives: any = [];
  verbose;
  watchers = [];
  private watcher: FSWatcher | null = null;

  constructor() {
    super();
  }

  /**
   * Starts listening to changes to mounted volumes
   *
   * @example
   * driveBot.watch(["mylib1, mylib2"]);
   *
   * @fires DriveBot#removed
   * @fires DriveBot#added
   *
   */
  watch() {
    this.watcher = finder.watch(finder.pathToVolumes, (eventType, volumeName) => {
      if (eventType === "rename") {
        this.getDrive(volumeName).then((drive) => {
          if (drive) {
            const oldDrive = drive;
            this.drives.splice(this.drives.indexOf(drive), 1);
            LogBot.log(200, "Volume removed: " + volumeName);
            this.emit("removed", oldDrive);
          } else {
            this.scan()
              .then((allDrives) => {
                const search = SearchLite.find(allDrives, "label", volumeName);
                if (search.wasSuccess()) {
                  this.drives.push(search.result);
                  LogBot.log(200, "Volume added: " + volumeName);
                  this.emit("added", search.result);
                }
              })
              .catch((e) => {
                console.error(e);
              });
          }
        });
      }
    });
  }

  hasWatcher() {
    return this.watcher !== null;
  }

  stopWatching() {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
  }

  /**
   * scans all mounted drives and returns an Array of Drives
   * @return {Promise<Volume[]>}
   */
  async scan() {
    return new Promise((resolve) => {
      let newDrives: any = [];

      finder.getDisks().then(async (drives) => {
        for (let drive of drives) {
          const newDrive = new Volume(drive);
          newDrives.push(newDrive);
        }
        resolve(newDrives);
      });
    });
  }

  async updateDrives() {
    if (this.drives.length === 0) this.drives = await this.scan();
  }

  async getDriveById(id) {
    await this.updateDrives();

    return this.drives.find((drive) => drive.volumeId === id);
  }

  async eject(id) {
    return new Promise((resolve) => {
      this.getDriveById(id).then((vol) => {
        if (vol) {
          finder.eject(vol.mountpoint, (error) => {
            if (!error) {
              LogBot.log(200, "Ejected " + vol.label);
              resolve(true);
            } else {
              LogBot.log(500, "Error ejecting drive: " + error);
              resolve(false);
            }
          });
        }
      });
    });
  }

  async ejectDevice(deviceName) {
    return new Promise((resolve) => {
      let search = SearchLite.find(this.drives, "label", deviceName);
      if (search.wasSuccess()) {
        if (search.result.status === "offline") {
          this.drives.splice(search.count, 1);
          resolve(
            new ReturnObject({
              status: 200,
              message: deviceName + " was offline, so I removed it.",
            })
          );
        } else {
          finder.eject(search.result.mountpoint, (error) => {
            if (!error) {
              this.drives.splice(search.count, 1);
              resolve(
                new ReturnObject({
                  status: 200,
                  message: "I have successfully ejected the drive " + deviceName,
                })
              );
            } else {
              resolve(
                new ReturnObject({
                  status: 500,
                  message: "I was unable to eject the drive " + deviceName,
                })
              );
            }
          });
        }
      }
    });
  }

  async getDrive(driveName) {
    await this.updateDrives();

    let search = SearchLite.find(this.drives, "label", driveName);
    if (search.wasSuccess()) {
      return search.result;
    }
    return false;
  }

  getDriveByMountpoint(mountpoint) {
    if (this.drives.length === 0) throw new Error("No drives found");

    let search = SearchLite.find(this.drives, "mountpoint", mountpoint);
    if (search.wasSuccess()) {
      return search.result;
    }
    return false;
  }

  async getDriveBySerial(serialNumber) {
    await this.updateDrives();

    let search = SearchLite.find(this.drives, "serialNumber", serialNumber);
    if (search.wasSuccess()) {
      return search.result;
    }
    return false;
  }

  async getDrives() {
    await this.updateDrives();
    return this.drives;
  }

  async getMountPoint(mountpoint) {
    await this.updateDrives();

    let search = SearchLite.find(this.drives, "mountpoint", mountpoint);
    if (search.wasSuccess()) {
      return search.result.mountpoint;
    }
    return "";
  }

  async getCurrentVolumeName(serialNumber) {
    const driveToCheck = await this.getDriveBySerial(serialNumber);
    if (driveToCheck) {
      return driveToCheck.label;
    }
    return "";
  }

  log(message, type) {
    LogBot.log(`DriveBot:${type}`, message, this.verbose);
  }
}
const driveBot = new DriveBot();
export { driveBot, DriveBot };
