declare class Volume {
    label: string;
    mountpoint: string;
    serialNumber: string;
    interface: string;
    removable: boolean;
    status: string;
    volumeId: string;
    host: string;
    fs: string;
    size: number;
    free: number;
    query: any;
    constructor(drive: any);
    get used(): number;
    scan(options?: {
        limit: number;
        extended: boolean;
    }): any[] | {
        mountpoint: string;
        paths: any;
    };
    /**
     * Returns a JSON friendly representation of the drive
     *
     * @return {{label: string, removable: boolean, mountpoint: string, size: number,  used: number, free: number}}
     */
    print(): {
        mountpoint: string;
        volumeId: string;
        fs: string;
        serialNumber: string;
        label: string;
        host: string;
        interface: string;
        free: number;
        size: number;
        used: number;
    };
    get stats(): {
        mountpoint: string;
        volumeId: string;
        fs: string;
        serialNumber: string;
        label: string;
        host: string;
        interface: string;
        free: number;
        size: number;
        used: number;
    };
}
export { Volume };
//# sourceMappingURL=Volume.d.ts.map