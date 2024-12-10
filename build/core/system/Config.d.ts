import Cryptr from "cryptr";
declare class Config {
    appName: string;
    versionNumber: string;
    cryptr: Cryptr;
    pathToConfigFile: string;
    appDataLocation: string;
    config: any;
    constructor();
    build(appDataLocation?: string): void;
    getPathToUserData(): string;
    set(key: any, value: any, encrypt?: boolean): void;
    setConfig(key: any, value: any): void;
    get(key: any, decrypt?: boolean): any;
    getConfig(key: any): any;
    save(): void;
}
declare const config: Config;
export default config;
//# sourceMappingURL=Config.d.ts.map