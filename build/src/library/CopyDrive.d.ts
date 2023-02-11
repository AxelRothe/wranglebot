export class CopyDrive {
    constructor(template: any, options: any);
    /**
     * @type {"source"|"endpoint"|"generic"}
     */
    type: "source" | "endpoint" | "generic";
    /**
     * @type {string}
     */
    label: string;
    /**
     * @type {String[]}
     */
    tags: string[];
    query: any;
    _id: any;
    id: any;
    volume: any;
    update(document: any): void;
    wbType: any;
    /**
     * Returns the mountpoint of the device. the mountpoint needs to be grabbed from the local connected devices
     *
     * @return {string}
     */
    getMountpoint(): string;
    /**
     * Checks whether the drive is mounted to the system
     *
     * @return {boolean}
     */
    isMounted(): boolean;
    /**
     * Scans the drive and returns up to 10 level deep of folders as an array
     *
     * @return {string[]}
     */
    scan(options?: {
        limit: number;
        extended: boolean;
    }): string[];
    unmount(): void;
    /**
     * prepares the copydrive for the database
     * omits any private variables
     * @returns {{id: String, type: String, label: String, tags: String[], volume: String}}
     */
    prepareForDB(): {
        id: string;
        type: string;
        label: string;
        tags: string[];
        volume: string;
    };
    /**
     * Returns the drive as a string
     * @returns {{serialNumber, removable, wbType, isMounted: boolean, groups: string[], id: String, label, interface, mountpoint: string}}
     */
    toJSON(options?: {
        db: boolean;
    }): {
        serialNumber;
        removable;
        wbType;
        isMounted: boolean;
        groups: string[];
        id: string;
        label;
        interface;
        mountpoint: string;
    };
}
//# sourceMappingURL=CopyDrive.d.ts.map