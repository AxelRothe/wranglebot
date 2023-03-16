export class Volume {
    constructor(drive: any);
    label: string;
    mountpoint: string;
    serialNumber: string;
    interface: string;
    removable: boolean;
    status: string;
    volumeId: string;
    host: any;
    fs: any;
    size: any;
    free: any;
    get used(): number;
    scan(options?: {
        limit: number;
        extended: boolean;
    }): string[] | {
        mountpoint: string;
        paths: string[];
    };
    /**
     * Returns a JSON friendly representation of the drive
     *
     * @return {{label: string, removable: boolean, mountpoint: string, size: number,  used: number, free: number}}
     */
    print(): {
        label: string;
        removable: boolean;
        mountpoint: string;
        size: number;
        used: number;
        free: number;
    };
    get stats(): {
        label: string;
        removable: boolean;
        mountpoint: string;
        size: number;
        used: number;
        free: number;
    };
}
//# sourceMappingURL=Volume.d.ts.map