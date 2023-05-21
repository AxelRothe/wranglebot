import Cryptr from "cryptr";
declare class Config {
    appName: string;
    versionNumber: string;
    cryptr: Cryptr;
    pathToConfigFile: string;
    config: any;
    constructor();
    getPathToUserData(): string;
    set(key: any, value: any, encrypt?: boolean): void;
    /**
     * Sets a Config value, if no value is found, it return
     *
     * @param key
     * @param value
     */
    setConfig(key: any, value: any): void;
    get(key: any, decrypt?: boolean): any;
    getConfig(key: any): any;
    save(): void;
}
declare const config: Config;
export default config;
//# sourceMappingURL=Config.d.ts.map