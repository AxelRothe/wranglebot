declare const _exports: Config;
export = _exports;
declare class Config {
    appName: string;
    versionNumber: string;
    cryptr: any;
    pathToConfigFile: string;
    config: any;
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
//# sourceMappingURL=config.d.ts.map