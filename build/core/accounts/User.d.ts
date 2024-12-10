export default class User {
    id: any;
    username: any;
    password: any;
    firstName: any;
    lastName: any;
    email: any;
    roles: string[];
    libraries: never[];
    config: any;
    query: any;
    token: string;
    constructor(options: any);
    get fullName(): string;
    update(options: any): void;
    hasRole(role: string | string[]): boolean;
    setConfig(options: any): void;
    toJSON(options?: {
        db: boolean;
    }): {
        id: any;
        username: any;
        firstName: any;
        lastName: any;
        password: any;
        email: any;
        roles: string[];
        libraries: never[];
        config: any;
    };
}
//# sourceMappingURL=User.d.ts.map