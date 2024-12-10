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