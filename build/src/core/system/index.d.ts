export { finder };
export const config: {
    appName: string;
    versionNumber: string;
    cryptr: any;
    pathToConfigFile: string;
    config: any;
    getPathToUserData(): string;
    set(key: any, value: any, encrypt?: boolean): void;
    setConfig(key: any, value: any): void;
    get(key: any, decrypt?: boolean): any;
    getConfig(key: any): any;
    save(): void;
};
import finder = require("./finder");
//# sourceMappingURL=index.d.ts.map